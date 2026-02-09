import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import * as signalR from '@microsoft/signalr'
import { apiBase, signalRBase } from './api'
import { validateName, validateUrlParam, RateLimiter } from './utils/validation'
import { calculateTimeRemaining } from './utils/timerUtils'
import { styles } from './styles/HostRoom.styles'

// Rate limiters for different actions
const addPlayerRateLimiter = new RateLimiter(60, 60000)
const dropPlayerRateLimiter = new RateLimiter(60, 60000)
const gameActionRateLimiter = new RateLimiter(15, 60000)

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

function RoundDisplay({ round, index, label }) {
    if (!round) return null

    let groups = []
    let roundNumber = 'N/A'
    let startedAtUtc = null
    let roundStarted = false
    let roundLength = 0

    if (Array.isArray(round)) {
        groups = round
        if (groups.length > 0) {
            // Extract timer data from first group
            if (groups[0].round !== undefined) {
                roundNumber = groups[0].round
            } else if (index !== undefined) {
                roundNumber = index + 1
            }
            startedAtUtc = groups[0].startedAtUtc
            roundStarted = groups[0].roundStarted ?? false
            roundLength = groups[0].roundLength ?? 0
        } else if (index !== undefined) {
            roundNumber = index + 1
        }
    } else {
        roundNumber = round.round ?? round.roundNumber ?? (index !== undefined ? index + 1 : 'N/A')
        groups = round.groups ?? []
        // Extract timer data from first group if available
        if (groups.length > 0) {
            startedAtUtc = groups[0].startedAtUtc ?? round.startedAtUtc
            roundStarted = groups[0].roundStarted ?? round.roundStarted ?? false
            roundLength = groups[0].roundLength ?? round.roundLength ?? 0
        } else {
            startedAtUtc = round.startedAtUtc
            roundStarted = round.roundStarted ?? false
            roundLength = round.roundLength ?? 0
        }
    }

    return (
        <div style={styles.roundCard}>
            <div style={styles.roundHeader}>
                <h4 style={styles.roundTitle}>
                    {label || `Round ${roundNumber}`}
                </h4>
            </div>

            {groups.length > 0 ? (
                groups.map((group, groupIdx) => {
                    const groupNumber = group.groupNumber ?? groupIdx + 1
                    const members = group.members ?? group.participants ?? []
                    const result = group.result
                    const winner = group.winner
                    const draw = group.draw

                    return (
                        <div key={groupIdx} style={styles.groupContainer}>
                            <div style={styles.groupHeader}>
                                <span style={styles.groupNumber}>Group {groupNumber}</span>
                            </div>

                            {(result !== undefined || winner !== undefined || draw !== undefined) && (
                                <div style={styles.groupResults}>
                                    {result !== undefined && (
                                        <div style={styles.resultItem}>
                                            <span style={styles.resultLabel}>Reported:</span>
                                            <span style={styles.resultValue}>{result ? '✅' : '⏳'}</span>
                                        </div>
                                    )}
                                    {winner !== undefined && winner !== null && (
                                        <div style={styles.resultItem}>
                                            <span style={styles.resultLabel}>Winner:</span>
                                            <span style={{ ...styles.resultValue, color: 'var(--success-color)', fontWeight: '600' }}>
                                                🏆 {winner}
                                            </span>
                                        </div>
                                    )}
                                    {draw !== undefined && (
                                        <div style={styles.resultItem}>
                                            <span style={styles.resultLabel}>Draw:</span>
                                            <span style={styles.resultValue}>{draw ? '✅' : '❌'}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {members.length > 0 && (
                                <div style={styles.membersList}>
                                    {members.map((member, memberIdx) => (
                                        <div key={memberIdx} style={styles.memberItem}>
                                            <span style={styles.memberDot}>●</span>
                                            {member.name ?? member.id ?? 'Unknown'}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })
            ) : (
                <div style={styles.emptyState}>No groups in this round.</div>
            )}
        </div>
    )
}

export default function HostRoomPage() {
    const { code, hostId } = useParams()
    const navigate = useNavigate()
    const [participants, setParticipants] = useState([])
    const [currentRound, setCurrentRound] = useState(null)
    const [archivedRounds, setArchivedRounds] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [starting, setStarting] = useState(false)
    const [startingNewRound, setStartingNewRound] = useState(false)
    const [startingRound, setStartingRound] = useState(false)
    const [resettingRound, setResettingRound] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)
    const [newPlayerName, setNewPlayerName] = useState('')
    const [addingPlayer, setAddingPlayer] = useState(false)
    const [droppingPlayer, setDroppingPlayer] = useState({})
    const [showQR, setShowQR] = useState(false)
    const pollRef = useRef(null)
    const hubConnectionRef = useRef(null)
    const roundsContainerRef = useRef(null)

    // Validation state
    const [validationErrors, setValidationErrors] = useState({})
    const [validatedCode, setValidatedCode] = useState('')
    const [validatedHostId, setValidatedHostId] = useState('')
    const [connectionStatus, setConnectionStatus] = useState('disconnected')

    // Validate URL parameters on mount
    useEffect(() => {
        const codeValidation = validateUrlParam(code)
        const hostIdValidation = validateUrlParam(hostId)

        if (!codeValidation.valid || !hostIdValidation.valid) {
            navigate('/')
            return
        }

        setValidatedCode(codeValidation.sanitized)
        setValidatedHostId(hostIdValidation.sanitized)
    }, [code, hostId, navigate])

    // Scroll rounds container to the right when rounds change
    useEffect(() => {
        if (roundsContainerRef.current && (archivedRounds.length > 0 || currentRound)) {
            // Use setTimeout to ensure DOM has updated
            setTimeout(() => {
                if (roundsContainerRef.current) {
                    roundsContainerRef.current.scrollLeft = roundsContainerRef.current.scrollWidth
                }
            }, 100)
        }
    }, [archivedRounds, currentRound])

    const getJoinUrl = () => {
        const baseUrl = window.location.origin
        return `${baseUrl}/?code=${encodeURIComponent(validatedCode)}`
    }

    const handlePlayerNameChange = (e) => {
        const validated = validateName(e.target.value)
        setNewPlayerName(validated.sanitized)

        if (validated.error) {
            setValidationErrors(prev => ({ ...prev, playerName: validated.error }))
        } else {
            setValidationErrors(prev => {
                const { playerName, ...rest } = prev
                return rest
            })
        }
    }

    const fetchParticipants = async () => {
        if (!validatedCode) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(validatedCode)}`)
            if (!res.ok) {
                const safeMessage = res.status === 404 ? 'Room not found' : 'Unable to load participants'
                throw new Error(safeMessage)
            }
            const data = await res.json().catch(() => null)
            if (data && Array.isArray(data.participants)) {
                setParticipants(data.participants)
            }
        } catch (err) {
            console.error('Error fetching participants', err)
        }
    }

    const fetchCurrentRound = async () => {
        if (!validatedCode) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(validatedCode)}/current`)
            if (res.status === 404 || res.status === 204) {
                setCurrentRound(null)
                return
            }
            if (!res.ok) {
                throw new Error('Unable to load current round')
            }
            const data = await res.json().catch(() => null)
            setCurrentRound(data)
            if (data) {
                setGameStarted(true)
            }
        } catch (err) {
            console.error('Error fetching current round', err)
        }
    }

    const fetchArchivedRounds = async () => {
        if (!validatedCode) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(validatedCode)}/archived`)
            if (res.status === 404 || res.status === 204) {
                setArchivedRounds([])
                return
            }
            if (!res.ok) {
                throw new Error('Unable to load archived rounds')
            }
            const data = await res.json().catch(() => null)
            if (Array.isArray(data)) {
                setArchivedRounds(data)
                if (data.length > 0) {
                    setGameStarted(true)
                }
            } else {
                setArchivedRounds([])
            }
        } catch (err) {
            console.error('Error fetching archived rounds', err)
        }
    }

    const fetchAllData = async () => {
        setLoading(true)
        await Promise.all([
            fetchParticipants(),
            fetchCurrentRound(),
            fetchArchivedRounds()
        ])
        setLoading(false)
    }

    const handleGame = async (result) => {
        if (!validatedCode || !validatedHostId) return

        // Check rate limiting
        if (!gameActionRateLimiter.canAttempt(result)) {
            setError('Too many game actions. Please wait a moment.')
            return
        }

        // Set loading state based on action
        if (result === 'generatefirst' || result === 'regenerate') {
            setStarting(true)
        } else if (result === 'generate') {
            setStartingNewRound(true)
        } else if (result === 'start') {
            setStartingRound(true)
        } else if (result === 'resetround') {
            setResettingRound(true)
        }

        setError(null)
        setMessage(null)

        try {
            const url = `${apiBase}/${encodeURIComponent(validatedCode)}/handlegame`

            const players = {}

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    result: result,
                    hostId: validatedHostId,
                    players: players
                })
            })

            if (!res.ok) {
                const safeMessage = res.status === 400
                    ? 'Invalid game state'
                    : `Unable to ${result === 'generate' ? 'start new round' : result === 'start' ? 'start round' : result === 'resetround' ? 'reset round' : 'start game'}`
                throw new Error(safeMessage)
            }

            const data = await res.json().catch(() => null)

            // Set appropriate success message
            let successMessage = ''
            if (result === 'generatefirst') {
                successMessage = 'Game started successfully'
            } else if (result === 'regenerate') {
                successMessage = 'Game reset successfully'
            } else if (result === 'generate') {
                successMessage = 'New round started successfully'
            } else if (result === 'start') {
                successMessage = 'Round timer started successfully'
            } else if (result === 'resetround') {
                successMessage = 'Round reset successfully'
            }

            if (data && data.message) {
                successMessage = data.message
            }

            setMessage(successMessage)

            if (result === 'generatefirst' || result === 'regenerate') {
                setGameStarted(true)
            }

            // SignalR will trigger updates automatically, but refresh immediately for immediate feedback
            await fetchAllData()
        } catch (err) {
            console.error('Handle game error', err)
            setError(err.message || 'Unable to process game action')
        } finally {
            setStarting(false)
            setStartingNewRound(false)
            setStartingRound(false)
            setResettingRound(false)
        }
    }

    const handleStart = async () => {
        const result = gameStarted ? 'regenerate' : 'generatefirst'
        await handleGame(result)
    }

    const handleNewRound = async () => {
        // Show confirmation dialog when round has started
        if (isRoundStarted()) {
            if (!window.confirm('This will end the current round and start a new round. Are you sure?')) {
                return
            }
        }
        await handleGame('generate')
    }

    const handleStartRound = async () => {
        await handleGame('start')
    }

    const handleResetRound = async () => {
        await handleGame('resetround')
    }

    const handleAddPlayer = async () => {
        if (!validatedCode) return

        // Validate player name
        const nameValidation = validateName(newPlayerName)

        if (!nameValidation.valid) {
            setError(nameValidation.error || 'Please enter a valid player name')
            setValidationErrors({ playerName: nameValidation.error })
            return
        }

        // Check rate limiting
        if (!addPlayerRateLimiter.canAttempt('add')) {
            setError('Too many player additions. Please wait a moment.')
            return
        }

        setAddingPlayer(true)
        setError(null)
        setMessage(null)
        setValidationErrors({})

        try {
            const url = `${apiBase}/${encodeURIComponent(validatedCode)}/join`
            const sanitizedName = nameValidation.sanitized
            const commander = "";

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participantId: sanitizedName,
                    participantName: sanitizedName,
                    commander: commander
                })
            })

            if (!res.ok) {
                const safeMessage = res.status === 400
                    ? 'Invalid player name or duplicate player'
                    : 'Unable to add player'
                throw new Error(safeMessage)
            }

            setMessage(`Player "${sanitizedName}" added successfully`)
            setNewPlayerName('')
            // SignalR will trigger fetchParticipants automatically
        } catch (err) {
            console.error('Add player error', err)
            setError(err.message || 'Unable to add player')
        } finally {
            setAddingPlayer(false)
        }
    }

    const handleDropPlayer = async (playerId) => {
        if (!validatedCode) return

        // Get player name for confirmation
        const player = participants.find(p => p.id === playerId)
        const playerName = player?.name ?? player?.id ?? 'this player'

        // Show confirmation dialog
        if (!window.confirm(`Are you sure you want to drop ${playerName}?`)) {
            return
        }

        // Validate player ID
        const playerIdValidation = validateUrlParam(playerId)
        if (!playerIdValidation.valid) {
            setError('Invalid player ID')
            return
        }

        // Check rate limiting
        if (!dropPlayerRateLimiter.canAttempt('drop')) {
            setError('Too many drop actions. Please wait a moment.')
            return
        }

        setDroppingPlayer(prev => ({ ...prev, [playerId]: true }))
        setError(null)
        setMessage(null)

        try {
            const url = `${apiBase}/${encodeURIComponent(validatedCode)}/report`
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participantId: playerIdValidation.sanitized,
                    result: 'drop',
                    commander: '',
                    statistics: {}
                })
            })

            if (!res.ok) {
                const safeMessage = res.status === 400
                    ? 'Invalid drop request'
                    : 'Unable to drop player'
                throw new Error(safeMessage)
            }

            setMessage('Player dropped successfully')
            // SignalR will trigger updates automatically
        } catch (err) {
            console.error('Drop player error', err)
            setError(err.message || 'Unable to drop player')
        } finally {
            setDroppingPlayer(prev => ({ ...prev, [playerId]: false }))
        }
    }

    const copyCode = async () => {
        if (!validatedCode) return
        try {
            await navigator.clipboard.writeText(validatedCode)
            setMessage('Code copied to clipboard!')
            setTimeout(() => setMessage(null), 3000)
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
                setMessage('Code copied to clipboard!')
                setTimeout(() => setMessage(null), 3000)
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
            setMessage('Join URL copied to clipboard!')
            setTimeout(() => setMessage(null), 3000)
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
                setMessage('Join URL copied to clipboard!')
                setTimeout(() => setMessage(null), 3000)
            } catch {
                alert(`Copy this URL: ${url}`)
            }
            document.body.removeChild(textArea)
        }
    }

    // Check if current round has been started
    const isRoundStarted = () => {
        if (!currentRound) return false
        if (Array.isArray(currentRound)) {
            if (currentRound.length > 0 && currentRound[0].roundStarted) {
                return true
            }
            return false
        }
        const groups = currentRound.groups ?? []
        if (groups.length > 0) {
            return groups[0].roundStarted ?? currentRound.roundStarted ?? false
        }
        return currentRound.roundStarted ?? false
    }

    // Extract timer data from current round for the section-level timer
    const getCurrentRoundTimerData = () => {
        if (!currentRound) return { startedAtUtc: null, roundStarted: false, roundLength: null }

        let groups = []

        if (Array.isArray(currentRound)) {
            groups = currentRound
        } else {
            groups = currentRound.groups ?? []
        }

        // Check if any group has roundStarted === true
        const startedGroup = groups.find(group => group.roundStarted === true)

        if (startedGroup) {
            return {
                startedAtUtc: startedGroup.startedAtUtc ?? null,
                roundStarted: true,
                roundLength: startedGroup.roundLength ?? null
            }
        }

        return { startedAtUtc: null, roundStarted: false, roundLength: null }
    }

    // SignalR Connection Setup
    useEffect(() => {
        if (!validatedCode || !validatedHostId) {
            return
        }

        sessionStorage.setItem('hostRoomCode', validatedCode)
        sessionStorage.setItem(`hostId_${validatedCode}`, validatedHostId)

        // Initial data fetch
        fetchAllData()

        // Setup SignalR connection
        const hubUrl = `${signalRBase}/hubs/rooms`
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl)
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    // Exponential backoff: 0s, 2s, 10s, 30s, then 60s max
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
            // Rejoin the room group
            connection.invoke('JoinRoomGroup', validatedCode).catch(err =>
                console.error('Error rejoining room:', err)
            )
            // Refresh data after reconnection
            fetchAllData()
        })

        connection.onclose(() => {
            console.log('SignalR connection closed')
            setConnectionStatus('disconnected')
        })

        // SignalR message handlers
        connection.on('ParticipantJoined', (data) => {
            console.log('ParticipantJoined event received:', data)
            fetchParticipants()
        })

        connection.on('RoundGenerated', (data) => {
            console.log('RoundGenerated event received:', data)
            fetchCurrentRound()
            fetchArchivedRounds()
        })

        connection.on('RoundStarted', (data) => {
            console.log('RoundStarted event received:', data)
            fetchCurrentRound()
            fetchArchivedRounds()
        })

        connection.on('ParticipantDroppedOut', (data) => {
            console.log('ParticipantDroppedOut event received:', data)
            fetchParticipants()
            fetchCurrentRound()
        })

        connection.on('GroupEnded', (data) => {
            console.log('GroupEnded event received:', data)
            fetchCurrentRound()
        })

        connection.on('SettingsChanged', (data) => {
            console.log('SettingsChanged event received:', data)
            fetchAllData()
        })

        connection.on('RoomExpired', (data) => {
            console.log('RoomExpired event received:', data)
            setError('This room has expired.')
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
                // Join the room group
                return connection.invoke('JoinRoomGroup', validatedCode)
            })
            .then(() => {
                console.log(`Joined room: ${validatedCode}`)
            })
            .catch(err => {
                console.error('SignalR Connection Error:', err)
                setConnectionStatus('disconnected')
                // Fallback to polling if SignalR fails
                console.log('Falling back to polling...')
                pollRef.current = setInterval(() => {
                    fetchAllData()
                }, 60000)
            })

        return () => {
            if (hubConnectionRef.current) {
                hubConnectionRef.current.stop()
                    .then(() => console.log('SignalR connection stopped'))
                    .catch(err => console.error('Error stopping SignalR:', err))
            }
            if (pollRef.current) {
                clearInterval(pollRef.current)
                pollRef.current = null
            }
        }
    }, [validatedCode, validatedHostId])

    const roundStarted = isRoundStarted()
    const timerData = getCurrentRoundTimerData()

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Host Dashboard</h1>
                <div style={styles.hostInfo}>
                    <span style={styles.hostLabel}>Host ID:</span>
                    <span style={styles.hostId}>{validatedHostId}</span>
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

            {/* Room Code Banner */}
            <div style={styles.codeBanner}>
                <div style={styles.codeContent}>
                    <div>
                        <div style={styles.codeLabel}>Room Code</div>
                        <div style={styles.code}>{validatedCode}</div>
                        <div style={styles.codeHint}>Share this code with players to join</div>
                    </div>
                    <div style={styles.codeActions}>
                        <button onClick={copyCode} style={styles.copyButton}>
                            📋 Copy Code
                        </button>
                        <button onClick={() => setShowQR(!showQR)} style={styles.qrToggleButton}>
                            📱 {showQR ? 'Hide' : 'Show'} QR Code
                        </button>
                    </div>
                </div>

                {/* QR Code Display */}
                {showQR && (
                    <div style={styles.qrSection}>
                        <div style={styles.qrCodeWrapper}>
                            <QRCodeSVG
                                value={getJoinUrl()}
                                size={200}
                                level="H"
                                includeMargin={true}
                                bgColor="#ffffff"
                                fgColor="#000000"
                            />
                        </div>
                        <div style={styles.qrInfo}>
                            <p style={styles.qrDescription}>
                                Players can scan this QR code to join with the room code pre-filled
                            </p>
                            <button onClick={copyJoinUrl} style={styles.copyUrlButton}>
                                🔗 Copy Join URL
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Messages */}
            {error && (
                <div style={styles.errorMessage}>
                    <span>⚠️</span> {error}
                </div>
            )}
            {message && (
                <div style={styles.successMessage}>
                    <span>✅</span> {message}
                </div>
            )}

            {/* Control Panel */}
            <div style={styles.controlPanel}>
                <h3 style={styles.sectionTitle}>Game Controls</h3>
                <div style={styles.buttonGrid}>
                    <button
                        onClick={handleStart}
                        disabled={starting || loading || roundStarted}
                        style={{ ...styles.actionButton, ...styles.startButton }}
                    >
                        {starting ? (
                            <>
                                <span style={styles.spinner}></span>
                                {gameStarted ? 'Resetting...' : 'Starting...'}
                            </>
                        ) : (
                            <>
                                {gameStarted ? '🔄 Reset Game' : '🚀 Start Game'}
                            </>
                        )}
                    </button>
                    <button
                        onClick={roundStarted ? handleResetRound : handleStartRound}
                        disabled={(roundStarted ? resettingRound : startingRound) || loading || !currentRound}
                        style={{ ...styles.actionButton, ...styles.startButton }}
                    >
                        {(roundStarted ? resettingRound : startingRound) ? (
                            <>
                                <span style={styles.spinner}></span>
                                {roundStarted ? 'Resetting...' : 'Starting...'}
                            </>
                        ) : (
                            <>
                                {roundStarted ? '🔄 Reset Round' : '▶️ Start Round'}
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleNewRound}
                        disabled={startingNewRound || loading }
                        style={{ ...styles.actionButton, ...styles.newRoundButton }}
                    >
                        {startingNewRound ? (
                            <>
                                <span style={styles.spinner}></span>
                                Starting...
                            </>
                        ) : (
                            '➕ New Round'
                        )}
                    </button>
                </div>
            </div>

            {/* Add Player Section */}
            <div style={styles.addPlayerSection}>
                <h3 style={styles.sectionTitle}>Add Player</h3>
                <div style={styles.addPlayerForm}>
                    <label style={styles.inputWrapper}>
                        <input
                            type="text"
                            value={newPlayerName}
                            onChange={handlePlayerNameChange}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !addingPlayer && !validationErrors.playerName) {
                                    handleAddPlayer()
                                }
                            }}
                            placeholder="Enter player name"
                            style={{
                                ...styles.playerInput,
                                ...(validationErrors.playerName ? styles.inputError : {})
                            }}
                            disabled={addingPlayer}
                            maxLength={50}
                            aria-invalid={!!validationErrors.playerName}
                            aria-describedby={validationErrors.playerName ? "player-name-error" : undefined}
                        />
                        {validationErrors.playerName && (
                            <span id="player-name-error" style={styles.validationError}>
                                {validationErrors.playerName}
                            </span>
                        )}
                    </label>
                    <button
                        onClick={handleAddPlayer}
                        disabled={addingPlayer || !newPlayerName.trim() || !!validationErrors.playerName}
                        style={{
                            ...styles.addButton,
                            ...((addingPlayer || !newPlayerName.trim() || !!validationErrors.playerName) ? styles.buttonDisabled : {})
                        }}
                    >
                        {addingPlayer ? (
                            <>
                                <span style={styles.spinner}></span>
                                Adding...
                            </>
                        ) : (
                            '➕ Add Player'
                        )}
                    </button>
                </div>
            </div>

            {/* Participants List */}
            <div style={styles.participantsSection}>
                <h3 style={styles.sectionTitle}>
                    Players ({participants.length})
                </h3>
                {participants.length > 0 ? (
                    <div style={styles.participantsGrid}>
                        {participants.map((p, i) => (
                            <div key={p.id ?? i} style={styles.participantCard}>
                                <span style={styles.participantName}>
                                    <span style={styles.participantDot}>●</span>
                                    {p.name ?? p.id ?? 'Unknown'}
                                </span>
                                <button
                                    onClick={() => handleDropPlayer(p.id)}
                                    disabled={droppingPlayer[p.id]}
                                    style={styles.dropButton}
                                    title="Drop player"
                                    aria-label={`Drop ${p.name ?? p.id}`}
                                >
                                    {droppingPlayer[p.id] ? '...' : '🚪'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        No players have joined yet. Share the room code to get started!
                    </div>
                )}
            </div>

            {/* Rounds Display */}
            <div style={styles.roundsSection}>
                <div style={styles.sectionTitleRow}>
                    <h3 style={styles.sectionTitle}>Game Rounds</h3>
                    {timerData && (
                        <RoundCountdownTimer
                            startedAtUtc={timerData.startedAtUtc}
                            roundLength={timerData.roundLength}
                            roundStarted={timerData.roundStarted}
                        />
                    )}
                </div>
                {(archivedRounds.length > 0 || currentRound) ? (
                    <div ref={roundsContainerRef} style={styles.roundsContainer}>
                        {archivedRounds.map((round, idx) => (
                            <RoundDisplay
                                key={idx}
                                round={round}
                                index={idx}
                                label={`Round ${idx + 1}`}
                            />
                        ))}
                        {currentRound && (
                            <RoundDisplay
                                round={currentRound}
                                label="Current Round"
                            />
                        )}
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        No rounds available yet. Click "Start Game" to begin!
                    </div>
                )}
            </div>
        </div>
    )
}