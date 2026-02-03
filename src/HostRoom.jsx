import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { apiBase } from './api'
import { validateName, validateUrlParam, RateLimiter } from './utils/validation'
import { styles } from './styles/HostRoom.styles'
// Rate limiters for different actions
const addPlayerRateLimiter = new RateLimiter(10, 60000) // 10 additions per minute
const dropPlayerRateLimiter = new RateLimiter(20, 60000) // 20 drops per minute
const gameActionRateLimiter = new RateLimiter(15, 60000) // 15 game actions per minute

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

function RoundDisplay({ round, index, label }) {
    if (!round) return null

    let groups = []
    let roundNumber = 'N/A'
    let startedAtUtc = null

    if (Array.isArray(round)) {
        groups = round
        if (groups.length > 0 && groups[0].round !== undefined) {
            roundNumber = groups[0].round
        } else if (index !== undefined) {
            roundNumber = index + 1
        }
    } else {
        roundNumber = round.round ?? round.roundNumber ?? (index !== undefined ? index + 1 : 'N/A')
        groups = round.groups ?? []
        startedAtUtc = round.startedAtUtc
    }
    
    return (
        <div style={styles.roundCard}>
            <div style={styles.roundHeader}>
                <h4 style={styles.roundTitle}>
                    {label || `Round ${roundNumber}`}
                </h4>
                {startedAtUtc && <RoundTimer startedAtUtc={startedAtUtc} />}
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
    const [gameStarted, setGameStarted] = useState(false)
    const [newPlayerName, setNewPlayerName] = useState('')
    const [addingPlayer, setAddingPlayer] = useState(false)
    const [droppingPlayer, setDroppingPlayer] = useState({})
    const [showQR, setShowQR] = useState(false)
    const pollRef = useRef(null)
    
    // Validation state
    const [validationErrors, setValidationErrors] = useState({})
    const [validatedCode, setValidatedCode] = useState('')
    const [validatedHostId, setValidatedHostId] = useState('')

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

    const handleStart = async () => {
        if (!validatedCode) return
        
        // Check rate limiting
        if (!gameActionRateLimiter.canAttempt('start')) {
            setError('Too many game actions. Please wait a moment.')
            return
        }
        
        setStarting(true)
        setError(null)
        setMessage(null)
        try {
            const url = `${apiBase}/${encodeURIComponent(validatedCode)}/start`
            const res = await fetch(url)
            if (!res.ok) {
                const safeMessage = res.status === 400 
                    ? 'Invalid game state' 
                    : 'Unable to start game'
                throw new Error(safeMessage)
            }
            const data = await res.json().catch(() => null)
            setMessage(
                data && data.message
                    ? `${gameStarted ? 'Reset' : 'Started'}: ${data.message}`
                    : `Game ${gameStarted ? 'reset' : 'started'} successfully`
            )
            setGameStarted(true)
            await fetchAllData()
        } catch (err) {
            console.error('Start game error', err)
            setError(err.message || 'Unable to start game')
        } finally {
            setStarting(false)
        }
    }

    const handleNewRound = async () => {
        if (!validatedCode) return
        
        // Check rate limiting
        if (!gameActionRateLimiter.canAttempt('newround')) {
            setError('Too many game actions. Please wait a moment.')
            return
        }
        
        setStartingNewRound(true)
        setError(null)
        setMessage(null)
        try {
            const url = `${apiBase}/${encodeURIComponent(validatedCode)}/newround`
            const res = await fetch(url)
            if (!res.ok) {
                const safeMessage = res.status === 400 
                    ? 'Invalid game state for new round' 
                    : 'Unable to start new round'
                throw new Error(safeMessage)
            }
            const data = await res.json().catch(() => null)
            setMessage(
                data && data.message
                    ? data.message
                    : 'New round started successfully'
            )
            await fetchAllData()
        } catch (err) {
            console.error('New round error', err)
            setError(err.message || 'Unable to start new round')
        } finally {
            setStartingNewRound(false)
        }
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
            
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participantId: sanitizedName,
                    participantName: sanitizedName
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
            await fetchParticipants()
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
                    result: 'Drop'
                })
            })
            
            if (!res.ok) {
                const safeMessage = res.status === 400 
                    ? 'Invalid drop request' 
                    : 'Unable to drop player'
                throw new Error(safeMessage)
            }
            
            setMessage('Player dropped successfully')
            await fetchAllData()
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

    // Extract startedAtUtc from current round for the section-level timer
    const getCurrentRoundStartTime = () => {
        if (!currentRound) return null

        if (Array.isArray(currentRound)) {
            if (currentRound.length > 0 && currentRound[0].startedAtUtc) {
                return currentRound[0].startedAtUtc
            }
        } else {
            return currentRound.startedAtUtc
        }
        return null
    }

    useEffect(() => {
        if (!validatedCode || !validatedHostId) {
            return
        }

        sessionStorage.setItem('hostRoomCode', validatedCode)
        sessionStorage.setItem(`hostId_${validatedCode}`, validatedHostId)

        fetchAllData()

        pollRef.current = setInterval(() => {
            fetchAllData()
        }, 60000)

        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current)
                pollRef.current = null
            }
        }
    }, [validatedCode, validatedHostId])

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>🎮 Host Dashboard</h1>
                <div style={styles.hostInfo}>
                    <span style={styles.hostLabel}>Host ID:</span>
                    <span style={styles.hostId}>{validatedHostId}</span>
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
                        disabled={starting || loading}
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
                        onClick={handleNewRound}
                        disabled={startingNewRound || loading}
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
                    <button
                        onClick={fetchAllData}
                        disabled={loading}
                        style={{ ...styles.actionButton, ...styles.refreshButton }}
                    >
                        {loading ? (
                            <>
                                <span style={styles.spinner}></span>
                                Refreshing...
                            </>
                        ) : (
                            '🔄 Refresh'
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
                    {currentRound && getCurrentRoundStartTime() && (
                        <RoundTimer startedAtUtc={getCurrentRoundStartTime()} />
                    )}
                </div>
                {(archivedRounds.length > 0 || currentRound) ? (
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
                        No rounds available yet. Click "Start Game" to begin!
                    </div>
                )}
            </div>
        </div>
    )
}