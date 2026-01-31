import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

export default function ViewPage() {
    const { code: paramCode } = useParams()
    const navigate = useNavigate()
    const [code, setCode] = useState(paramCode || '')
    const [participants, setParticipants] = useState([])
    const [currentRound, setCurrentRound] = useState(null)
    const [archivedRounds, setArchivedRounds] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [gameStarted, setGameStarted] = useState(false)
    const [isViewing, setIsViewing] = useState(false)
    const pollRef = useRef(null)

    const fetchParticipants = async (roomCode) => {
        if (!roomCode) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(roomCode)}`)
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

    const fetchArchivedRounds = async (roomCode) => {
        if (!roomCode) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(roomCode)}/archived`)
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

    const fetchAllData = async (roomCode) => {
        setLoading(true)
        setError(null)
        try {
            await Promise.all([
                fetchParticipants(roomCode),
                fetchCurrentRound(roomCode),
                fetchArchivedRounds(roomCode)
            ])
            setIsViewing(true)
            // Navigate to the parameterized route
            if (!paramCode) {
                navigate(`/view/${roomCode}`, { replace: true })
            }
        } catch (err) {
            setError(err.message || 'Failed to load room data')
            setIsViewing(false)
        } finally {
            setLoading(false)
        }
    }

    const handleView = () => {
        if (!code.trim()) {
            setError('Please enter a room code')
            return
        }
        fetchAllData(code.trim())
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleView()
        }
    }

    const handleNewSearch = () => {
        setIsViewing(false)
        setCode('')
        setParticipants([])
        setCurrentRound(null)
        setArchivedRounds([])
        setGameStarted(false)
        setError(null)
        navigate('/view', { replace: true })
        if (pollRef.current) {
            clearInterval(pollRef.current)
            pollRef.current = null
        }
    }

    useEffect(() => {
        if (paramCode && !isViewing) {
            setCode(paramCode)
            fetchAllData(paramCode)
        }
    }, [paramCode])

    useEffect(() => {
        if (isViewing && code) {
            // Start polling for updates every minute
            pollRef.current = setInterval(() => {
                fetchAllData(code)
            }, 60000)

            return () => {
                if (pollRef.current) {
                    clearInterval(pollRef.current)
                    pollRef.current = null
                }
            }
        }
    }, [isViewing, code])

    if (!isViewing) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>👁️ View Game</h1>
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
                                onChange={(e) => setCode(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter room code"
                                style={styles.input}
                                disabled={loading}
                                autoFocus
                            />
                        </label>
                        <button
                            onClick={handleView}
                            disabled={loading || !code.trim()}
                            style={{
                                ...styles.viewButton,
                                ...(loading || !code.trim() ? styles.buttonDisabled : {})
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.spinner}></span>
                                    Loading...
                                </>
                            ) : (
                                <>👁️ View Game</>
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
                        <li>Auto-refreshes every minute</li>
                    </ul>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>👁️ Viewing Game</h1>
            </div>

            {/* Room Code Banner */}
            <div style={styles.codeBanner}>
                <div style={styles.codeContent}>
                    <div>
                        <div style={styles.codeLabel}>Room Code</div>
                        <div style={styles.code}>{code}</div>
                        <div style={styles.codeHint}>Read-only view</div>
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
                    <button
                        onClick={() => fetchAllData(code)}
                        disabled={loading}
                        style={styles.refreshButton}
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
    subtitle: {
        fontSize: '1.1rem',
        color: 'var(--text-secondary)',
        marginTop: '0.5rem'
    },
    searchCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    searchContent: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'flex-end'
    },
    label: {
        flex: '1 1 300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: 'var(--text-primary)'
    },
    input: {
        padding: '1rem',
        fontSize: '1rem',
        borderRadius: '10px',
        border: '1px solid var(--input-border)',
        background: 'var(--input-bg)',
        color: 'var(--text-primary)'
    },
    viewButton: {
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
        gap: '0.5rem',
        boxShadow: '0 4px 12px rgba(100, 108, 255, 0.3)',
        transition: 'all 0.3s ease'
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
    },
    infoCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    infoTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        marginTop: 0,
        marginBottom: '1rem',
        color: 'var(--text-primary)'
    },
    infoText: {
        fontSize: '1rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        marginBottom: '1rem'
    },
    infoList: {
        margin: 0,
        paddingLeft: '1.5rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.8'
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
    changeButton: {
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
    errorMessage: {
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        background: 'var(--error-bg)',
        border: '1px solid var(--error-border)',
        color: 'var(--error-text)',
        marginTop: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        animation: 'slideIn 0.3s ease'
    },
    participantsSection: {
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
        marginTop: 0,
        marginBottom: '1.5rem',
        color: 'var(--text-primary)'
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
        borderRadius: '10px'
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
    roundsSection: {
        marginBottom: '2rem'
    },
    roundsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
    },
    refreshButton: {
        padding: '0.75rem 1.5rem',
        fontSize: '0.9rem',
        fontWeight: '600',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #ffd43b 0%, #fab005 100%)',
        color: '#333',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 4px 12px rgba(255, 212, 59, 0.3)',
        transition: 'all 0.3s ease'
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
    loadingState: {
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
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