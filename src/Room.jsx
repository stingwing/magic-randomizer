import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import * as signalR from '@microsoft/signalr'
import { apiBase, signalRBase } from './api'
import {
    validateUrlParam,
    validatePlayerOrder,
    RateLimiter
} from './utils/validation'
import { calculateTimeRemaining } from './utils/timerUtils'
import { isInCustomGroup, getCustomGroupColor } from './utils/customGroupColors'
import RoomNav from './components/RoomNav'
import { styles } from './styles/Room.styles'
import { analytics } from './utils/analytics'

const reportRateLimiter = new RateLimiter(10, 60000)

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

function RoundResults({ data, participantId, onPlayerOrderChange }) {
    const [orderedPlayers, setOrderedPlayers] = useState([])

    useEffect(() => {
        if (data?.members && Array.isArray(data.members) && data.members.length > 0) {
            const activePlayers = data.members.filter(m => m.dropped !== true)
            const sorted = [...activePlayers].sort((a, b) => {
                if (a.order !== undefined && b.order !== undefined) {
                    return a.order - b.order
                }
                if (a.id === participantId) return -1
                if (b.id === participantId) return 1
                return 0
            })
            setOrderedPlayers(sorted)
        }
    }, [data?.members, participantId])

    useEffect(() => {
        if (orderedPlayers.length > 0) {
            const orderString = orderedPlayers
                .map(player => player.name ?? player.id ?? 'Unknown')
                .join(', ')
            onPlayerOrderChange(orderString)
        }
    }, [orderedPlayers, onPlayerOrderChange])

    const movePlayerUp = (index) => {
        if (index === 0) return
        const newOrder = [...orderedPlayers]
        ;[newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]]
        setOrderedPlayers(newOrder)
    }

    const movePlayerDown = (index) => {
        if (index === orderedPlayers.length - 1) return
        const newOrder = [...orderedPlayers]
        ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
        setOrderedPlayers(newOrder)
    }

    if (!data) return <div style={styles.noResults}>No results returned.</div>

    const { roomCode, groupNumber, members, round, result, winner, draw, startedAtUtc, roundStarted, roundLength, settings } = data

    return (
        <div style={styles.resultsCard}>
            <div style={styles.resultsHeader}>
                <h3 style={styles.resultsTitle}>Your Group</h3>
                <RoundCountdownTimer
                    startedAtUtc={startedAtUtc}
                    roundLength={roundLength ?? settings?.roundLength}
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
                                <span style={{ ...styles.detailValue, color: 'var(--success-color)', fontWeight: '600' }}>
                                    🏆 {(() => {
                                        const winnerMember = members?.find(m => 
                                            (m.userId || m.id) === winner
                                        )
                                        return winnerMember?.name || winnerMember?.id || winner
                                    })()}
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
                    {roundStarted && (
                        <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Arrange players in turn order
                        </p>
                    )}
                    <ul style={styles.membersList}>
                        {(roundStarted ? orderedPlayers : members
                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
                            .map((member, idx) => {
                                const isYou = member.id === participantId
                                const isDropped = member.dropped === true
                                const inCustom = isInCustomGroup(member.inCustomGroup)
                                const customGroupColor = inCustom ? getCustomGroupColor(member.inCustomGroup) : null
                                const showPoints = settings?.usePoints === true

                                return (
                                    <li
                                        key={member.id ?? idx}
                                        style={{
                                            ...styles.memberItem,
                                            ...(isYou ? styles.memberItemYou : {}),
                                            ...(isDropped ? { opacity: 0.5, textDecoration: 'line-through' } : {})
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
                                            {roundStarted && !isDropped && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => movePlayerUp(idx)}
                                                        disabled={idx === 0}
                                                        style={{
                                                            padding: '2px 8px',
                                                            fontSize: '0.8rem',
                                                            background: idx === 0 ? 'var(--bg-secondary)' : 'var(--primary-color)',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                                            color: idx === 0 ? 'var(--text-secondary)' : '#fff',
                                                            opacity: idx === 0 ? 0.5 : 1
                                                        }}
                                                        title="Move up"
                                                    >▲</button>
                                                    <button
                                                        type="button"
                                                        onClick={() => movePlayerDown(idx)}
                                                        disabled={idx === orderedPlayers.length - 1}
                                                        style={{
                                                            padding: '2px 8px',
                                                            fontSize: '0.8rem',
                                                            background: idx === orderedPlayers.length - 1 ? 'var(--bg-secondary)' : 'var(--primary-color)',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: idx === orderedPlayers.length - 1 ? 'not-allowed' : 'pointer',
                                                            color: idx === orderedPlayers.length - 1 ? 'var(--text-secondary)' : '#fff',
                                                            opacity: idx === orderedPlayers.length - 1 ? 0.5 : 1
                                                        }}
                                                        title="Move down"
                                                    >▼</button>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                    {roundStarted && !isDropped && (
                                                        <span style={{ 
                                                            fontWeight: '600', 
                                                            fontSize: '0.9rem',
                                                            color: 'var(--text-secondary)',
                                                            minWidth: '20px'
                                                        }}>
                                                            {idx + 1}.
                                                        </span>
                                                    )}
                                                    <span>
                                                        {member.name ?? member.id ?? 'Unknown'}
                                                        {isYou && <span style={styles.youBadge}>YOU</span>}
                                                        {isDropped && <span style={{ ...styles.youBadge, backgroundColor: '#ff4444' }}>DROPPED</span>}
                                                        {inCustom && <span style={{ ...styles.youBadge, backgroundColor: customGroupColor }}>CUSTOM</span>}
                                                    </span>
                                                    {showPoints && (
                                                        <span style={{ fontSize: '0.9em', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                                            ({member.points ?? 0} pts)
                                                        </span>
                                                    )}
                                                </div>
                                                {member.commander && (
                                                    <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                                        Commander: {member.commander}
                                                    </div>
                                                )}
                                            </div>
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
    const [roomLoading, setRoomLoading] = useState(false)
    const [roomError, setRoomError] = useState(null)
    const [started, setStarted] = useState(false)
    const [groupResult, setGroupResult] = useState(null)
    const [reportLoading, setReportLoading] = useState(false)
    const [reportMessage, setReportMessage] = useState(null)
    const [playerOrder, setPlayerOrder] = useState('')
    const [playerOrderChanged, setPlayerOrderChanged] = useState(false)
    const pollRef = useRef(null)
    const hubConnectionRef = useRef(null)
    const lastUpdatedRef = useRef(null)

    const [validatedCode, setValidatedCode] = useState('')
    const [validatedParticipantId, setValidatedParticipantId] = useState('')
    const [connectionStatus, setConnectionStatus] = useState('disconnected')
    const [showQR, setShowQR] = useState(false)
    const [copyMessage, setCopyMessage] = useState(null)

    useEffect(() => {
        const codeValidation = validateUrlParam(code)
        const participantValidation = validateUrlParam(participantId)

        if (!codeValidation.valid || !participantValidation.valid) {
            navigate('/')
            return
        }

        setValidatedCode(codeValidation.sanitized)
        setValidatedParticipantId(participantValidation.sanitized)

        // Store participantId in sessionStorage for profile navigation
        if (codeValidation.valid && participantValidation.valid) {
            sessionStorage.setItem(`participantId_${codeValidation.sanitized}`, participantValidation.sanitized)
        }
    }, [code, participantId, navigate])

    const getJoinUrl = () => {
        const baseUrl = window.location.origin
        return `${baseUrl}/quick-join?code=${encodeURIComponent(validatedCode)}`
    }

    const copyCode = async () => {
        if (!validatedCode) return
        try {
            await navigator.clipboard.writeText(validatedCode)
            setCopyMessage('Code copied to clipboard!')
            setTimeout(() => setCopyMessage(null), 3000)
            analytics.copyRoomCode()
        } catch {
            // Fallback for browsers that don't support clipboard API
            const textArea = document.createElement('textarea')
            textArea.value = validatedCode
            textArea.style.position = 'fixed'
            textArea.style.opacity = '0'
            document.body.appendChild(textArea)
            textArea.select()
            try {
                document.execCommand('copy')
                setCopyMessage('Code copied to clipboard!')
                setTimeout(() => setCopyMessage(null), 3000)
                analytics.copyRoomCode()
            } catch {
                alert(`Copy this code: ${validatedCode}`)
            }
            document.body.removeChild(textArea)
        }
    }

    const copyJoinUrl = async () => {
        const url = getJoinUrl()
        try {
            await navigator.clipboard.writeText(url)
            setCopyMessage('Join URL copied to clipboard!')
            setTimeout(() => setCopyMessage(null), 3000)
            analytics.copyJoinURL()
        } catch {
            // Fallback
            const textArea = document.createElement('textarea')
            textArea.value = url
            textArea.style.position = 'fixed'
            textArea.style.opacity = '0'
            document.body.appendChild(textArea)
            textArea.select()
            try {
                document.execCommand('copy')
                setCopyMessage('Join URL copied to clipboard!')
                setTimeout(() => setCopyMessage(null), 3000)
                analytics.copyJoinURL()
            } catch {
                alert(`Copy this URL: ${url}`)
            }
            document.body.removeChild(textArea)
        }
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
                throw new Error('Unable to fetch group information')
            }

            const data = await res.json()
            if (data) {
                setGroupResult(data)
                setStarted(true)
                
                // Initialize player order from API data
                if (data.statistics?.PlayerOrder && !playerOrderChanged) {
                    const validated = validatePlayerOrder(data.statistics.PlayerOrder)
                    if (validated.valid) {
                        setPlayerOrder(validated.sanitized)
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
                throw new Error(res.status === 404 ? 'Room not found' : 'Unable to load room')
            }
            const data = await res.json()

            if (data) {
                setRoomData({
                    code: data.code,
                    eventName: data.eventName,
                    hostId: data.hostId,
                    createdAtUtc: data.createdAtUtc,
                    expiresAtUtc: data.expiresAtUtc,
                    participantCount: data.participantCount,
                    participants: data.participants || [],
                    settings: data.settings || {}
                })

                lastUpdatedRef.current = new Date()

                if (!started) {
                    if (checkIfStarted(data)) {
                        await fetchGroupResult()
                    } else {
                        await fetchGroupResult()
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching room', err)
            setRoomError(err.message || 'Unable to load room')
        } finally {
            setRoomLoading(false)
        }
    }

    const handlePlayerOrderChange = useCallback((orderString) => {
        const validated = validatePlayerOrder(orderString)
        if (validated.valid) {
            setPlayerOrder(validated.sanitized)
            setPlayerOrderChanged(true)
        }
    }, [])

    const handleUpdateStatistics = async () => {
        if (!validatedCode || !validatedParticipantId || !playerOrder) return

        if (!reportRateLimiter.canAttempt(validatedParticipantId)) {
            setRoomError('Too many attempts. Please wait a moment.')
            return
        }

        setReportLoading(true)
        setRoomError(null)
        setReportMessage(null)

        try {
            const url = `${apiBase}/${encodeURIComponent(validatedCode)}/report`
            
            const playerOrderVal = validatePlayerOrder(playerOrder)
            const statistics = {}
            
            if (playerOrderVal.sanitized && playerOrderVal.valid) {
                statistics['PlayerOrder'] = playerOrderVal.sanitized
            }

            const body = {
                participantId: validatedParticipantId,
                result: 'data',
                commander: '',
                statistics: statistics
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                throw new Error(res.status === 400 ? 'Invalid request' : 'Unable to save statistics')
            }

            const data = await res.json()
            
            if (data && groupResult) {
                setGroupResult(prev => ({
                    ...prev,
                    members: data.members || prev.members,
                    statistics: data.statistics || prev.statistics
                }))
            }

            setReportMessage('Player order updated successfully!')
            setPlayerOrderChanged(false)
            setTimeout(() => setReportMessage(null), 3000)
        } catch (err) {
            console.error('Update statistics error', err)
            setRoomError(err.message || 'Unable to update statistics')
        } finally {
            setReportLoading(false)
        }
    }

    const handleReportResult = async (result) => {
        if (!validatedCode || !validatedParticipantId) return

        if (result === 'drop') {
            if (!window.confirm('Are you sure you want to drop from this game?')) {
                return
            }
        }

        const validResults = ['win', 'draw', 'drop']
        if (!validResults.includes(result)) {
            setRoomError('Invalid result type')
            return
        }

        if (!reportRateLimiter.canAttempt(validatedParticipantId)) {
            setRoomError('Too many report attempts. Please wait a moment.')
            return
        }

        setReportLoading(true)
        setReportMessage(null)
        setRoomError(null)

        try {
            const url = `${apiBase}/${encodeURIComponent(validatedCode)}/report`

            const body = {
                participantId: validatedParticipantId,
                result: result,
                commander: '',
                statistics: {}
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                throw new Error(res.status === 400 ? 'Invalid request' : 'Unable to submit report')
            }

            const data = await res.json()

            if (data && groupResult) {
                setGroupResult(prevResult => ({
                    ...prevResult,
                    members: data.members || prevResult.members,
                    statistics: data.statistics || prevResult.statistics,
                    result: data.result !== undefined ? true : prevResult.result,
                    winner: data.winnerParticipantId || prevResult.winner
                }))
            }

            analytics.reportResult(result)
            setReportMessage(data?.message || `${result} reported successfully`)
            await fetchGroupResult()
        } catch (err) {
            console.error('Report result error', err)
            setRoomError(err.message || 'Unable to submit report')
        } finally {
            setReportLoading(false)
        }
    }

    // SignalR Connection Setup
    useEffect(() => {
        if (!validatedCode || !validatedParticipantId) return

        sessionStorage.setItem('currentRoomCode', validatedCode)
        sessionStorage.setItem('currentParticipantId', validatedParticipantId)

        fetchRoom()

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

        connection.on('ParticipantJoined', () => fetchRoom())
        connection.on('RoundGenerated', () => { fetchRoom(); fetchGroupResult() })
        connection.on('RoundStarted', () => { fetchRoom(); fetchGroupResult() })
        connection.on('ParticipantDroppedOut', () => { fetchRoom(); fetchGroupResult() })
        connection.on('GroupEnded', () => fetchGroupResult())
        connection.on('SettingsChanged', () => fetchRoom())
        connection.on('RoomExpired', () => {
            setRoomError('This room has expired.')
            hubConnectionRef.current?.stop()
        })

        setConnectionStatus('connecting')
        connection.start()
            .then(() => {
                console.log('SignalR Connected')
                setConnectionStatus('connected')
                return connection.invoke('JoinRoomGroup', validatedCode)
            })
            .catch(err => {
                console.error('SignalR Connection Error:', err)
                setConnectionStatus('disconnected')
                pollRef.current = setInterval(fetchRoom, 60000)
            })

        return () => {
            if (hubConnectionRef.current) {
                hubConnectionRef.current.invoke('LeaveRoomGroup', validatedCode)
                    .catch(err => console.error('Error leaving room group:', err))
                    .finally(() => {
                        hubConnectionRef.current.stop()
                    })
            }
            if (pollRef.current) {
                clearInterval(pollRef.current)
            }
        }
    }, [validatedCode, validatedParticipantId])

    return (
        <div style={styles.container}>
            <RoomNav
                roomCode={validatedCode}
                participantId={validatedParticipantId}
                currentPage="room"
                allowCustomGroups={roomData?.settings?.allowPlayersToCreateCustomGroups}
            />
            <div style={styles.content}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Game Room</h1>
                    <div style={{ 
                        ...styles.codeDisplay, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.5rem', 
                        padding: '1rem',
                        maxWidth: '500px',
                        margin: '0 auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ ...styles.codeLabel, fontSize: '1rem' }}>Room Code:</span>
                            <span style={{ ...styles.code, fontSize: '1rem' }}>{validatedCode}</span>
                            {connectionStatus === 'connected' && (
                                <span style={{ color: 'var(--success-color)', fontSize: '1rem', marginLeft: '1rem' }}>
                                    ● Live
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ ...styles.codeLabel, fontSize: '1rem' }}>Name:</span>
                            <span style={{ ...styles.code, fontSize: '1rem' }}>
                                {roomData?.participants?.find(p => p.id === validatedParticipantId)?.name || 'Not set'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ ...styles.codeLabel, fontSize: '1rem' }}>Id:</span>
                            <span style={{ ...styles.code, fontSize: '1rem' }}>{validatedParticipantId}</span>
                        </div>
                        <button
                            onClick={() => {
                                setShowQR(!showQR)
                                if (!showQR) {
                                    analytics.showQRCode()
                                }
                            }}
                            style={{
                                marginTop: '0.5rem',
                                padding: '10px 20px',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
                                e.currentTarget.style.borderColor = 'var(--primary-color)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                                e.currentTarget.style.borderColor = 'var(--border-color)'
                            }}
                        >
                            📱 {showQR ? 'Hide' : 'Show'} QR Code
                        </button>
                    </div>
                </div>

                {roomError && (
                    <div style={styles.errorBanner}>
                        <span style={styles.errorIcon}>⚠️</span>
                        {roomError}
                    </div>
                )}

                {/* Custom Groups Button */}
                {!started && roomData?.settings?.allowPlayersToCreateCustomGroups && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <button
                            onClick={() => navigate(`/room/${validatedCode}/${validatedParticipantId}/custom-groups`)}
                            style={{
                                padding: '10px 20px',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                backgroundColor: 'var(--primary-color)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.9'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1'
                            }}
                        >
                            👥 Create Custom Group
                        </button>
                    </div>
                )}

                {/* QR Code Display - Always visible when toggled */}
                {showQR && (
                    <div style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '1.5rem',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            <div style={{
                                backgroundColor: '#ffffff',
                                padding: '16px',
                                borderRadius: '12px',
                                display: 'inline-flex',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                <QRCodeSVG
                                    value={getJoinUrl()}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                />
                            </div>
                            <div style={{
                                textAlign: 'center',
                                width: '100%'
                            }}>
                                <p style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)',
                                    marginBottom: '12px'
                                }}>
                                    Other players can scan this QR code to join with the room code pre-filled
                                </p>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap'
                                }}>
                                    <button
                                        onClick={copyCode}
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            backgroundColor: 'var(--primary-color)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'opacity 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                    >
                                        📋 Copy Code
                                    </button>
                                    <button
                                        onClick={copyJoinUrl}
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            backgroundColor: 'var(--bg-tertiary)',
                                            color: 'var(--text-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
                                            e.currentTarget.style.borderColor = 'var(--primary-color)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                                            e.currentTarget.style.borderColor = 'var(--border-color)'
                                        }}
                                    >
                                        🔗 Copy Join URL
                                    </button>
                                </div>
                                {copyMessage && (
                                    <div style={{
                                        marginTop: '12px',
                                        padding: '8px 16px',
                                        backgroundColor: 'var(--success-bg)',
                                        color: 'var(--success-color)',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontWeight: '500'
                                    }}>
                                        ✅ {copyMessage}
                                    </div>
                                )}
                            </div>
                        </div>
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
                                    {roomData.participants
                                        .sort((a, b) => {
                                            if (a.joinedAtUtc && b.joinedAtUtc) {
                                                return new Date(a.joinedAtUtc) - new Date(b.joinedAtUtc)
                                            }
                                            return (a.name ?? a.id ?? '').localeCompare(b.name ?? b.id ?? '')
                                        })
                                        .map((p, i) => {
                                            const isYou = p.id === validatedParticipantId
                                            const isDropped = p.dropped === true
                                            const inCustom = isInCustomGroup(p.inCustomGroup)
                                            const customGroupColor = inCustom ? getCustomGroupColor(p.inCustomGroup) : null
                                            const showPoints = roomData?.settings?.usePoints === true

                                            return (
                                                <li
                                                    key={p.id ?? i}
                                                    style={{
                                                        ...styles.participantItem,
                                                        ...(isYou ? { fontWeight: '600', color: 'var(--primary-color)' } : {}),
                                                        ...(isDropped ? { opacity: 0.5, textDecoration: 'line-through' } : {})
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                            <span style={styles.participantDot}>●</span>
                                                            <span>
                                                                {p.name ?? p.id ?? 'Unknown'}
                                                                {isYou && <span style={{
                                                                    ...styles.youBadge,
                                                                    marginLeft: '8px',
                                                                    fontSize: '0.75em'
                                                                }}>YOU</span>}
                                                                {isDropped && <span style={{
                                                                    ...styles.youBadge,
                                                                    backgroundColor: '#ff4444',
                                                                    marginLeft: '8px',
                                                                    fontSize: '0.75em'
                                                                }}>DROPPED</span>}
                                                                {inCustom && <span style={{
                                                                    ...styles.youBadge,
                                                                    backgroundColor: customGroupColor,
                                                                    marginLeft: '8px',
                                                                    fontSize: '0.75em'
                                                                }}>CUSTOM GROUP</span>}
                                                            </span>
                                                            {showPoints && (
                                                                <span style={{
                                                                    fontSize: '0.85em',
                                                                    color: 'var(--text-secondary)',
                                                                    fontWeight: '600',
                                                                    marginLeft: 'auto'
                                                                }}>
                                                                    {p.points ?? 0} pts
                                                                </span>
                                                            )}
                                                        </div>
                                                        {p.commander && p.commander.trim() !== '' && (
                                                            <div style={{
                                                                fontSize: '0.8em',
                                                                color: 'var(--text-secondary)',
                                                                fontStyle: 'italic',
                                                                paddingLeft: '20px'
                                                            }}>
                                                                Commander: {p.commander}
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
                )}

                {started && (
                    <div style={styles.startedContent}>
                        {roomLoading && <div style={styles.loadingText}>Loading results…</div>}
                        {!roomLoading && groupResult ? (
                            <>
                                <RoundResults 
                                    data={groupResult} 
                                    participantId={validatedParticipantId}
                                    onPlayerOrderChange={handlePlayerOrderChange}
                                />

                                {groupResult.roundStarted && (
                                    <>
                                        {playerOrderChanged && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <button
                                                    onClick={handleUpdateStatistics}
                                                    disabled={reportLoading}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 24px',
                                                        fontSize: '1rem',
                                                        fontWeight: '600',
                                                        backgroundColor: 'var(--primary-color)',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: reportLoading ? 'not-allowed' : 'pointer',
                                                        opacity: reportLoading ? 0.7 : 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    {reportLoading ? <span style={styles.spinner}></span> : '💾'} 
                                                    Update Player Order
                                                </button>
                                            </div>
                                        )}

                                        <div style={styles.reportCard}>
                                            <h3 style={styles.reportTitle}>
                                                Report Your Game Result{groupResult.settings?.prioritizeWinners === false && ' (Optional)'}
                                            </h3>
                                            <div style={styles.reportButtons}>
                                                <button
                                                    onClick={() => handleReportResult('win')}
                                                    disabled={reportLoading}
                                                    style={{ ...styles.reportButton, ...styles.winButton }}
                                                >
                                                    {reportLoading ? <span style={styles.spinner}></span> : ''} I Won
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

                                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                <button
                                                    onClick={() => handleReportResult('drop')}
                                                    disabled={reportLoading}
                                                    style={{ ...styles.reportButton, ...styles.dropButton }}
                                                >
                                                    {reportLoading ? <span style={styles.spinner}></span> : ''} Drop from Game
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/room/${validatedCode}/${validatedParticipantId}/statistics`)}
                                                    disabled={reportLoading}
                                                    style={{
                                                        padding: '10px 20px',
                                                        fontSize: '0.95rem',
                                                        fontWeight: '500',
                                                        backgroundColor: 'var(--bg-secondary)',
                                                        color: 'var(--text-primary)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '8px',
                                                        cursor: reportLoading ? 'not-allowed' : 'pointer',
                                                        opacity: reportLoading ? 0.7 : 1,
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    📊 (Optional) Report Statistics
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            !roomLoading && <div style={styles.noResults}>No results returned.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}