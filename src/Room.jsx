import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiBase } from './api'
import {
    validateCommander,
    validateTurnCount,
    validatePlayerOrder,
    validateWinCondition,
    validateBracket,
    validateUrlParam,
    RateLimiter
} from './utils/validation'
import { styles } from './styles/Room.styles'

// Rate limiter for report actions
const reportRateLimiter = new RateLimiter(10, 60000) // 10 reports per minute

function RoundTimer({ startedAtUtc }) {
    const [elapsed, setElapsed] = useState('')

    useEffect(() => {
        if (!startedAtUtc) return

        const calculateElapsed = () => {
            const startTime = new Date(startedAtUtc)
            const now = new Date()
            const diffMs = now - startTime
            
            if (diffMs < 0) {
                setElapsed('Not started')
                return
            }

            const hours = Math.floor(diffMs / (1000 * 60 * 60))
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

            if (hours > 0) {
                setElapsed(`${hours}h ${minutes}m ${seconds}s`)
            } else if (minutes > 0) {
                setElapsed(`${minutes}m ${seconds}s`)
            } else {
                setElapsed(`${seconds}s`)
            }
        }

        calculateElapsed()
        const interval = setInterval(calculateElapsed, 1000)

        return () => clearInterval(interval)
    }, [startedAtUtc])

    if (!startedAtUtc) return null

    return (
        <div style={styles.timerDisplay}>
            <span style={styles.timerIcon}>⏱️</span>
            <div style={styles.timerContent}>
                <span style={styles.timerLabel}>Round Time:</span>
                <span style={styles.timerValue}>{elapsed}</span>
            </div>
        </div>
    )
}

function RoundResults({ data }) {
    if (!data) return <div style={styles.noResults}>No results returned.</div>

    const { roomCode, participantId, groupNumber, members, round, result, winner, draw, startedAtUtc } = data

    return (
        <div style={styles.resultsCard}>
            <div style={styles.resultsHeader}>
                <h3 style={styles.resultsTitle}>Your Group Assignment</h3>
                {startedAtUtc && <RoundTimer startedAtUtc={startedAtUtc} />}
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
                                    {member.name ?? member.id ?? 'Unknown'}
                                    {isYou && <span style={styles.youBadge}>YOU</span>}
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
    const lastUpdatedRef = useRef(null)

    // Statistics state
    const [commander, setCommander] = useState('')
    const [turnCount, setTurnCount] = useState('')
    const [playerOrder, setPlayerOrder] = useState('')
    const [winCondition, setWinCondition] = useState('')
    const [bracket, setBracket] = useState('')
    
    // Validation errors state
    const [validationErrors, setValidationErrors] = useState({})

    // Validated URL parameters
    const [validatedCode, setValidatedCode] = useState('')
    const [validatedParticipantId, setValidatedParticipantId] = useState('')

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

    const handleCommanderChange = (e) => {
        const validated = validateCommander(e.target.value)
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
                if (pollRef.current) {
                    clearInterval(pollRef.current)
                    pollRef.current = null
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
        const turnCountVal = validateTurnCount(turnCount)
        const playerOrderVal = validatePlayerOrder(playerOrder)
        const winConditionVal = validateWinCondition(winCondition)
        const bracketVal = validateBracket(bracket)
        
        if (commanderVal.sanitized && commanderVal.valid) {
            statistics[`${validatedParticipantId}_Commander`] = commanderVal.sanitized
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
        if (result === 'Drop') {
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
        const validResults = ['Win', 'Draw', 'Drop', 'data']
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
            
            const body = {
                participantId: validatedParticipantId,
                result: result
            }

            // Only include statistics if there are any
            if (Object.keys(statistics).length > 0) {
                body.statistics = statistics
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
            setReportMessage(
                data && data.message
                    ? data.message
                    : `${result} reported successfully`
            )
            
            // Clear statistics after successful submission
            if (result !== 'data') {
                setCommander('')
                setTurnCount('')
                setPlayerOrder('')
                setWinCondition('')
                setBracket('')
            }
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

    useEffect(() => {
        if (!validatedCode || !validatedParticipantId) {
            return
        }

        sessionStorage.setItem('currentRoomCode', validatedCode)
        sessionStorage.setItem('currentParticipantId', validatedParticipantId)

        fetchRoom()

        pollRef.current = setInterval(() => {
            fetchRoom()
        }, 60_000)

        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current)
                pollRef.current = null
            }
        }
    }, [validatedCode, validatedParticipantId, started])

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

    // Load commander from sessionStorage on mount
    useEffect(() => {
        if (validatedCode && validatedParticipantId) {
            const storageKey = `commander_${validatedCode}_${validatedParticipantId}`
            const storedCommander = sessionStorage.getItem(storageKey)
            if (storedCommander && !commander) {
                const validated = validateCommander(storedCommander)
                if (validated.valid) {
                    setCommander(validated.sanitized)
                }
            }
        }
    }, [validatedCode, validatedParticipantId])

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Game Room</h1>
                <div style={styles.codeDisplay}>
                    <span style={styles.codeLabel}>Room Code:</span>
                    <span style={styles.code}>{validatedCode}</span>
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

                    <div style={styles.reportCard}>
                        <h3 style={styles.reportTitle}>Report Your Game Result</h3>
                        <p style={styles.reportDescription}>
                        </p>
                        <div style={styles.reportButtons}>
                            <button
                                onClick={() => handleReportResult('Win')}
                                disabled={reportLoading}
                                style={{...styles.reportButton, ...styles.winButton}}
                            >
                                {reportLoading ? <span style={styles.spinner}></span> : ''} I won
                            </button>
                            <button
                                onClick={() => handleReportResult('Draw')}
                                disabled={reportLoading}
                                style={{...styles.reportButton, ...styles.drawButton}}
                            >
                                {reportLoading ? <span style={styles.spinner}></span> : ''} Draw
                            </button>
                            <button
                                onClick={() => handleReportResult('Drop')}
                                disabled={reportLoading}
                                style={{...styles.reportButton, ...styles.dropButton}}
                            >
                                {reportLoading ? <span style={styles.spinner}></span> : ''} Drop
                            </button>                       
                        </div>
                        {reportMessage && (
                            <div style={styles.successMessage}>
                                <span>✅</span> {reportMessage}
                            </div>
                        )}
                    </div>

                    <div style={styles.statisticsCard}>
                        <h3 style={styles.statisticsTitle}>Game Statistics</h3>
                        <p style={styles.statisticsDescription}>
                            Track details about your game (optional)
                        </p>
                        <div style={styles.inputGrid}>
                            <label style={styles.inputLabel}>
                                Commander
                                <input
                                    type="text"
                                    value={commander}
                                    onChange={handleCommanderChange}
                                    placeholder="Your commander name"
                                    style={{
                                        ...styles.textInput,
                                        ...(validationErrors.commander ? styles.inputError : {})
                                    }}
                                    disabled={reportLoading}
                                    maxLength={100}
                                    aria-invalid={!!validationErrors.commander}
                                />
                                {validationErrors.commander && (
                                    <span style={styles.validationError}>
                                        {validationErrors.commander}
                                    </span>
                                )}
                            </label>
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
                                disabled={reportLoading || Object.keys(validationErrors).length > 0}
                                style={{
                                    ...styles.reportButton,
                                    ...styles.updateButton,
                                    ...(Object.keys(validationErrors).length > 0 ? { opacity: 0.6 } : {})
                                }}
                            >
                                {reportLoading ? <span style={styles.spinner}></span> : ''} Update Statistics
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}