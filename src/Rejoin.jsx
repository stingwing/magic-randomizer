import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiBase } from './api'
import { validateName, validateRoomCode, validateHostId, RateLimiter } from './utils/validation'
import { styles } from './styles/Join.styles'

// Rate limiter to prevent API abuse
const rejoinRateLimiter = new RateLimiter(5, 60000) // 5 attempts per minute

export default function RejoinPage() {
    const [mode, setMode] = useState('player') // 'player' or 'host'
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [hostId, setHostId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [validationErrors, setValidationErrors] = useState({})
    const navigate = useNavigate()

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

    const handleRejoinPlayer = async () => {
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

        const trimmedCode = codeValidation.sanitized
        const trimmedName = nameValidation.sanitized
        
        if (!trimmedCode || !trimmedName) {
            setError('Please enter both a code and a name')
            return
        }
        
        setLoading(true)
        setError(null)
        setValidationErrors({})
        
        try {
            // First, verify the room exists
            const roomUrl = `${apiBase}/${encodeURIComponent(trimmedCode)}`
            const roomRes = await fetch(roomUrl)
            
            if (!roomRes.ok) {
                const safeMessage = roomRes.status === 404 
                    ? 'Room not found' 
                    : 'Unable to verify room'
                setError(safeMessage)
                return
            }

            const roomData = await roomRes.json().catch(() => null)
            
            // Check if participant exists in the room
            if (roomData && Array.isArray(roomData.participants)) {
                const participantExists = roomData.participants.some(
                    p => (p.id === trimmedName || p.name === trimmedName)
                )
                
                if (!participantExists) {
                    setError('Participant not found in this room. Please check your name.')
                    return
                }
            }

            // Navigate to the room
            navigate(
                `/room/${encodeURIComponent(trimmedCode)}/${encodeURIComponent(trimmedName)}`
            )

            setCode('')
            setName('')
        } catch (err) {
            console.error('Rejoin error', err)
            setError('Network error while attempting to rejoin.')
        } finally {
            setLoading(false)
        }
    }

    const handleRejoinHost = async () => {
        // Validate inputs
        const codeValidation = validateRoomCode(code)
        const hostIdValidation = validateHostId(hostId)
        
        const errors = {}
        if (!codeValidation.valid) errors.code = codeValidation.error
        if (!hostIdValidation.valid) errors.hostId = hostIdValidation.error
        
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            setError('Please fix the validation errors')
            return
        }

        const trimmedCode = codeValidation.sanitized
        const trimmedHostId = hostIdValidation.sanitized
        
        if (!trimmedCode || !trimmedHostId) {
            setError('Please enter both a room code and Host ID')
            return
        }
        
        setLoading(true)
        setError(null)
        setValidationErrors({})
        
        try {
            // Verify the room exists
            const roomUrl = `${apiBase}/${encodeURIComponent(trimmedCode)}`
            const roomRes = await fetch(roomUrl)
            
            if (!roomRes.ok) {
                const safeMessage = roomRes.status === 404 
                    ? 'Room not found' 
                    : 'Unable to verify room'
                setError(safeMessage)
                return
            }

            // Navigate to the host dashboard
            sessionStorage.setItem('hostRoomCode', trimmedCode)
            sessionStorage.setItem(`hostId_${trimmedCode}`, trimmedHostId)
            navigate(`/host/${encodeURIComponent(trimmedCode)}/${encodeURIComponent(trimmedHostId)}`)

            setCode('')
            setHostId('')
        } catch (err) {
            console.error('Rejoin host error', err)
            setError('Network error while attempting to rejoin.')
        } finally {
            setLoading(false)
        }
    }

    const handleRejoin = async () => {
        // Check rate limiting
        if (!rejoinRateLimiter.canAttempt('rejoin')) {
            setError('Too many attempts. Please wait a moment and try again.')
            return
        }

        if (mode === 'player') {
            await handleRejoinPlayer()
        } else {
            await handleRejoinHost()
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleRejoin()
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Rejoin Game</h1>
                <p style={styles.subtitle}>Return to your active game session</p>
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
                    🎮 Rejoin as Player
                </button>
                <button
                    onClick={() => handleModeChange('host')}
                    style={{
                        ...modeStyles.modeButton,
                        ...(mode === 'host' ? modeStyles.modeButtonActive : {})
                    }}
                >
                    👑 Rejoin as Host
                </button>
            </div>

            <div style={styles.cardGrid}>
                <div style={styles.card}>
                    <div style={styles.cardIcon}>
                        {mode === 'player' ? '🔄' : '🎮'}
                    </div>
                    <h2 style={styles.cardTitle}>
                        {mode === 'player' ? 'Rejoin as Player' : 'Rejoin Host Dashboard'}
                    </h2>
                    <p style={styles.cardDescription}>
                        {mode === 'player' 
                            ? 'Enter the room code and your player name to return to your game.'
                            : 'Enter the room code and your Host ID to access your host dashboard.'
                        }
                    </p>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            Game Code
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
                        {mode === 'player' ? (
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
                                />
                                {validationErrors.hostId && (
                                    <span id="hostId-error" style={styles.validationError}>
                                        {validationErrors.hostId}
                                    </span>
                                )}
                            </label>
                        )}
                        <button
                            onClick={handleRejoin}
                            disabled={loading || Object.keys(validationErrors).length > 0}
                            style={{
                                ...(mode === 'player' ? styles.secondaryButton : styles.primaryButton),
                                ...((loading || Object.keys(validationErrors).length > 0) ? styles.buttonDisabled : {})
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.spinner}></span>
                                    Rejoining…
                                </>
                            ) : (
                                <>Rejoin Game</>
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