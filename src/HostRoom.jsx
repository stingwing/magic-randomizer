import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { apiBase } from './api'

function RoundDisplay({ round, index, label }) {
    if (!round) return null

    let groups = []
    let roundNumber = 'N/A'

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
    }

    return (
        <div style={styles.roundCard}>
            <h4 style={styles.roundTitle}>
                {label || `Round ${roundNumber}`}
            </h4>

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
                                            <span style={{...styles.resultValue, color: 'var(--success-color)', fontWeight: '600'}}>
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
    const { code } = useParams()
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

    const getJoinUrl = () => {
        const baseUrl = window.location.origin
        return `${baseUrl}/?code=${encodeURIComponent(code)}`
    }

    const fetchParticipants = async () => {
        if (!code) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(code)}`)
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
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
        if (!code) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(code)}/current`)
            if (res.status === 404 || res.status === 204) {
                setCurrentRound(null)
                return
            }
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
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
        if (!code) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(code)}/archived`)
            if (res.status === 404 || res.status === 204) {
                setArchivedRounds([])
                return
            }
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
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
        setStarting(true)
        setError(null)
        setMessage(null)
        try {
            const url = `${apiBase}/${encodeURIComponent(code)}/start`
            const res = await fetch(url)
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
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
            setError(err.message || 'Unknown error while starting game')
        } finally {
            setStarting(false)
        }
    }

    const handleNewRound = async () => {
        setStartingNewRound(true)
        setError(null)
        setMessage(null)
        try {
            const url = `${apiBase}/${encodeURIComponent(code)}/newround`
            const res = await fetch(url)
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
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
            setError(err.message || 'Unknown error while starting new round')
        } finally {
            setStartingNewRound(false)
        }
    }

    const handleAddPlayer = async () => {
        if (!newPlayerName.trim()) {
            setError('Please enter a player name')
            return
        }

        setAddingPlayer(true)
        setError(null)
        setMessage(null)
        try {   
            const url = `${apiBase}/${encodeURIComponent(code)}/join`
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participantId: newPlayerName,
                    participantName: newPlayerName
                })
            })
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }
            setMessage(`Player "${newPlayerName.trim()}" added successfully`)
            setNewPlayerName('')
            await fetchParticipants()
        } catch (err) {
            console.error('Add player error', err)
            setError(err.message || 'Unknown error while adding player')
        } finally {
            setAddingPlayer(false)
        }
    }

    const handleDropPlayer = async (playerId) => {
        setDroppingPlayer(prev => ({ ...prev, [playerId]: true }))
        setError(null)
        setMessage(null)
        try {
            const url = `${apiBase}/${encodeURIComponent(code)}/report`
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participantId: playerId,
                    result: 'Drop'
                })
            })
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }
            setMessage('Player dropped successfully')
            await fetchAllData()
        } catch (err) {
            console.error('Drop player error', err)
            setError(err.message || 'Unknown error while dropping player')
        } finally {
            setDroppingPlayer(prev => ({ ...prev, [playerId]: false }))
        }
    }

    const copyCode = async () => {
        if (!code) return
        try {
            await navigator.clipboard.writeText(code)
            setMessage('Code copied to clipboard!')
            setTimeout(() => setMessage(null), 3000)
        } catch {
            alert(`Copy this code: ${code}`)
        }
    }

    const copyJoinUrl = async () => {
        const url = getJoinUrl()
        try {
            await navigator.clipboard.writeText(url)
            setMessage('Join URL copied to clipboard!')
            setTimeout(() => setMessage(null), 3000)
        } catch {
            alert(`Copy this URL: ${url}`)
        }
    }

    useEffect(() => {
        if (!code) {
            navigate('/')
            return
        }

        localStorage.setItem('hostRoomCode', code)

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
    }, [code])

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>🎮 Host Dashboard</h1>
            </div>

            {/* Room Code Banner */}
            <div style={styles.codeBanner}>
                <div style={styles.codeContent}>
                    <div>
                        <div style={styles.codeLabel}>Room Code</div>
                        <div style={styles.code}>{code}</div>
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
                        style={{...styles.actionButton, ...styles.startButton}}
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
                        style={{...styles.actionButton, ...styles.newRoundButton}}
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
                        style={{...styles.actionButton, ...styles.refreshButton}}
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
                    <input
                        type="text"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleAddPlayer()
                            }
                        }}
                        placeholder="Enter player name"
                        style={styles.playerInput}
                        disabled={addingPlayer}
                    />
                    <button
                        onClick={handleAddPlayer}
                        disabled={addingPlayer || !newPlayerName.trim()}
                        style={styles.addButton}
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
                <h3 style={styles.sectionTitle}>Game Rounds</h3>
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

const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1rem'
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0
    },
    codeBanner: {
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 24px rgba(100, 108, 255, 0.3)'
    },
    codeContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap'
    },
    codeLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '0.9rem',
        fontWeight: '500',
        marginBottom: '0.5rem'
    },
    code: {
        color: 'white',
        fontSize: '3rem',
        fontWeight: '700',
        letterSpacing: '0.15em',
        marginBottom: '0.5rem'
    },
    codeHint: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '0.9rem'
    },
    codeActions: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
    },
    copyButton: {
        padding: '1rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        background: 'white',
        color: '#646cff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    },
    qrToggleButton: {
        padding: '1rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        background: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        border: '2px solid white',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    },
    qrSection: {
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '2px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    qrCodeWrapper: {
        background: 'white',
        padding: '1.5rem',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
    },
    qrInfo: {
        flex: '1 1 300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    qrDescription: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '1rem',
        lineHeight: '1.6',
        margin: 0
    },
    copyUrlButton: {
        padding: '0.875rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        background: 'white',
        color: '#646cff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        width: 'fit-content'
    },
    errorMessage: {
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        background: 'var(--error-bg)',
        border: '1px solid var(--error-border)',
        color: 'var(--error-text)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        animation: 'slideIn 0.3s ease'
    },
    successMessage: {
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        background: 'var(--success-bg)',
        border: '1px solid var(--success-border)',
        color: 'var(--success-text)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        animation: 'slideIn 0.3s ease'
    },
    controlPanel: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    sectionTitle: {
        fontSize: '1.3rem',
        fontWeight: '600',
        marginBottom: '1.5rem',
        color: 'var(--text-primary)'
    },
    buttonGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem'
    },
    actionButton: {
        padding: '1rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        color: 'white'
    },
    startButton: {
        background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
        boxShadow: '0 4px 12px rgba(81, 207, 102, 0.3)'
    },
    newRoundButton: {
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        boxShadow: '0 4px 12px rgba(100, 108, 255, 0.3)'
    },
    refreshButton: {
        background: 'linear-gradient(135deg, #ffd43b 0%, #fab005 100%)',
        color: '#333',
        boxShadow: '0 4px 12px rgba(255, 212, 59, 0.3)'
    },
    addPlayerSection: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    addPlayerForm: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
    },
    playerInput: {
        flex: '1 1 300px',
        padding: '1rem',
        fontSize: '1rem',
        borderRadius: '10px'
    },
    addButton: {
        padding: '1rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    participantsSection: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    participantsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem'
    },
    participantCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        transition: 'all 0.2s ease'
    },
    participantName: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '1rem',
        fontWeight: '500',
        color: 'var(--text-primary)'
    },
    participantDot: {
        color: 'var(--success-color)',
        fontSize: '0.8rem'
    },
    dropButton: {
        padding: '0.5rem 0.75rem',
        fontSize: '1rem',
        background: '#ff6b6b',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    roundsSection: {
        marginBottom: '2rem'
    },
    roundsContainer: {
        display: 'flex',
        gap: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '1rem'
    },
    roundCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.5rem',
        minWidth: '320px',
        flex: '0 0 320px',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    roundTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        marginTop: 0,
        marginBottom: '1.5rem',
        color: 'var(--text-primary)',
        paddingBottom: '0.75rem',
        borderBottom: '2px solid var(--border-color)'
    },
    groupContainer: {
        marginBottom: '1.5rem',
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: '10px',
        border: '1px solid var(--border-color)'
    },
    groupHeader: {
        marginBottom: '0.75rem'
    },
    groupNumber: {
        fontSize: '1rem',
        fontWeight: '600',
        color: 'var(--accent-color)'
    },
    groupResults: {
        marginBottom: '0.75rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--border-color)'
    },
    resultItem: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.9rem',
        marginBottom: '0.25rem'
    },
    resultLabel: {
        color: 'var(--text-secondary)',
        fontWeight: '500'
    },
    resultValue: {
        color: 'var(--text-primary)',
        fontWeight: '600'
    },
    membersList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    memberItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.9rem',
        color: 'var(--text-primary)'
    },
    memberDot: {
        color: 'var(--success-color)',
        fontSize: '0.6rem'
    },
    emptyState: {
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '2px dashed var(--border-color)'
    },
    spinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block'
    }
}