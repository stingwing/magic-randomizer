import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as signalR from '@microsoft/signalr'
import { apiBase, signalRBase } from './api'
import {
    validateCommander,
    validateTurnCount,
    validatePlayerOrder,
    validateWinCondition,
    validateBracket,
    validateUrlParam,
    RateLimiter
} from './utils/validation'
import { calculateTimeRemaining } from './utils/timerUtils'
import { useCommanderSearch } from './utils/commanderSearch'
import { styles } from './styles/Room.styles'

// Rate limiter for report actions
const reportRateLimiter = new RateLimiter(10, 60000) // 10 reports per minute

function RoundCountdownTimer({ startedAtUtc, roundLength, roundStarted }) {
    const [timeRemaining, setTimeRemaining] = useState(null)

    useEffect(() => {
        if (!roundStarted || !startedAtUtc || !roundLength) {
            setTimeRemaining(null)
            return
        }

        const updateTimer = () => {
            const timerData = calculateTimeRemaining(startedAtUtc, roundLength)
            setTimeRemaining(timerData)
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [startedAtUtc, roundLength, roundStarted])

    if (!roundStarted || !timeRemaining) return null

    return (
        <div style={styles.timerDisplay}>
            <span style={styles.timerIcon}>⏱️</span>
            <div style={styles.timerContent}>
                <span style={styles.timerLabel}>Time Remaining:</span>
                <span style={{
                    ...styles.timerValue,
                    color: timeRemaining.isNegative ? '#ff4444' : 'inherit'
                }}>
                    {timeRemaining.display}
                </span>
            </div>
        </div>
    )
}

function RoundResults({ data }) {
    if (!data) return <div style={styles.noResults}>No results returned.</div>

    const { roomCode, participantId, groupNumber, members, round, result, winner, draw, startedAtUtc, roundStarted, roundLength } = data

    return (
        <div style={styles.resultsCard}>
            <div style={styles.resultsHeader}>
                <h3 style={styles.resultsTitle}>Your Group Assignment</h3>
                <RoundCountdownTimer 
                    startedAtUtc={startedAtUtc} 
                    roundLength={roundLength}
                    roundStarted={roundStarted}
                />
            </div>

            <div style={styles.resultDetails}>
                <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Round:</span>
                    <span style={styles.detailValue}>{round ?? 'N/A'}</span>
                </div>
                <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Group Number:</span>
                    <span style={styles.detailValue}>{groupNumber ?? 'N/A'}</span>
                </div>
                {roundStarted && (
                    <>
                        <div style={styles.detailRow}>
                            <span style={styles.detailLabel}>Result Reported:</span>
                            <span style={styles.detailValue}>{result ? '✅ Yes' : '⏳ No'}</span>
                        </div>
                        {winner !== undefined && winner !== null && (
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Winner:</span>
                                <span style={{...styles.detailValue, color: 'var(--success-color)', fontWeight: '600'}}>
                                    🏆 {winner}
                                </span>
                            </div>
                        )}
                        {draw !== undefined && (
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Draw:</span>
                                <span style={styles.detailValue}>{draw ? '✅ Yes' : '❌ No'}</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {members && Array.isArray(members) && members.length > 0 && (
                <div style={styles.membersSection}>
                    <h4 style={styles.membersTitle}>Group Members</h4>
                    <ul style={styles.membersList}>
                        {members.map((member, idx) => {
                            const isYou = member.id === participantId
                            return (
                                <li 
                                    key={idx} 
                                    style={{
                                        ...styles.memberItem,
                                        ...(isYou ? styles.memberItemYou : {})
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div>
                                            {member.name ?? member.id ?? 'Unknown'}
                                            {isYou && <span style={styles.youBadge}>YOU</span>}
                                        </div>
                                        {member.commander && (
                                            <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                Commander: {member.commander}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default function RoomPage() {
    const { code, participantId } = useParams()
    const navigate = useNavigate()
    const [roomData, setRoomData] = useState(null)
    const [roomError, setRoomError] = useState(null)
    const [roomLoading, setRoomLoading] = useState(false)
    const [started, setStarted] = useState(false)
    const [groupResult, setGroupResult] = useState(null)
    const [reportLoading, setReportLoading] = useState(false)
    const [reportMessage, setReportMessage] = useState(null)
    const pollRef = useRef(null)
    const hubConnectionRef = useRef(null)
    const lastUpdatedRef = useRef(null)

    // Statistics state
    const [commander, setCommander] = useState('')
    const [partner, setPartner] = useState('')
    const [showPartner, setShowPartner] = useState(false)
    const [turnCount, setTurnCount] = useState('')
    const [playerOrder, setPlayerOrder] = useState('')
    const [winCondition, setWinCondition] = useState('')
    const [bracket, setBracket] = useState('')
    
    // Validation errors state
    const [validationErrors, setValidationErrors] = useState({})

    // Use commander search hooks
    const commanderSearch = useCommanderSearch(300)
    const partnerSearch = useCommanderSearch(300)

    // Validated URL parameters
    const [validatedCode, setValidatedCode] = useState('')
    const [validatedParticipantId, setValidatedParticipantId] = useState('')
    const [connectionStatus, setConnectionStatus] = useState('disconnected')

    useEffect(() => {
        // Validate URL parameters
        const codeValidation = validateUrlParam(code)
        const participantValidation = validateUrlParam(participantId)

        if (!codeValidation.valid || !participantValidation.valid) {
            navigate('/')
            return
        }

        setValidatedCode(codeValidation.sanitized)
        setValidatedParticipantId(participantValidation.sanitized)
    }, [code, participantId, navigate])

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Only close commander dropdown if clicking outside both commander input and dropdown
            if (
                commanderSearch.dropdownRef.current &&
                !commanderSearch.dropdownRef.current.contains(event.target) &&
                commanderSearch.inputRef.current &&
                !commanderSearch.inputRef.current.contains(event.target)
            ) {
                commanderSearch.setShowDropdown(false)
            }
            
            // Only close partner dropdown if clicking outside both partner input and dropdown
            if (
                partnerSearch.dropdownRef.current &&
                !partnerSearch.dropdownRef.current.contains(event.target) &&
                partnerSearch.inputRef.current &&
                !partnerSearch.inputRef.current.contains(event.target)
            ) {
                partnerSearch.setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [commanderSearch, partnerSearch])

    const handleCommanderChange = (e) => {
        const value = e.target.value
        const validated = validateCommander(value)
        setCommander(validated.sanitized)
        
        // Persist to sessionStorage
        if (validatedCode && validatedParticipantId) {
            const storageKey = `commander_${validatedCode}_${validatedParticipantId}`
            if (validated.sanitized) {
                sessionStorage.setItem(storageKey, validated.sanitized)
            } else {
                sessionStorage.removeItem(storageKey)
            }
        }
        
        if (validated.error) {
            setValidationErrors(prev => ({ ...prev, commander: validated.error }))
        } else {
            setValidationErrors(prev => {
                const { commander, ...rest } = prev
                return rest
            })
        }

        // Use the debounced search from the hook
        commanderSearch.debouncedSearch(validated.sanitized)
    }

    const handleCommanderSelect = (commanderName) => {
        const validated = validateCommander(commanderName)
        setCommander(validated.sanitized)
        commanderSearch.setShowDropdown(false)
        commanderSearch.clearSearch()
        
        // Persist to sessionStorage
        if (validatedCode && validatedParticipantId && validated.sanitized) {
            const storageKey = `commander_${validatedCode}_${validatedParticipantId}`
            sessionStorage.setItem(storageKey, validated.sanitized)
        }
        
        // Clear any validation errors
        setValidationErrors(prev => {
            const { commander, ...rest } = prev
            return rest
        })
    }

    const handlePartnerChange = (e) => {
        const value = e.target.value
        const validated = validateCommander(value)
        setPartner(validated.sanitized)

        if (validated.error) {
            setValidationErrors(prev => ({ ...prev, partner: validated.error }))
        } else {
            setValidationErrors(prev => {
                const { partner, ...rest } = prev
                return rest
            })
        }

        // Use the debounced search from the hook
        partnerSearch.debouncedSearch(validated.sanitized)
    }

    const handlePartnerSelect = (partnerName) => {
        const validated = validateCommander(partnerName)
        setPartner(validated.sanitized)
        partnerSearch.setShowDropdown(false)
        partnerSearch.clearSearch()
        
        // Clear any validation errors
        setValidationErrors(prev => {
            const { partner, ...rest } = prev
            return rest
        })
    }

    const handleTogglePartner = () => {
        const newShowPartner = !showPartner
        setShowPartner(newShowPartner)
        
        if (!newShowPartner) {
            // Clear partner field when hiding
            setPartner('')
            partnerSearch.clearSearch()
            setValidationErrors(prev => {
                const { partner, ...rest } = prev
                return rest
            })
        }
    }

    const handleTurnCountChange = (e) => {
        const validated = validateTurnCount(e.target.value)
        setTurnCount(validated.sanitized)
    }

    const handlePlayerOrderChange = (e) => {
        const validated = validatePlayerOrder(e.target.value)
        setPlayerOrder(validated.sanitized)
        
        if (validated.error) {
            setValidationErrors(prev => ({ ...prev, playerOrder: validated.error }))
        } else {
            setValidationErrors(prev => {
                const { playerOrder, ...rest } = prev
                return rest
            })
        }
    }

    const handleWinConditionChange = (e) => {
        const validated = validateWinCondition(e.target.value)
        setWinCondition(validated.sanitized)
        
        if (validated.error) {
            setValidationErrors(prev => ({ ...prev, winCondition: validated.error }))
        } else {
            setValidationErrors(prev => {
                const { winCondition, ...rest } = prev
                return rest
            })
        }
    }

    const handleBracketChange = (e) => {
        const validated = validateBracket(e.target.value)
        setBracket(validated.sanitized)
    }

    const fetchGroupResult = async () => {
        if (!validatedCode || !validatedParticipantId) return false
        const url = `${apiBase}/${encodeURIComponent(validatedCode)}/group/${encodeURIComponent(validatedParticipantId)}`
        setRoomLoading(true)
        try {
            const res = await fetch(url)

            if (res.status === 404 || res.status === 204) {
                return false
            }

            if (!res.ok) {
                const safeMessage = 'Unable to fetch group information'
                throw new Error(safeMessage)
            }

            const data = await res.json().catch(() => null)
            if (data) {
                setGroupResult(data)
                setStarted(true)
                
                // Populate commander and partner fields from API response
                if (data.members && Array.isArray(data.members)) {
                    const currentMember = data.members.find(m => m.id === validatedParticipantId)
                    if (currentMember && currentMember.commander && currentMember.commander.trim() !== '') {
                        const commanderValue = currentMember.commander.trim()
                        
                        // Check if it contains a partner (separated by " : ")
                        if (commanderValue.includes(' : ')) {
                            const [cmd, prt] = commanderValue.split(' : ')
                            setCommander(cmd.trim())
                            setPartner(prt.trim())
                            setShowPartner(true)
                        } else {
                            setCommander(commanderValue)
                            setPartner('')
                            setShowPartner(false)
                        }
                    }
                }
                
                // Populate statistics fields from API response
                if (data.statistics) {
                    // Update Bracket
                    if (data.statistics.Bracket !== undefined && data.statistics.Bracket !== null) {
                        const bracketValidated = validateBracket(data.statistics.Bracket)
                        if (bracketValidated.valid) {
                            setBracket(bracketValidated.sanitized)
                        }
                    }
                    
                    // Update Turn Count
                    if (data.statistics.TurnCount !== undefined && data.statistics.TurnCount !== null) {
                        const turnCountValidated = validateTurnCount(data.statistics.TurnCount)
                        if (turnCountValidated.valid) {
                            setTurnCount(turnCountValidated.sanitized)
                        }
                    }
                    
                    // Update Player Order
                    if (data.statistics.PlayerOrder !== undefined && data.statistics.PlayerOrder !== null) {
                        const playerOrderValidated = validatePlayerOrder(data.statistics.PlayerOrder)
                        if (playerOrderValidated.valid) {
                            setPlayerOrder(playerOrderValidated.sanitized)
                        }
                    }
                    
                    // Update Win Condition
                    if (data.statistics.WinCondition !== undefined && data.statistics.WinCondition !== null) {
                        const winConditionValidated = validateWinCondition(data.statistics.WinCondition)
                        if (winConditionValidated.valid) {
                            setWinCondition(winConditionValidated.sanitized)
                        }
                    }
                }
                
                return true
            }
            return false
        } catch (err) {
            console.error('Error fetching group result', err)
            setRoomError('Unable to load group information')
            return false
        } finally {
            setRoomLoading(false)
        }
    }

    const checkIfStarted = data => {
        if (!data) return false
        if (data.started === true || data.gameStarted === true || data.grouped === true) return true
        if (typeof data.status === 'string' && data.status.toLowerCase().includes('start')) return true
        if (data.groups || data.group || data.groupResult || data.grouping) return true
        return false
    }

    const fetchRoom = async () => {
        if (!validatedCode) return
        const roomUrl = `${apiBase}/${encodeURIComponent(validatedCode)}`
        setRoomLoading(true)
        setRoomError(null)
        try {
            const res = await fetch(roomUrl)
            if (!res.ok) {
                const safeMessage = res.status === 404 ? 'Room not found' : 'Unable to load room'
                throw new Error(safeMessage)
            }
            const data = await res.json().catch(() => null)
            setRoomData(data)
            lastUpdatedRef.current = new Date()

            if (!started) {
                if (checkIfStarted(data)) {
                    await fetchGroupResult()
                } else {
                    await fetchGroupResult()
                }
            }
        } catch (err) {
            console.error('Error fetching room', err)
            setRoomError(err.message || 'Unable to load room')
        } finally {
            setRoomLoading(false)
        }
    }

    const buildStatistics = () => {
        const statistics = {}
        
        // Validate all statistics before building
        const commanderVal = validateCommander(commander)
        const partnerVal = validateCommander(partner)
        const turnCountVal = validateTurnCount(turnCount)
        const playerOrderVal = validatePlayerOrder(playerOrder)
        const winConditionVal = validateWinCondition(winCondition)
        const bracketVal = validateBracket(bracket)
        
        // Combine commander and partner if both are present
        if (commanderVal.sanitized && commanderVal.valid) {
            let commanderValue = commanderVal.sanitized
            if (partnerVal.sanitized && partnerVal.valid) {
                commanderValue = `${commanderVal.sanitized} : ${partnerVal.sanitized}`
            }
            statistics[`${validatedParticipantId}_Commander`] = commanderValue
        }
        
        if (turnCountVal.sanitized && turnCountVal.valid) {
            statistics['TurnCount'] = turnCountVal.sanitized
        }
        if (playerOrderVal.sanitized && playerOrderVal.valid) {
            statistics['PlayerOrder'] = playerOrderVal.sanitized
        }
        if (bracketVal.sanitized && bracketVal.valid) {
            statistics['Bracket'] = bracketVal.sanitized
        }
        if (winConditionVal.sanitized && winConditionVal.valid) {
            statistics['WinCondition'] = winConditionVal.sanitized
        }

        return statistics
    }

    const handleReportResult = async (result) => {
        if (!validatedCode || !validatedParticipantId) return

        // Show confirmation dialog for Drop action
        if (result === 'drop') {
            if (!window.confirm('Are you sure you want to drop from this game?')) {
                return
            }
        }

        // Check for validation errors
        if (Object.keys(validationErrors).length > 0) {
            setRoomError('Please fix validation errors before submitting')
            return
        }

        // Check rate limiting
        if (!reportRateLimiter.canAttempt(validatedParticipantId)) {
            setRoomError('Too many report attempts. Please wait a moment.')
            return
        }

        // Validate result value
        const validResults = ['win', 'draw', 'drop', 'data']
        if (!validResults.includes(result)) {
            setRoomError('Invalid result type')
            return
        }

        setReportLoading(true)
        setReportMessage(null)
        setRoomError(null)

        try {
            const url = `${apiBase}/${encodeURIComponent(validatedCode)}/report`
            const statistics = buildStatistics()

            // Combine commander and partner for the commander field
            const commanderVal = validateCommander(commander)
            const partnerVal = validateCommander(partner)
            let commanderValue = ''


            if (commanderVal.sanitized && commanderVal.valid) {
                commanderValue = commanderVal.sanitized
                if (partnerVal.sanitized && partnerVal.valid) {
                    commanderValue = `${commanderVal.sanitized} : ${partnerVal.sanitized}`
                }
            }

            const body = {
                participantId: validatedParticipantId,
                result: result,
                commander: commanderValue,
                statistics: statistics
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                const safeMessage = res.status === 400
                    ? 'Invalid request'
                    : 'Unable to submit report'
                throw new Error(safeMessage)
            }

            const data = await res.json().catch(() => null)

            // Update group result with response data
            if (data && groupResult) {
                setGroupResult(prevResult => ({
                    ...prevResult,
                    members: data.members || prevResult.members,
                    statistics: data.statistics || prevResult.statistics,
                    result: data.result !== undefined ? (data.result === 'data' ? prevResult.result : true) : prevResult.result,
                    winner: data.winnerParticipantId || prevResult.winner
                }))

                // Update local statistics fields from response if they exist
                if (data.statistics) {
                    // Update Bracket
                    if (data.statistics.Bracket !== undefined && data.statistics.Bracket !== null) {
                        const bracketValidated = validateBracket(data.statistics.Bracket)
                        if (bracketValidated.valid) {
                            setBracket(bracketValidated.sanitized)
                        }
                    }

                    // Update Turn Count
                    if (data.statistics.TurnCount !== undefined && data.statistics.TurnCount !== null) {
                        const turnCountValidated = validateTurnCount(data.statistics.TurnCount)
                        if (turnCountValidated.valid) {
                            setTurnCount(turnCountValidated.sanitized)
                        }
                    }

                    // Update Player Order
                    if (data.statistics.PlayerOrder !== undefined && data.statistics.PlayerOrder !== null) {
                        const playerOrderValidated = validatePlayerOrder(data.statistics.PlayerOrder)
                        if (playerOrderValidated.valid) {
                            setPlayerOrder(playerOrderValidated.sanitized)
                        }
                    }

                    // Update Win Condition
                    if (data.statistics.WinCondition !== undefined && data.statistics.WinCondition !== null) {
                        const winConditionValidated = validateWinCondition(data.statistics.WinCondition)
                        if (winConditionValidated.valid) {
                            setWinCondition(winConditionValidated.sanitized)
                        }
                    }
                }

                // Update commander/partner from response members array
                if (data.members && Array.isArray(data.members)) {
                    const currentMember = data.members.find(m => m.id === validatedParticipantId)
                    if (currentMember && currentMember.commander) {
                        const responseCommander = currentMember.commander.trim()

                        // Only update if it's different from what we currently have
                        const currentCombined = partner
                            ? `${commander} : ${partner}`.trim()
                            : commander.trim()

                        if (responseCommander !== currentCombined && responseCommander !== '') {
                            // Check if it contains a partner (separated by " : ")
                            if (responseCommander.includes(' : ')) {
                                const [cmd, prt] = responseCommander.split(' : ')
                                setCommander(cmd.trim())
                                setPartner(prt.trim())
                                setShowPartner(true)
                            } else {
                                setCommander(responseCommander)
                                setPartner('')
                                setShowPartner(false)
                            }
                        }
                    }
                }
            }

            setReportMessage(
                data && data.message
                    ? data.message
                    : `${result} reported successfully`
            )

            // Clear statistics after successful submission (only for win/draw/drop, not data updates)
            if (result !== 'data') {
                setCommander('')
                setPartner('')
                setShowPartner(false)
                setTurnCount('')
                setPlayerOrder('')
                setWinCondition('')
                setBracket('')
            }

            // SignalR will update automatically, but refresh for immediate feedback
            await fetchGroupResult()
        } catch (err) {
            console.error('Report result error', err)
            setRoomError(err.message || 'Unable to submit report')
        } finally {
            setReportLoading(false)
        }
    }

    const handleUpdateStatistics = async () => {
        await handleReportResult('data')
    }

    const handleUpdateCommander = async () => {
        if (!validatedCode || !validatedParticipantId) return

        // Check for validation errors
        const commanderErrors = {}
        if (validationErrors.commander) commanderErrors.commander = validationErrors.commander
        if (validationErrors.partner) commanderErrors.partner = validationErrors.partner
        
        if (Object.keys(commanderErrors).length > 0) {
            setRoomError('Please fix validation errors before updating commander')
            return
        }

        // Check rate limiting
        if (!reportRateLimiter.canAttempt(validatedParticipantId)) {
            setRoomError('Too many update attempts. Please wait a moment.')
            return
        }

        setReportLoading(true)
        setReportMessage(null)
        setRoomError(null)

        try {
            const url = `${apiBase}/${encodeURIComponent(validatedCode)}/report`

            // Combine commander and partner for the commander field
            const commanderVal = validateCommander(commander)
            const partnerVal = validateCommander(partner)
            let commanderValue = ''

            if (commanderVal.sanitized && commanderVal.valid) {
                commanderValue = commanderVal.sanitized
                if (partnerVal.sanitized && partnerVal.valid) {
                    commanderValue = `${commanderVal.sanitized} : ${partnerVal.sanitized}`
                }
            }

            const body = {
                participantId: validatedParticipantId,
                result: 'data',
                commander: commanderValue,
                statistics: {}
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                const safeMessage = res.status === 400
                    ? 'Invalid request'
                    : 'Unable to update commander'
                throw new Error(safeMessage)
            }

            const data = await res.json().catch(() => null)

            // Update group result with response data
            if (data && groupResult) {
                setGroupResult(prevResult => ({
                    ...prevResult,
                    members: data.members || prevResult.members
                }))

                // Update commander/partner from response members array
                if (data.members && Array.isArray(data.members)) {
                    const currentMember = data.members.find(m => m.id === validatedParticipantId)
                    if (currentMember && currentMember.commander) {
                        const responseCommander = currentMember.commander.trim()

                        // Only update if it's different from what we currently have
                        const currentCombined = partner
                            ? `${commander} : ${partner}`.trim()
                            : commander.trim()

                        if (responseCommander !== currentCombined && responseCommander !== '') {
                            // Check if it contains a partner (separated by " : ")
                            if (responseCommander.includes(' : ')) {
                                const [cmd, prt] = responseCommander.split(' : ')
                                setCommander(cmd.trim())
                                setPartner(prt.trim())
                                setShowPartner(true)
                            } else {
                                setCommander(responseCommander)
                                setPartner('')
                                setShowPartner(false)
                            }
                        }
                    }
                }
            }

            setReportMessage('Commander updated successfully')

            // SignalR will update automatically, but refresh for immediate feedback
            await fetchGroupResult()
        } catch (err) {
            console.error('Update commander error', err)
            setRoomError(err.message || 'Unable to update commander')
        } finally {
            setReportLoading(false)
        }
    }

    // SignalR Connection Setup
    useEffect(() => {
        if (!validatedCode || !validatedParticipantId) {
            return
        }

        sessionStorage.setItem('currentRoomCode', validatedCode)
        sessionStorage.setItem('currentParticipantId', validatedParticipantId)

        // Initial fetch
        fetchRoom()

        // Setup SignalR connection
        const hubUrl = `${signalRBase}/hubs/rooms`
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl)
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.previousRetryCount === 0) return 0
                    if (retryContext.previousRetryCount === 1) return 2000
                    if (retryContext.previousRetryCount === 2) return 10000
                    if (retryContext.previousRetryCount === 3) return 30000
                    return 60000
                }
            })
            .configureLogging(signalR.LogLevel.Information)
            .build()

        hubConnectionRef.current = connection

        // Connection event handlers
        connection.onreconnecting(() => {
            console.log('SignalR reconnecting...')
            setConnectionStatus('connecting')
        })

        connection.onreconnected(() => {
            console.log('SignalR reconnected')
            setConnectionStatus('connected')
            connection.invoke('JoinRoomGroup', validatedCode).catch(err => 
                console.error('Error rejoining room:', err)
            )
            fetchRoom()
            fetchGroupResult()
        })

        connection.onclose(() => {
            console.log('SignalR connection closed')
            setConnectionStatus('disconnected')
        })

        // SignalR message handlers
        connection.on('ParticipantJoined', (data) => {
            console.log('ParticipantJoined event received:', data)
            fetchRoom()
        })

        connection.on('RoundGenerated', (data) => {
            console.log('RoundGenerated event received:', data)
            fetchRoom()
            fetchGroupResult()
        })

        connection.on('RoundStarted', (data) => {
            console.log('RoundStarted event received:', data)
            fetchRoom()
            fetchGroupResult()
        })

        connection.on('ParticipantDroppedOut', (data) => {
            console.log('ParticipantDroppedOut event received:', data)
            fetchRoom()
            fetchGroupResult()
        })

        connection.on('GroupEnded', (data) => {
            console.log('GroupEnded event received:', data)
            
            // Update statistics if included in the event data
            if (data && data.statistics) {
                // Update Bracket
                if (data.statistics.Bracket !== undefined && data.statistics.Bracket !== null) {
                    const bracketValidated = validateBracket(data.statistics.Bracket)
                    if (bracketValidated.valid) {
                        setBracket(bracketValidated.sanitized)
                    }
                }
                
                // Update Turn Count
                if (data.statistics.TurnCount !== undefined && data.statistics.TurnCount !== null) {
                    const turnCountValidated = validateTurnCount(data.statistics.TurnCount)
                    if (turnCountValidated.valid) {
                        setTurnCount(turnCountValidated.sanitized)
                    }
                }
                
                // Update Player Order
                if (data.statistics.PlayerOrder !== undefined && data.statistics.PlayerOrder !== null) {
                    const playerOrderValidated = validatePlayerOrder(data.statistics.PlayerOrder)
                    if (playerOrderValidated.valid) {
                        setPlayerOrder(playerOrderValidated.sanitized)
                    }
                }
                
                // Update Win Condition
                if (data.statistics.WinCondition !== undefined && data.statistics.WinCondition !== null) {
                    const winConditionValidated = validateWinCondition(data.statistics.WinCondition)
                    if (winConditionValidated.valid) {
                        setWinCondition(winConditionValidated.sanitized)
                    }
                }
            }
            
            // Update group result data
            if (data && groupResult) {
                setGroupResult(prevResult => ({
                    ...prevResult,
                    ...data,
                    members: data.members || prevResult.members,
                    statistics: data.statistics || prevResult.statistics
                }))
                
                // Update commander/partner from members if present
                if (data.members && Array.isArray(data.members)) {
                    const currentMember = data.members.find(m => m.id === validatedParticipantId)
                    if (currentMember && currentMember.commander) {
                        const responseCommander = currentMember.commander.trim()
                        
                        if (responseCommander !== '') {
                            // Check if it contains a partner (separated by " : ")
                            if (responseCommander.includes(' : ')) {
                                const [cmd, prt] = responseCommander.split(' : ')
                                setCommander(cmd.trim())
                                setPartner(prt.trim())
                                setShowPartner(true)
                            } else {
                                setCommander(responseCommander)
                                setPartner('')
                                setShowPartner(false)
                            }
                        }
                    }
                }
            }
            
            // Fetch latest group result to ensure sync
            fetchGroupResult()
        })

        connection.on('SettingsChanged', (data) => {
            console.log('SettingsChanged event received:', data)
            fetchRoom()
        })

        connection.on('RoomExpired', (data) => {
            console.log('RoomExpired event received:', data)
            setRoomError('This room has expired.')
            if (hubConnectionRef.current) {
                hubConnectionRef.current.stop()
            }
        })

        // Start the connection
        setConnectionStatus('connecting')
        connection.start()
            .then(() => {
                console.log('SignalR Connected')
                setConnectionStatus('connected')
                return connection.invoke('JoinRoomGroup', validatedCode)
            })
            .then(() => {
                console.log(`Joined room: ${validatedCode}`)
            })
            .catch(err => {
                console.error('SignalR Connection Error:', err)
                setConnectionStatus('disconnected')
                // Fallback to polling
                console.log('Falling back to polling...')
                pollRef.current = setInterval(() => {
                    fetchRoom()
                }, 60000)
            })

        return () => {
            if (hubConnectionRef.current) {
                // Leave the room group before stopping
                hubConnectionRef.current.invoke('LeaveRoomGroup', validatedCode)
                    .catch(err => console.error('Error leaving room group:', err))
                    .finally(() => {
                        hubConnectionRef.current.stop()
                            .then(() => console.log('SignalR connection stopped'))
                            .catch(err => console.error('Error stopping SignalR:', err))
                    })
            }
            if (pollRef.current) {
                clearInterval(pollRef.current)
                pollRef.current = null
            }
        }
    }, [validatedCode, validatedParticipantId])

    useEffect(() => {
        const savedCode = sessionStorage.getItem('currentRoomCode')
        const savedParticipantId = sessionStorage.getItem('currentParticipantId')

        if (savedCode && savedParticipantId && window.location.pathname === '/') {
            const codeVal = validateUrlParam(savedCode)
            const participantVal = validateUrlParam(savedParticipantId)
            
            if (codeVal.valid && participantVal.valid) {
                navigate(`/room/${encodeURIComponent(codeVal.sanitized)}/${encodeURIComponent(participantVal.sanitized)}`)
            }
        }
    }, [navigate])

    // Load commander from sessionStorage on mount (fallback if API doesn't have it)
    useEffect(() => {
        if (validatedCode && validatedParticipantId && !commander) {
            const storageKey = `commander_${validatedCode}_${validatedParticipantId}`
            const storedCommander = sessionStorage.getItem(storageKey)
            if (storedCommander) {
                const validated = validateCommander(storedCommander)
                if (validated.valid) {
                    // Check if it contains a partner (separated by " : ")
                    if (validated.sanitized.includes(' : ')) {
                        const [cmd, prt] = validated.sanitized.split(' : ')
                        setCommander(cmd.trim())
                        setPartner(prt.trim())
                        setShowPartner(true)
                    } else {
                        setCommander(validated.sanitized)
                    }
                }
            }
        }
    }, [validatedCode, validatedParticipantId, commander])

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Game Room</h1>
                <div style={styles.codeDisplay}>
                    <span style={styles.codeLabel}>Room Code:</span>
                    <span style={styles.code}>{validatedCode}</span>
                    {connectionStatus === 'connected' && (
                        <span style={{ color: 'var(--success-color)', fontSize: '0.85rem', marginLeft: '1rem' }}>
                            ● Live
                        </span>
                    )}
                    {connectionStatus === 'connecting' && (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '1rem' }}>
                            ⟳ Connecting...
                        </span>
                    )}
                </div>
            </div>

            {roomError && (
                <div style={styles.errorBanner}>
                    <span style={styles.errorIcon}>⚠️</span>
                    {roomError}
                </div>
            )}

            {!started && (
                <div style={styles.waitingCard}>
                    <div style={styles.waitingIcon}>⏳</div>
                    <h2 style={styles.waitingTitle}>Waiting for Host</h2>
                    <p style={styles.waitingText}>
                        The host hasn't started the game yet. You'll be automatically notified when groups are assigned.
                    </p>
                    {roomLoading && (
                        <div style={styles.loadingIndicator}>
                            <span style={styles.spinner}></span>
                            <span>Checking for updates...</span>
                        </div>
                    )}

                    {roomData && Array.isArray(roomData.participants) && (
                        <div style={styles.participantsCard}>
                            <h3 style={styles.participantsTitle}>
                                Players in Lobby ({roomData.participants.length})
                            </h3>
                            <ul style={styles.participantsList}>
                                {roomData.participants.map((p, i) => (
                                    <li key={p.id ?? i} style={styles.participantItem}>
                                        <span style={styles.participantDot}>●</span>
                                        {p.name ?? p.id ?? 'Unknown'}
                                    </li>
                                ))}
                            </ul>
                            <div style={styles.lastUpdated}>
                                Last updated: {lastUpdatedRef.current
                                    ? lastUpdatedRef.current.toLocaleTimeString()
                                    : '—'}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {started && (
                <div style={styles.startedContent}>
                    {roomLoading && <div style={styles.loadingText}>Loading results…</div>}
                    {!roomLoading && groupResult ? (
                        <RoundResults data={groupResult} />
                    ) : (
                        !roomLoading && <div style={styles.noResults}>No results returned.</div>
                    )}

                    {/* Commander/Partner Card - Always visible when started */}
                    <div style={styles.statisticsCard}>
                        <h3 style={styles.statisticsTitle}>Your Commander</h3>
                        <p style={styles.statisticsDescription}>
                            Select your commander for this game
                        </p>
                        <div style={styles.inputGrid}>
                            <label style={styles.inputLabel}>
                                Commander
                                <div style={{ position: 'relative' }}>
                                    <input
                                        ref={commanderSearch.inputRef}
                                        type="text"
                                        value={commander}
                                        onChange={handleCommanderChange}
                                        placeholder="Start typing to search commanders..."
                                        style={{
                                            ...styles.textInput,
                                            ...(validationErrors.commander ? styles.inputError : {})
                                        }}
                                        disabled={reportLoading}
                                        maxLength={100}
                                        aria-invalid={!!validationErrors.commander}
                                        autoComplete="off"
                                    />
                                    {commanderSearch.loading && (
                                        <div style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: '14px'
                                        }}>
                                            🔍
                                        </div>
                                    )}
                                    {commanderSearch.showDropdown && commanderSearch.results.length > 0 && (
                                        <div
                                            ref={commanderSearch.dropdownRef}
                                            style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                backgroundColor: '#1e293b',
                                                border: '1px solid #334155',
                                                borderRadius: '8px',
                                                marginTop: '4px',
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                zIndex: 1000,
                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                                            }}
                                        >
                                            {commanderSearch.results.map((result, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleCommanderSelect(result)}
                                                    style={{
                                                        padding: '10px 12px',
                                                        cursor: 'pointer',
                                                        borderBottom: index < commanderSearch.results.length - 1 ? '1px solid #334155' : 'none',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#334155'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent'
                                                    }}
                                                >
                                                    {result}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {validationErrors.commander && (
                                    <span style={styles.validationError}>
                                        {validationErrors.commander}
                                    </span>
                                )}
                            </label>
                            <label style={styles.inputLabel}>
                                Partner (Optional)
                                <div style={{ position: 'relative' }}>
                                    <input
                                        ref={partnerSearch.inputRef}
                                        type="text"
                                        value={partner}
                                        onChange={handlePartnerChange}
                                        placeholder="Start typing to search partners..."
                                        style={{
                                            ...styles.textInput,
                                            ...(validationErrors.partner ? styles.inputError : {})
                                        }}
                                        disabled={reportLoading}
                                        maxLength={100}
                                        aria-invalid={!!validationErrors.partner}
                                        autoComplete="off"
                                    />
                                    {partnerSearch.loading && (
                                        <div style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            fontSize: '14px'
                                        }}>
                                            🔍
                                        </div>
                                    )}
                                    {partnerSearch.showDropdown && partnerSearch.results.length > 0 && (
                                        <div
                                            ref={partnerSearch.dropdownRef}
                                            style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                backgroundColor: '#1e293b',
                                                border: '1px solid #334155',
                                                borderRadius: '8px',
                                                marginTop: '4px',
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                zIndex: 1000,
                                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                                            }}
                                        >
                                            {partnerSearch.results.map((result, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handlePartnerSelect(result)}
                                                    style={{
                                                        padding: '10px 12px',
                                                        cursor: 'pointer',
                                                        borderBottom: index < partnerSearch.results.length - 1 ? '1px solid #334155' : 'none',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#334155'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent'
                                                    }}
                                                >
                                                    {result}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {validationErrors.partner && (
                                    <span style={styles.validationError}>
                                        {validationErrors.partner}
                                    </span>
                                )}
                            </label>
                            <button
                                onClick={handleUpdateCommander}
                                disabled={reportLoading || validationErrors.commander || validationErrors.partner}
                                style={{
                                    ...styles.reportButton,
                                    ...styles.updateButton,
                                    ...((validationErrors.commander || validationErrors.partner) ? { opacity: 0.6 } : {})
                                }}
                            >
                                {reportLoading ? <span style={styles.spinner}></span> : ''} Update Commander
                            </button>
                        </div>
                    </div>

                    {/* Report Result Card - Only visible when round has started */}
                    {groupResult && groupResult.roundStarted && (
                        <div style={styles.reportCard}>
                            <h3 style={styles.reportTitle}>Report Your Game Result</h3>
                            <p style={styles.reportDescription}>
                            </p>
                            <div style={styles.reportButtons}>
                                <button
                                    onClick={() => handleReportResult('win')}
                                    disabled={reportLoading}
                                    style={{ ...styles.reportButton, ...styles.winButton }}
                                >
                                    {reportLoading ? <span style={styles.spinner}></span> : ''} I won
                                </button>
                                <button
                                    onClick={() => handleReportResult('draw')}
                                    disabled={reportLoading}
                                    style={{ ...styles.reportButton, ...styles.drawButton }}
                                >
                                    {reportLoading ? <span style={styles.spinner}></span> : ''} Draw
                                </button>
                            </div>
                            {reportMessage && (
                                <div style={styles.successMessage}>
                                    <span>✅</span> {reportMessage}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Game Statistics Card - Only visible when round has started */}
                    {groupResult && groupResult.roundStarted && (
                        <div style={styles.statisticsCard}>
                            <h3 style={styles.statisticsTitle}>Game Statistics</h3>
                            <p style={styles.statisticsDescription}>
                                Track details about your game (optional)
                            </p>
                            <div style={styles.inputGrid}>
                                <label style={styles.inputLabel}>
                                    Bracket
                                    <input
                                        type="number"
                                        value={bracket}
                                        onChange={handleBracketChange}
                                        placeholder="Average Bracket (1-5)"
                                        style={styles.textInput}
                                        disabled={reportLoading}
                                        min="1"
                                        max="5"
                                    />
                                </label>
                                <label style={styles.inputLabel}>
                                    Turn Count
                                    <input
                                        type="number"
                                        value={turnCount}
                                        onChange={handleTurnCountChange}
                                        placeholder="Number of turns"
                                        style={styles.textInput}
                                        disabled={reportLoading}
                                        min="0"
                                        max="999"
                                    />
                                </label>
                                <label style={styles.inputLabel}>
                                    Player Order
                                    <input
                                        type="text"
                                        value={playerOrder}
                                        onChange={handlePlayerOrderChange}
                                        placeholder="e.g., 1st, 2nd, 3rd, 4th"
                                        style={{
                                            ...styles.textInput,
                                            ...(validationErrors.playerOrder ? styles.inputError : {})
                                        }}
                                        disabled={reportLoading}
                                        maxLength={50}
                                        aria-invalid={!!validationErrors.playerOrder}
                                    />
                                    {validationErrors.playerOrder && (
                                        <span style={styles.validationError}>
                                            {validationErrors.playerOrder}
                                        </span>
                                    )}
                                </label> 
                                <label style={styles.inputLabel}>
                                    Win Condition
                                    <input
                                        type="text"
                                        value={winCondition}
                                        onChange={handleWinConditionChange}
                                        placeholder="How the game was won"
                                        style={{
                                            ...styles.textInput,
                                            ...(validationErrors.winCondition ? styles.inputError : {})
                                        }}
                                        disabled={reportLoading}
                                        maxLength={200}
                                        aria-invalid={!!validationErrors.winCondition}
                                    />
                                    {validationErrors.winCondition && (
                                        <span style={styles.validationError}>
                                            {validationErrors.winCondition}
                                        </span>
                                    )}
                                </label>
                                <button
                                    onClick={handleUpdateStatistics}
                                    disabled={reportLoading || Object.keys(validationErrors).filter(k => k !== 'commander' && k !== 'partner').length > 0}
                                    style={{
                                        ...styles.reportButton,
                                        ...styles.updateButton,
                                        ...(Object.keys(validationErrors).filter(k => k !== 'commander' && k !== 'partner').length > 0 ? { opacity: 0.6 } : {})
                                    }}
                                >
                                    {reportLoading ? <span style={styles.spinner}></span> : ''} Update Statistics
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Drop Button - Always at bottom when started */}
                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <button
                            onClick={() => handleReportResult('drop')}
                            disabled={reportLoading}
                            style={{ ...styles.reportButton, ...styles.dropButton }}
                        >
                            {reportLoading ? <span style={styles.spinner}></span> : ''} Drop from Game
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}