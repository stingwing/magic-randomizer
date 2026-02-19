import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiBase } from './api'
import { validateName, validateRoomCode, validateCommander, RateLimiter } from './utils/validation'
import { useCommanderSearch } from './utils/commanderSearch'
import { styles } from './styles/Join.styles'

// Rate limiter to prevent API abuse
const joinRateLimiter = new RateLimiter(5, 60000) // 5 attempts per minute

export default function QuickJoinPage() {
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [commander, setCommander] = useState('')
    const [partner, setPartner] = useState('')
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
        } else {
            // If no code in URL, redirect to regular join page
            navigate('/join')
        }
    }, [searchParams, navigate])

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                commanderSearch.dropdownRef.current &&
                !commanderSearch.dropdownRef.current.contains(event.target) &&
                commanderSearch.inputRef.current &&
                !commanderSearch.inputRef.current.contains(event.target)
            ) {
                commanderSearch.setShowDropdown(false)
            }

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

        commanderSearch.debouncedSearch(validated.sanitized)
    }

    const handleCommanderSelect = (commanderName) => {
        const validated = validateCommander(commanderName)
        setCommander(validated.sanitized)
        commanderSearch.setShowDropdown(false)
        commanderSearch.clearSearch()

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

        partnerSearch.debouncedSearch(validated.sanitized)
    }

    const handlePartnerSelect = (partnerName) => {
        const validated = validateCommander(partnerName)
        setPartner(validated.sanitized)
        partnerSearch.setShowDropdown(false)
        partnerSearch.clearSearch()

        setValidationErrors(prev => {
            const { partner, ...rest } = prev
            return rest
        })
    }

    const handleJoin = async () => {
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

        if (!joinRateLimiter.canAttempt('join')) {
            setError('Too many attempts. Please wait a moment and try again.')
            return
        }

        const trimmedCode = codeValidation.sanitized
        const trimmedName = nameValidation.sanitized
        const trimmedCommander = commanderValidation.sanitized
        const trimmedPartner = partnerValidation.sanitized

        if (!trimmedCode || !trimmedName) {
            setError('Please enter your name')
            return
        }

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
                setError(text)
                return
            }

            const data = await res.json().catch(() => null)

            const participantId =
                (data && (data.participantId || data.id || data.participant?.participantId)) ||
                trimmedName

            const sanitizedParticipantId = validateName(participantId).sanitized

            if (commanderValue) {
                sessionStorage.setItem(`commander_${trimmedCode}_${sanitizedParticipantId}`, commanderValue)
            }

            navigate(
                `/room/${encodeURIComponent(trimmedCode)}/${encodeURIComponent(sanitizedParticipantId)}`
            )

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

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleJoin()
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Commander Pod Creator</h1>
                <p style={styles.subtitle}>Join Game: {code}</p>
            </div>

            <div style={styles.cardGrid}>
                <div style={styles.card}>
                    <div style={styles.inputGroup}>                     
                        <label style={styles.label}>
                            Name
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
                                autoFocus
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
                                            color: '#777',
                                            backgroundColor: 'White',
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
                                                    e.currentTarget.style.backgroundColor = '#F0F8FF'
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
                                            color: '#777',
                                            backgroundColor: 'white',
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
                                                    e.currentTarget.style.backgroundColor = '#F0F8FF'
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
            </div>

            {error && (
                <div style={styles.errorBanner}>
                    <span style={styles.errorIcon}>⚠️</span>
                    {error}
                </div>
            )}
        </div>
    )
}