import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiBase } from './api'
import { validateRoomCode, RateLimiter } from './utils/validation'
import { styles } from './styles/Join.styles'

// Rate limiter to prevent API abuse
const rejoinHostRateLimiter = new RateLimiter(5, 60000) // 5 attempts per minute

export default function RejoinHostPage() {
    const [code, setCode] = useState('')
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

    const handleRejoinHost = async () => {
        // Validate input
        const codeValidation = validateRoomCode(code)
        
        if (!codeValidation.valid) {
            setValidationErrors({ code: codeValidation.error })
            setError('Please fix the validation errors')
            return
        }
        
        // Check rate limiting
        if (!rejoinHostRateLimiter.canAttempt('rejoinhost')) {
            setError('Too many attempts. Please wait a moment and try again.')
            return
        }

        const trimmedCode = codeValidation.sanitized
        
        if (!trimmedCode) {
            setError('Please enter a room code')
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
            navigate(`/host/${encodeURIComponent(trimmedCode)}`)

            setCode('')
        } catch (err) {
            console.error('Rejoin host error', err)
            setError('Network error while attempting to rejoin.')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleRejoinHost()
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Rejoin as Host</h1>
                <p style={styles.subtitle}>Enter your room code to return to the host dashboard</p>
            </div>

            <div style={styles.cardGrid}>
                <div style={styles.card}>
                    <div style={styles.cardIcon}>🎮</div>
                    <h2 style={styles.cardTitle}>Rejoin Host Dashboard</h2>
                    <p style={styles.cardDescription}>
                        Enter the room code to access your host dashboard and manage your game.
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
                        <button
                            onClick={handleRejoinHost}
                            disabled={loading || Object.keys(validationErrors).length > 0}
                            style={{
                                ...styles.primaryButton,
                                ...((loading || Object.keys(validationErrors).length > 0) ? styles.buttonDisabled : {})
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.spinner}></span>
                                    Rejoining…
                                </>
                            ) : (
                                <>Rejoin as Host</>
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