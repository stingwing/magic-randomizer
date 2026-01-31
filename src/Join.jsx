import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiBase } from './api'

export default function JoinPage() {
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleJoin = async () => {
        const trimmedCode = code.trim()
        const trimmedName = name.trim()
        if (!trimmedCode || !trimmedName) {
            setError('Please enter both a code and a name')
            return
        }
        const url = `${apiBase}/${encodeURIComponent(trimmedCode)}/join`

        setLoading(true)
        setError(null)
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participantId: trimmedName,
                    participantName: trimmedName
                })
            })

            if (!res.ok) {
                const text = await res.text().catch(() => '')
                const message = text || `Server returned ${res.status}`
                setError(`Join failed: ${message}`)
                return
            }

            const data = await res.json().catch(() => null)

            const participantId =
                (data && (data.participantId || data.id || data.participant?.participantId)) ||
                trimmedName

            navigate(
                `/room/${encodeURIComponent(trimmedCode)}/${encodeURIComponent(participantId)}`
            )

            setCode('')
            setName('')
        } catch (err) {
            console.error('Join error', err)
            setError('Network error while attempting to join. Check console for details.')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateNewGame = async () => {
        setCreating(true)
        setError(null)
        try {
            const res = await fetch(apiBase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ hostId: 'host1' })
            })

            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }

            const data = await res.json().catch(() => null)

            const roomCode =
                (data && (data.code || data.roomCode || data.id || data.roomId)) ||
                (() => {
                    const loc = res.headers.get('location') || res.headers.get('Location')
                    if (loc) {
                        const parts = loc.split('/').filter(Boolean)
                        return parts[parts.length - 1]
                    }
                    return null
                })()

            if (roomCode) {
                localStorage.setItem('hostRoomCode', roomCode)
                navigate(`/host/${roomCode}`)
            } else {
                setError('Unable to extract room code from server response')
            }
        } catch (err) {
            console.error('Create room error', err)
            setError(err.message || 'Unknown error while creating room')
        } finally {
            setCreating(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleJoin()
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Commander Pod Creator</h1>
                <p style={styles.subtitle}>Organize your Magic: The Gathering Commander games</p>
            </div>

            <div style={styles.cardGrid}>
                {/* Host New Game Card */}
                <div style={styles.card}>
                    <div style={styles.cardIcon}>🎮</div>
                    <h2 style={styles.cardTitle}>Host a New Game</h2>
                    <p style={styles.cardDescription}>
                        Create a new game room and share the code with players to join your session.
                    </p>
                    <button
                        onClick={handleCreateNewGame}
                        disabled={creating}
                        style={{
                            ...styles.primaryButton,
                            ...(creating ? styles.buttonDisabled : {})
                        }}
                    >
                        {creating ? (
                            <>
                                <span style={styles.spinner}></span>
                                Creating…
                            </>
                        ) : (
                            <>✨ Create New Game</>
                        )}
                    </button>
                </div>

                {/* Join Existing Game Card */}
                <div style={styles.card}>
                    <div style={styles.cardIcon}>🎯</div>
                    <h2 style={styles.cardTitle}>Join Existing Game</h2>
                    <p style={styles.cardDescription}>
                        Enter the game code provided by your host to join an active session.
                    </p>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            Game Code
                            <input
                                type="text"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter join code"
                                style={styles.input}
                                disabled={loading}
                            />
                        </label>
                        <label style={styles.label}>
                            Your Name
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter your name"
                                style={styles.input}
                                disabled={loading}
                            />
                        </label>
                        <button
                            onClick={handleJoin}
                            disabled={loading}
                            style={{
                                ...styles.secondaryButton,
                                ...(loading ? styles.buttonDisabled : {})
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.spinner}></span>
                                    Joining…
                                </>
                            ) : (
                                <>🚀 Join Game</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={styles.errorBanner}>
                    <span style={styles.errorIcon}>⚠️</span>
                    {error}
                </div>
            )}
        </div>
    )
}

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem 1rem',
        fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif'
    },
    header: {
        textAlign: 'center',
        marginBottom: '3rem'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#888',
        margin: 0
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
    },
    card: {
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '2rem',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
    },
    cardIcon: {
        fontSize: '3rem',
        marginBottom: '1rem'
    },
    cardTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginTop: 0,
        marginBottom: '0.75rem'
    },
    cardDescription: {
        fontSize: '0.95rem',
        color: '#888',
        lineHeight: '1.6',
        marginBottom: '1.5rem'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    label: {
        display: 'flex',
        flexDirection: 'column',
        fontSize: '0.9rem',
        fontWeight: '500',
        gap: '0.5rem',
        textAlign: 'left'
    },
    input: {
        width: '100%',
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.2)',
        color: 'inherit',
        transition: 'all 0.2s ease',
        outline: 'none',
        boxSizing: 'border-box'
    },
    primaryButton: {
        width: '100%',
        padding: '0.875rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '8px',
        border: 'none',
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        boxShadow: '0 4px 12px rgba(100, 108, 255, 0.3)'
    },
    secondaryButton: {
        width: '100%',
        padding: '0.875rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '8px',
        border: '1px solid #646cff',
        background: 'transparent',
        color: '#646cff',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
    },
    errorBanner: {
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        background: 'rgba(220, 38, 38, 0.1)',
        border: '1px solid rgba(220, 38, 38, 0.3)',
        color: '#fca5a5',
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        animation: 'slideIn 0.3s ease'
    },
    errorIcon: {
        fontSize: '1.25rem'
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