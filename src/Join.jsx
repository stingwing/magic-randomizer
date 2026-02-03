import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiBase } from './api'
import { validateName, validateRoomCode, validateCommander, validateHostId, RateLimiter } from './utils/validation'
import { styles } from './styles/Join.styles'

// Rate limiter to prevent API abuse
const joinRateLimiter = new RateLimiter(5, 60000) // 5 attempts per minute
const createRateLimiter = new RateLimiter(3, 60000) // 3 creates per minute

export default function JoinPage() {
    const [mode, setMode] = useState('player') // 'player' or 'host'
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [commander, setCommander] = useState('')
    const [hostId, setHostId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [validationErrors, setValidationErrors] = useState({})
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const codeParam = searchParams.get('code')
        if (codeParam) {
            const validated = validateRoomCode(codeParam)
            setCode(validated.sanitized)
            setMode('player')
        }
    }, [searchParams])

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

    const handleNameChange = (e) => {
        const validated = validateName(e.target.value)
        setName(validated.sanitized)

        if (validated.error) {
            setValidationErrors(prev => ({ ...prev, name: validated.error }))
        } else {
            setValidationErrors(prev => {
                const { name, ...rest } = prev
                return rest
            })
        }
    }

    const handleCommanderChange = (e) => {
        const validated = validateCommander(e.target.value)
        setCommander(validated.sanitized)

        if (validated.error) {
            setValidationErrors(prev => ({ ...prev, commander: validated.error }))
        } else {
            setValidationErrors(prev => {
                const { commander, ...rest } = prev
                return rest
            })
        }
    }

    const handleHostIdChange = (e) => {
        const validated = validateHostId(e.target.value)
        setHostId(validated.sanitized)

        if (validated.error) {
            setValidationErrors(prev => ({ ...prev, hostId: validated.error }))
        } else {
            setValidationErrors(prev => {
                const { hostId, ...rest } = prev
                return rest
            })
        }
    }

    const handleModeChange = (newMode) => {
        setMode(newMode)
        setError(null)
        setValidationErrors({})
    }

    const handleJoinPlayer = async () => {
        // Validate inputs
        const codeValidation = validateRoomCode(code)
        const nameValidation = validateName(name)
        const commanderValidation = validateCommander(commander)

        const errors = {}
        if (!codeValidation.valid) errors.code = codeValidation.error
        if (!nameValidation.valid) errors.name = nameValidation.error
        if (commander && !commanderValidation.valid) errors.commander = commanderValidation.error

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            setError('Please fix the validation errors')
            return
        }

        // Check rate limiting
        if (!joinRateLimiter.canAttempt('join')) {
            setError('Too many attempts. Please wait a moment and try again.')
            return
        }

        const trimmedCode = codeValidation.sanitized
        const trimmedName = nameValidation.sanitized
        const trimmedCommander = commanderValidation.sanitized

        if (!trimmedCode || !trimmedName) {
            setError('Please enter both a code and a name')
            return
        }

        const url = `${apiBase}/${encodeURIComponent(trimmedCode)}/join`

        setLoading(true)
        setError(null)
        setValidationErrors({})

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
                // Don't expose detailed server errors to users
                const safeMessage = res.status === 404
                    ? 'Room not found'
                    : res.status === 400
                        ? 'Invalid request'
                        : 'Failed to join room'
                setError(safeMessage)
                return
            }

            const data = await res.json().catch(() => null)

            const participantId =
                (data && (data.participantId || data.id || data.participant?.participantId)) ||
                trimmedName

            // Validate participant ID before navigation
            const sanitizedParticipantId = validateName(participantId).sanitized

            // Store commander in sessionStorage to pass to Room page
            if (trimmedCommander) {
                sessionStorage.setItem(`commander_${trimmedCode}_${sanitizedParticipantId}`, trimmedCommander)
            }

            navigate(
                `/room/${encodeURIComponent(trimmedCode)}/${encodeURIComponent(sanitizedParticipantId)}`
            )

            setCode('')
            setName('')
            setCommander('')
        } catch (err) {
            console.error('Join error', err)
            setError('Network error while attempting to join.')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateHost = async () => {
        // Validate host ID
        const hostIdValidation = validateHostId(hostId)

        const errors = {}
        if (!hostIdValidation.valid) errors.hostId = hostIdValidation.error

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            setError('Please fix the validation errors')
            return
        }

        const trimmedHostId = hostIdValidation.sanitized

        if (!trimmedHostId) {
            setError('Please enter a Host ID')
            return
        }

        // Check rate limiting
        if (!createRateLimiter.canAttempt('create')) {
            setError('Too many game creation attempts. Please wait a moment and try again.')
            return
        }

        setLoading(true)
        setError(null)
        setValidationErrors({})

        try {
            const res = await fetch(apiBase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ hostId: trimmedHostId })
            })

            if (!res.ok) {
                const safeMessage = res.status === 500
                    ? 'Server error. Please try again.'
                    : 'Failed to create game'
                setError(safeMessage)
                return
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
                // Validate room code before storing and navigating
                const validated = validateRoomCode(roomCode)
                sessionStorage.setItem('hostRoomCode', validated.sanitized)
                sessionStorage.setItem(`hostId_${validated.sanitized}`, trimmedHostId)
                navigate(`/host/${encodeURIComponent(validated.sanitized)}/${encodeURIComponent(trimmedHostId)}`)
            } else {
                setError('Unable to create game. Please try again.')
            }

            setHostId('')
        } catch (err) {
            console.error('Create room error', err)
            setError('Network error while creating game.')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (mode === 'player') {
            await handleJoinPlayer()
        } else {
            await handleCreateHost()
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleSubmit()
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Commander Pod Creator</h1>
                <p style={styles.subtitle}>Organize your Magic: The Gathering Commander games</p>
            </div>

            {/* Mode Selection */}
            <div style={modeStyles.modeSelector}>
                <button
                    onClick={() => handleModeChange('player')}
                    style={{
                        ...modeStyles.modeButton,
                        ...(mode === 'player' ? modeStyles.modeButtonActive : {})
                    }}
                >
                    🎮 Join as Player
                </button>
                <button
                    onClick={() => handleModeChange('host')}
                    style={{
                        ...modeStyles.modeButton,
                        ...(mode === 'host' ? modeStyles.modeButtonActive : {})
                    }}
                >
                    👑 Create as Host
                </button>
            </div>

            <div style={styles.cardGrid}>
                <div style={styles.card}>
                    <div style={styles.cardIcon}>
                        {mode === 'player' ? '🎮' : '👑'}
                    </div>
                    <h2 style={styles.cardTitle}>
                        {mode === 'player' ? 'Join Existing Game' : 'Host a New Game'}
                    </h2>
                    <p style={styles.cardDescription}>
                        {mode === 'player'
                            ? 'Enter the game code provided by your host to join an active session.'
                            : 'Create a new game room and share the code with players to join your session.'
                        }
                    </p>
                    <div style={styles.inputGroup}>
                        {mode === 'player' ? (
                            <>
                                <label style={styles.label}>
                                    Game Code
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={handleCodeChange}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter join code"
                                        style={{
                                            ...styles.input,
                                            ...(validationErrors.code ? styles.inputError : {})
                                        }}
                                        disabled={loading}
                                        maxLength={20}
                                        aria-invalid={!!validationErrors.code}
                                        aria-describedby={validationErrors.code ? "code-error" : undefined}
                                        autoFocus
                                    />
                                    {validationErrors.code && (
                                        <span id="code-error" style={styles.validationError}>
                                            {validationErrors.code}
                                        </span>
                                    )}
                                </label>
                                <label style={styles.label}>
                                    Your Name
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={handleNameChange}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter your name"
                                        style={{
                                            ...styles.input,
                                            ...(validationErrors.name ? styles.inputError : {})
                                        }}
                                        disabled={loading}
                                        maxLength={50}
                                        aria-invalid={!!validationErrors.name}
                                        aria-describedby={validationErrors.name ? "name-error" : undefined}
                                    />
                                    {validationErrors.name && (
                                        <span id="name-error" style={styles.validationError}>
                                            {validationErrors.name}
                                        </span>
                                    )}
                                </label>
                                <label style={styles.label}>
                                    Commander (Optional)
                                    <input
                                        type="text"
                                        value={commander}
                                        onChange={handleCommanderChange}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter your commander name"
                                        style={{
                                            ...styles.input,
                                            ...(validationErrors.commander ? styles.inputError : {})
                                        }}
                                        disabled={loading}
                                        maxLength={100}
                                        aria-invalid={!!validationErrors.commander}
                                        aria-describedby={validationErrors.commander ? "commander-error" : undefined}
                                    />
                                    {validationErrors.commander && (
                                        <span id="commander-error" style={styles.validationError}>
                                            {validationErrors.commander}
                                        </span>
                                    )}
                                </label>
                            </>
                        ) : (
                            <label style={styles.label}>
                                Host ID
                                <input
                                    type="text"
                                    value={hostId}
                                    onChange={handleHostIdChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter your host identifier"
                                    style={{
                                        ...styles.input,
                                        ...(validationErrors.hostId ? styles.inputError : {})
                                    }}
                                    disabled={loading}
                                    maxLength={50}
                                    aria-invalid={!!validationErrors.hostId}
                                    aria-describedby={validationErrors.hostId ? "hostId-error" : undefined}
                                    autoFocus
                                />
                                {validationErrors.hostId && (
                                    <span id="hostId-error" style={styles.validationError}>
                                        {validationErrors.hostId}
                                    </span>
                                )}
                            </label>
                        )}
                        <button
                            onClick={handleSubmit}
                            disabled={loading || Object.keys(validationErrors).length > 0}
                            style={{
                                ...(mode === 'player' ? styles.secondaryButton : styles.primaryButton),
                                ...((loading || Object.keys(validationErrors).length > 0) ? styles.buttonDisabled : {})
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.spinner}></span>
                                    {mode === 'player' ? 'Joining…' : 'Creating…'}
                                </>
                            ) : (
                                <>{mode === 'player' ? 'Join Game' : 'Create New Game'}</>
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

const modeStyles = {
    modeSelector: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap'
    },
    modeButton: {
        padding: '1rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '12px',
        border: '2px solid var(--border-color)',
        background: 'var(--card-bg)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 2px 8px var(--shadow-color)'
    },
    modeButtonActive: {
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        color: 'white',
        borderColor: '#646cff',
        boxShadow: '0 4px 12px rgba(100, 108, 255, 0.4)',
        transform: 'translateY(-2px)'
    }
}