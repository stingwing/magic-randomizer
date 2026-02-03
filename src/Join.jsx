import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiBase } from './api'
import { validateName, validateRoomCode, RateLimiter } from './utils/validation'
import { styles } from './styles/Join.styles'

// Rate limiter to prevent API abuse
const joinRateLimiter = new RateLimiter(5, 60000) // 5 attempts per minute
const createRateLimiter = new RateLimiter(3, 60000) // 3 creates per minute

export default function JoinPage() {
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState(null)
    const [validationErrors, setValidationErrors] = useState({})
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const codeParam = searchParams.get('code')
        if (codeParam) {
            const validated = validateRoomCode(codeParam)
            setCode(validated.sanitized)
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

    const handleJoin = async () => {
        // Validate inputs
        const codeValidation = validateRoomCode(code)
        const nameValidation = validateName(name)
        
        const errors = {}
        if (!codeValidation.valid) errors.code = codeValidation.error
        if (!nameValidation.valid) errors.name = nameValidation.error
        
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

            navigate(
                `/room/${encodeURIComponent(trimmedCode)}/${encodeURIComponent(sanitizedParticipantId)}`
            )

            setCode('')
            setName('')
        } catch (err) {
            console.error('Join error', err)
            setError('Network error while attempting to join.')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateNewGame = async () => {
        // Check rate limiting
        if (!createRateLimiter.canAttempt('create')) {
            setError('Too many game creation attempts. Please wait a moment and try again.')
            return
        }
        
        setCreating(true)
        setError(null)
        try {
            const res = await fetch(apiBase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ hostId: 'host1' }) // redesign how host names work // think about adding a password
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
                navigate(`/host/${encodeURIComponent(validated.sanitized)}`)
            } else {
                setError('Unable to create game. Please try again.')
            }
        } catch (err) {
            console.error('Create room error', err)
            setError('Network error while creating game.')
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
               

                {/* Join Existing Game Card */}
                <div style={styles.card}>
                    <div style={styles.cardIcon}></div>
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
                        <button
                            onClick={handleJoin}
                            disabled={loading || Object.keys(validationErrors).length > 0}
                            style={{
                                ...styles.secondaryButton,
                                ...((loading || Object.keys(validationErrors).length > 0) ? styles.buttonDisabled : {})
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.spinner}></span>
                                    Joining…
                                </>
                            ) : (
                                <>Join Game</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Host New Game Card */}
                <div style={styles.card}>
                    <div style={styles.cardIcon}></div>
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
                            <>Create New Game</>
                        )}
                    </button>
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