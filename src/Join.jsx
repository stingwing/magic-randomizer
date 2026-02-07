import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiBase } from './api'
import { validateName, validateRoomCode, validateCommander, validateHostId, RateLimiter } from './utils/validation'
import { useCommanderSearch } from './utils/commanderSearch'
import { styles, modeStyles } from './styles/Join.styles'

// Rate limiter to prevent API abuse
const joinRateLimiter = new RateLimiter(5, 60000) // 5 attempts per minute
const createRateLimiter = new RateLimiter(3, 60000) // 3 creates per minute

export default function JoinPage() {
    const [mode, setMode] = useState('player') // 'player' or 'host'
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [commander, setCommander] = useState('')
    const [partner, setPartner] = useState('')
    const [hostId, setHostId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [validationErrors, setValidationErrors] = useState({})
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // Use commander search hooks
    const commanderSearch = useCommanderSearch(300)
    const partnerSearch = useCommanderSearch(300)

    useEffect(() => {
        const codeParam = searchParams.get('code')
        if (codeParam) {
            const validated = validateRoomCode(codeParam)
            setCode(validated.sanitized)
            setMode('player')
        }
    }, [searchParams])

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Only close commander dropdown if clicking outside both commander input and dropdown
            if (
                commanderSearch.dropdownRef.current &&
                !commanderSearch.dropdownRef.current.contains(event.target) &&
                commanderSearch.inputRef.current &&
                !commanderSearch.inputRef.current.contains(event.target)
            ) {
                commanderSearch.setShowDropdown(false)
            }

            // Only close partner dropdown if clicking outside both partner input and dropdown
            if (
                partnerSearch.dropdownRef.current &&
                !partnerSearch.dropdownRef.current.contains(event.target) &&
                partnerSearch.inputRef.current &&
                !partnerSearch.inputRef.current.contains(event.target)
            ) {
                partnerSearch.setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [commanderSearch, partnerSearch])

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
        const value = e.target.value
        const validated = validateCommander(value)
        setCommander(validated.sanitized)

        if (validated.error) {
            setValidationErrors(prev => ({ ...prev, commander: validated.error }))
        } else {
            setValidationErrors(prev => {
                const { commander, ...rest } = prev
                return rest
            })
        }

        // Use the debounced search from the hook
        commanderSearch.debouncedSearch(validated.sanitized)
    }

    const handleCommanderSelect = (commanderName) => {
        const validated = validateCommander(commanderName)
        setCommander(validated.sanitized)
        commanderSearch.setShowDropdown(false)
        commanderSearch.clearSearch()

        // Clear any validation errors
        setValidationErrors(prev => {
            const { commander, ...rest } = prev
            return rest
        })
    }

    const handlePartnerChange = (e) => {
        const value = e.target.value
        const validated = validateCommander(value)
        setPartner(validated.sanitized)

        if (validated.error) {
            setValidationErrors(prev => ({ ...prev, partner: validated.error }))
        } else {
            setValidationErrors(prev => {
                const { partner, ...rest } = prev
                return rest
            })
        }

        // Use the debounced search from the hook
        partnerSearch.debouncedSearch(validated.sanitized)
    }

    const handlePartnerSelect = (partnerName) => {
        const validated = validateCommander(partnerName)
        setPartner(validated.sanitized)
        partnerSearch.setShowDropdown(false)
        partnerSearch.clearSearch()

        // Clear any validation errors
        setValidationErrors(prev => {
            const { partner, ...rest } = prev
            return rest
        })
    }

    const handleModeChange = (newMode) => {
        setMode(newMode)
        setError(null)
        setValidationErrors({})
        // Clear partner field when changing modes
        setPartner('')
        partnerSearch.clearSearch()
    }

    const handleJoinPlayer = async () => {
        // Validate inputs
        const codeValidation = validateRoomCode(code)
        const nameValidation = validateName(name)
        const commanderValidation = validateCommander(commander)
        const partnerValidation = validateCommander(partner)

        const errors = {}
        if (!codeValidation.valid) errors.code = codeValidation.error
        if (!nameValidation.valid) errors.name = nameValidation.error
        if (commander && !commanderValidation.valid) errors.commander = commanderValidation.error
        if (partner && !partnerValidation.valid) errors.partner = partnerValidation.error

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
        const trimmedPartner = partnerValidation.sanitized

        if (!trimmedCode || !trimmedName) {
            setError('Please enter both a code and a name')
            return
        }

        // Combine commander and partner if both are present
        let commanderValue = trimmedCommander
        if (trimmedCommander && trimmedPartner) {
            commanderValue = `${trimmedCommander} : ${trimmedPartner}`
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
                    participantName: trimmedName,
                    commander: commanderValue
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
            if (commanderValue) {
                sessionStorage.setItem(`commander_${trimmedCode}_${sanitizedParticipantId}`, commanderValue)
            }

            navigate(
                `/room/${encodeURIComponent(trimmedCode)}/${encodeURIComponent(sanitizedParticipantId)}`
            )

            setCode('')
            setName('')
            setCommander('')
            setPartner('')
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
                            : 'Create a new game room and share the code with players to join your session.'}
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
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            ref={commanderSearch.inputRef}
                                            type="text"
                                            value={commander}
                                            onChange={handleCommanderChange}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Start typing to search commanders..."
                                            style={{
                                                ...styles.input,
                                                ...(validationErrors.commander ? styles.inputError : {})
                                            }}
                                            disabled={loading}
                                            maxLength={100}
                                            aria-invalid={!!validationErrors.commander}
                                            aria-describedby={validationErrors.commander ? "commander-error" : undefined}
                                            autoComplete="off"
                                        />
                                        {commanderSearch.loading && (
                                            <div style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                fontSize: '14px'
                                            }}>
                                                🔍
                                            </div>
                                        )}
                                        {commanderSearch.showDropdown && commanderSearch.results.length > 0 && (
                                            <div
                                                ref={commanderSearch.dropdownRef}
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    backgroundColor: '#1e293b',
                                                    border: '1px solid #334155',
                                                    borderRadius: '8px',
                                                    marginTop: '4px',
                                                    maxHeight: '200px',
                                                    overflowY: 'auto',
                                                    zIndex: 1000,
                                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                                                }}
                                            >
                                                {commanderSearch.results.map((result, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => handleCommanderSelect(result)}
                                                        style={{
                                                            padding: '10px 12px',
                                                            cursor: 'pointer',
                                                            borderBottom: index < commanderSearch.results.length - 1 ? '1px solid #334155' : 'none',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#334155'
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent'
                                                        }}
                                                    >
                                                        {result}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {validationErrors.commander && (
                                        <span id="commander-error" style={styles.validationError}>
                                            {validationErrors.commander}
                                        </span>
                                    )}
                                </label>
                                <label style={styles.label}>
                                    Partner (Optional)
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            ref={partnerSearch.inputRef}
                                            type="text"
                                            value={partner}
                                            onChange={handlePartnerChange}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Start typing to search partners..."
                                            style={{
                                                ...styles.input,
                                                ...(validationErrors.partner ? styles.inputError : {})
                                            }}
                                            disabled={loading}
                                            maxLength={100}
                                            aria-invalid={!!validationErrors.partner}
                                            aria-describedby={validationErrors.partner ? "partner-error" : undefined}
                                            autoComplete="off"
                                        />
                                        {partnerSearch.loading && (
                                            <div style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                fontSize: '14px'
                                            }}>
                                                🔍
                                            </div>
                                        )}
                                        {partnerSearch.showDropdown && partnerSearch.results.length > 0 && (
                                            <div
                                                ref={partnerSearch.dropdownRef}
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: 0,
                                                    right: 0,
                                                    backgroundColor: '#1e293b',
                                                    border: '1px solid #334155',
                                                    borderRadius: '8px',
                                                    marginTop: '4px',
                                                    maxHeight: '200px',
                                                    overflowY: 'auto',
                                                    zIndex: 1000,
                                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                                                }}
                                            >
                                                {partnerSearch.results.map((result, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => handlePartnerSelect(result)}
                                                        style={{
                                                            padding: '10px 12px',
                                                            cursor: 'pointer',
                                                            borderBottom: index < partnerSearch.results.length - 1 ? '1px solid #334155' : 'none',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#334155'
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent'
                                                        }}
                                                    >
                                                        {result}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {validationErrors.partner && (
                                        <span id="partner-error" style={styles.validationError}>
                                            {validationErrors.partner}
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