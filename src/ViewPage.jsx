import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as signalR from '@microsoft/signalr'
import { apiBase, signalRBase } from './api'
import { validateRoomCode, validateUrlParam, RateLimiter } from './utils/validation'
import { calculateTimeRemaining } from './utils/timerUtils'
import { isInCustomGroup, getCustomGroupColor } from './utils/customGroupColors'
import { styles } from './styles/ViewPage.styles'

// Rate limiters for different actions
const viewRoomRateLimiter = new RateLimiter(5, 60000)
const refreshRateLimiter = new RateLimiter(10, 60000)

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
    let roundLength = null

    if (Array.isArray(round)) {
        groups = round
        if (groups.length > 0) {
            if (groups[0].round !== undefined) {
                roundNumber = groups[0].round
            } else if (index !== undefined) {
                roundNumber = index + 1
            }
            // Extract timer data from first group
            startedAtUtc = groups[0].startedAtUtc
            roundStarted = groups[0].roundStarted ?? false
            roundLength = groups[0].roundLength
        }
    } else {
        roundNumber = round.round ?? round.roundNumber ?? (index !== undefined ? index + 1 : 'N/A')
        groups = round.groups ?? []
        startedAtUtc = round.startedAtUtc
        roundStarted = round.roundStarted ?? false
        roundLength = round.roundLength
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
                    const statistics = group.statistics ?? {}

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
                                    {members
                                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                        .map((member, memberIdx) => {
                                            const isDropped = member.dropped === true
                                            const inCustom = isInCustomGroup(member.inCustomGroup)
                                            const customGroupColor = inCustom ? getCustomGroupColor(member.inCustomGroup) : null
                                            
                                            return (
                                                <div 
                                                    key={memberIdx} 
                                                    style={{
                                                        ...styles.memberItem,
                                                        ...(isDropped ? { opacity: 0.5, textDecoration: 'line-through' } : {})
                                                    }}
                                                >
                                                    <span style={styles.memberDot}>●</span>
                                                    <span>
                                                        {member.name ?? member.id ?? 'Unknown'}
                                                        {member.commander && (
                                                            <span style={{ 
                                                                fontSize: '0.85em', 
                                                                color: 'var(--text-secondary)', 
                                                                fontStyle: 'italic',
                                                                marginLeft: '8px'
                                                            }}>
                                                                ({member.commander})
                                                            </span>
                                                        )}
                                                    </span>
                                                    {isDropped && (
                                                        <span style={{ 
                                                            fontSize: '0.75em',
                                                            backgroundColor: '#ff4444',
                                                            color: 'white',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            marginLeft: '8px',
                                                            fontWeight: '600'
                                                        }}>
                                                            DROPPED
                                                        </span>
                                                    )}
                                                    {inCustom && (
                                                        <span style={{ 
                                                            fontSize: '0.75em',
                                                            backgroundColor: customGroupColor,
                                                            color: 'white',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            marginLeft: '8px',
                                                            fontWeight: '600'
                                                        }}>
                                                            CUSTOM
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                </div>
                            )}

                            {/* Display Statistics */}
                            {Object.keys(statistics).length > 0 && (
                                <div style={styles.statisticsSection}>
                                    <h5 style={styles.statisticsHeader}>📊 Game Statistics</h5>
                                    <div style={styles.statisticsList}>
                                        {Object.entries(statistics).map(([key, value], statIdx) => {
                                            // Format the key for display
                                            let displayKey = key
                                            if (key.includes('_Commander')) {
                                                const playerId = key.split('_')[0]
                                                displayKey = `${playerId}'s Commander`
                                            } else if (key === 'TurnCount') {
                                                displayKey = 'Turn Count'
                                            } else if (key === 'FirstPlayer') {
                                                displayKey = 'First Player'
                                            } else if (key === 'PlayerOrder') {
                                                displayKey = 'Player Order'
                                            } else if (key === 'WinCondition') {
                                                displayKey = 'Win Condition'
                                            } else if (key === 'Bracket') {
                                                displayKey = 'Bracket'
                                            }

                                            return (
                                                <div key={statIdx} style={styles.statisticItem}>
                                                    <span style={styles.statisticLabel}>{displayKey}:</span>
                                                    <span style={styles.statisticValue}>{value}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
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

export default function ViewPage() {
    const { code: paramCode } = useParams()
    const navigate = useNavigate()
    const [code, setCode] = useState('')
    const [validatedCode, setValidatedCode] = useState('')
    const [participants, setParticipants] = useState([])
    const [currentRound, setCurrentRound] = useState(null)
    const [archivedRounds, setArchivedRounds] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [gameStarted, setGameStarted] = useState(false)
    const [isViewing, setIsViewing] = useState(false)
    const pollRef = useRef(null)
    const hubConnectionRef = useRef(null)
    const [connectionStatus, setConnectionStatus] = useState('disconnected')
    
    // Validation state
    const [validationErrors, setValidationErrors] = useState({})

    // Validate URL parameter on mount
    useEffect(() => {
        if (paramCode) {
            const codeValidation = validateUrlParam(paramCode)
            
            if (!codeValidation.valid) {
                navigate('/view', { replace: true })
                setError('Invalid room code in URL')
                return
            }
            
            setCode(codeValidation.sanitized)
            setValidatedCode(codeValidation.sanitized)
            
            // Auto-view if URL parameter is present
            if (!isViewing) {
                fetchAllData(codeValidation.sanitized)
            }
        }
    }, [paramCode, navigate])

    const handleCodeChange = (e) => {
        const validated = validateRoomCode(e.target.value)
        setCode(validated.sanitized)
        
        if (validated.error) {
            setValidationErrors(prev => ({ ...prev, code: validated.error }))
        } else {
            setValidationErrors(prev => {
                const { code, ...rest } = prev
                return rest
            })
        }
    }

    const fetchParticipants = async (roomCode) => {
        if (!roomCode) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(roomCode)}`)
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
            throw err
        }
    }

    const fetchCurrentRound = async (roomCode) => {
        if (!roomCode) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(roomCode)}/current`)
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

    const fetchArchivedRounds = async (roomCode) => {
        if (!roomCode) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(roomCode)}/archived`)
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

    const fetchAllData = async (roomCode) => {
        // Check rate limiting
        if (!refreshRateLimiter.canAttempt('refresh')) {
            setError('Too many refresh attempts. Please wait a moment.')
            return
        }
        
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(roomCode)}/summary`)
            if (!res.ok) {
                const safeMessage = res.status === 404 ? 'Room not found' : 'Unable to load room data'
                throw new Error(safeMessage)
            }
            
            const data = await res.json().catch(() => null)
            if (!data) {
                throw new Error('Invalid response from server')
            }
            
            // Update all state from the summary response
            setParticipants(data.participants ?? [])
            setCurrentRound(data.currentGroups?.length > 0 ? data.currentGroups : null)
            setArchivedRounds(data.archivedRounds ?? [])
            setGameStarted(data.isGameStarted ?? false)
            
            setIsViewing(true)
            setValidatedCode(roomCode)
            
            // Navigate to the parameterized route
            if (!paramCode) {
                navigate(`/view/${roomCode}`, { replace: true })
            }
        } catch (err) {
            console.error('Fetch all data error', err)
            setError(err.message || 'Failed to load room data')
            setIsViewing(false)
        } finally {
            setLoading(false)
        }
    }

    const handleView = () => {
        // Validate room code
        const codeValidation = validateRoomCode(code)
        
        if (!codeValidation.valid) {
            setError(codeValidation.error || 'Please enter a valid room code')
            setValidationErrors({ code: codeValidation.error })
            return
        }
        
        // Check rate limiting
        if (!viewRoomRateLimiter.canAttempt('view')) {
            setError('Too many view attempts. Please wait a moment.')
            return
        }
        
        setValidationErrors({})
        fetchAllData(codeValidation.sanitized)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading && !validationErrors.code) {
            handleView()
        }
    }

    const handleNewSearch = () => {
        setIsViewing(false)
        setCode('')
        setValidatedCode('')
        setParticipants([])
        setCurrentRound(null)
        setArchivedRounds([])
        setGameStarted(false)
        setError(null)
        setValidationErrors({})
        navigate('/view', { replace: true })
        
        // Disconnect SignalR
        if (hubConnectionRef.current) {
            hubConnectionRef.current.invoke('LeaveRoomGroup', validatedCode)
                .catch(err => console.error('Error leaving room group:', err))
                .finally(() => {
                    hubConnectionRef.current.stop()
                })
        }
        if (pollRef.current) {
            clearInterval(pollRef.current)
            pollRef.current = null
        }
    }

    const handleRefresh = () => {
        if (validatedCode) {
            fetchAllData(validatedCode)
        }
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
        if (!isViewing || !validatedCode) {
            return
        }

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
            fetchAllData(validatedCode)
        })

        connection.onclose(() => {
            console.log('SignalR connection closed')
            setConnectionStatus('disconnected')
        })

        // SignalR message handlers
        connection.on('ParticipantJoined', (data) => {
            console.log('ParticipantJoined event received:', data)
            fetchParticipants(validatedCode)
        })

        connection.on('RoundGenerated', (data) => {
            console.log('RoundGenerated event received:', data)
            fetchCurrentRound(validatedCode)
            fetchArchivedRounds(validatedCode)
        })

        connection.on('RoundStarted', (data) => {
            console.log('RoundStarted event received:', data)
            fetchCurrentRound(validatedCode)
            fetchArchivedRounds(validatedCode)
        })

        connection.on('ParticipantDroppedOut', (data) => {
            console.log('ParticipantDroppedOut event received:', data)
            fetchParticipants(validatedCode)
            fetchCurrentRound(validatedCode)
        })

        connection.on('GroupEnded', (data) => {
            console.log('GroupEnded event received:', data)
            fetchCurrentRound(validatedCode)
        })

        connection.on('SettingsChanged', (data) => {
            console.log('SettingsChanged event received:', data)
            fetchAllData(validatedCode)
        })

        //connection.on('RoomExpired', (data) => {
        //    console.log('RoomExpired event received:', data)
        //    setError('This room has expired.')
        //    if (hubConnectionRef.current) {
        //        hubConnectionRef.current.stop()
        //    }
        //})

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
                    if (refreshRateLimiter.canAttempt('poll')) {
                        fetchAllData(validatedCode)
                    }
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
    }, [isViewing, validatedCode])

    if (!isViewing) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>View Game</h1>
                    <p style={styles.subtitle}>
                        Enter a room code to view the game status in real-time
                    </p>
                </div>

                <div style={styles.searchCard}>
                    <div style={styles.searchContent}>
                        <label style={styles.label}>
                            Room Code
                            <input
                                type="text"
                                value={code}
                                onChange={handleCodeChange}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter room code"
                                style={{
                                    ...styles.input,
                                    ...(validationErrors.code ? styles.inputError : {})
                                }}
                                disabled={loading}
                                autoFocus
                                maxLength={20}
                                aria-invalid={!!validationErrors.code}
                                aria-describedby={validationErrors.code ? "code-error" : undefined}
                            />
                            {validationErrors.code && (
                                <span id="code-error" style={styles.validationError}>
                                    {validationErrors.code}
                                </span>
                            )}
                        </label>
                        <button
                            onClick={handleView}
                            disabled={loading || !code.trim() || !!validationErrors.code}
                            style={{
                                ...styles.viewButton,
                                ...(loading || !code.trim() || !!validationErrors.code ? styles.buttonDisabled : {})
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.spinner}></span>
                                    Loading...
                                </>
                            ) : (
                                <>View Game</>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div style={styles.errorMessage}>
                            <span>⚠️</span> {error}
                        </div>
                    )}
                </div>

                <div style={styles.infoCard}>
                    <h3 style={styles.infoTitle}>ℹ️ About View Mode</h3>
                    <p style={styles.infoText}>
                        View mode allows you to spectate a game in real-time without joining as a player or host.
                        Perfect for tournament organizers, friends watching, or anyone interested in following along.
                    </p>
                    <ul style={styles.infoList}>
                        <li>See all players in the game</li>
                        <li>View current and past rounds</li>
                        <li>Track game progress and results</li>
                        <li>Real-time updates via SignalR</li>
                    </ul>
                </div>
            </div>
        )
    }

    const timerData = getCurrentRoundTimerData()

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Viewing Game</h1>
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

            {/* Room Code Banner */}
            <div style={styles.codeBanner}>
                <div style={styles.codeContent}>
                    <div>
                        <div style={styles.codeLabel}>Room Code</div>
                        <div style={styles.code}>{validatedCode}</div>
                        <div style={styles.codeHint}>Read-only view • Real-time updates</div>
                    </div>
                    <button onClick={handleNewSearch} style={styles.changeButton}>
                        🔍 View Different Game
                    </button>
                </div>
            </div>

            {error && (
                <div style={styles.errorMessage}>
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Participants List */}
            <div style={styles.participantsSection}>
                <h3 style={styles.sectionTitle}>
                    Players ({participants.length})
                </h3>
                {loading && participants.length === 0 ? (
                    <div style={styles.loadingState}>
                        <span style={styles.spinner}></span>
                        <span>Loading players...</span>
                    </div>
                ) : participants.length > 0 ? (
                    <div style={styles.participantsGrid}>
                        {participants.map((p, i) => (
                            <div key={p.id ?? i} style={styles.participantCard}>
                                <span style={styles.participantName}>
                                    <span style={styles.participantDot}>●</span>
                                    {p.name ?? p.id ?? 'Unknown'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        No players have joined yet.
                    </div>
                )}
            </div>

            {/* Rounds Display */}
            <div style={styles.roundsSection}>
                <div style={styles.roundsHeader}>
                    <h3 style={styles.sectionTitle}>Game Rounds</h3>
                    <div style={styles.headerActions}>
                        <RoundCountdownTimer 
                            startedAtUtc={timerData.startedAtUtc}
                            roundLength={timerData.roundLength}
                            roundStarted={timerData.roundStarted}
                        />
                    </div>
                </div>
                {loading && archivedRounds.length === 0 && !currentRound ? (
                    <div style={styles.loadingState}>
                        <span style={styles.spinner}></span>
                        <span>Loading rounds...</span>
                    </div>
                ) : (archivedRounds.length > 0 || currentRound) ? (
                    <div style={styles.roundsContainer}>
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
                        No rounds available yet. The game hasn't started.
                    </div>
                )}
            </div>
        </div>
    )
}