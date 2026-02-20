import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiBase } from './api'
import { validateUrlParam, RateLimiter } from './utils/validation'
import { styles } from './styles/HostSettings.styles'

// Rate limiter for settings updates
const settingsRateLimiter = new RateLimiter(5, 60000) // 5 updates per minute

export default function HostSettingsPage() {
    const { code, hostId } = useParams()
    const navigate = useNavigate()

    // Validated URL parameters
    const [validatedCode, setValidatedCode] = useState('')
    const [validatedHostId, setValidatedHostId] = useState('')

    // Settings state
    const [eventName, setEventName] = useState('')
    const [maxGroupSize, setMaxGroupSize] = useState(4)
    const [allowJoinAfterStart, setAllowJoinAfterStart] = useState(false)
    const [prioritizeWinners, setPrioritizeWinners] = useState(true)
    const [allowGroupOfThree, setAllowGroupOfThree] = useState(true)
    const [allowGroupOfFive, setAllowGroupOfFive] = useState(true)
    const [furtherReduceOddsOfGroupOfThree, setFurtherReduceOddsOfGroupOfThree] = useState(false)
    const [roundLength, setRoundLength] = useState(90)
    const [usePoints, setUsePoints] = useState(false)
    const [pointsForWin, setPointsForWin] = useState(3)
    const [pointsForDraw, setPointsForDraw] = useState(1)
    const [pointsForLoss, setPointsForLoss] = useState(0)
    const [pointsForABye, setPointsForABye] = useState(0)
    const [allowCustomGroups, setAllowCustomGroups] = useState(false)
    const [tournamentMode, setTournamentMode] = useState(false)
    const [maxRounds, setMaxRounds] = useState(0)
    const [allowPlayersToCreateCustomGroups, setAllowPlayersToCreateCustomGroups] = useState(false)

    // UI state
    const [loading, setLoading] = useState(false)
    const [fetchingSettings, setFetchingSettings] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

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

    // Fetch current settings from room endpoint
    useEffect(() => {
        if (!validatedCode) return

        const fetchSettings = async () => {
            setFetchingSettings(true)
            try {
                maxGroupSize
                const res = await fetch(`${apiBase}/${encodeURIComponent(validatedCode)}`)
                if (res.ok) {
                    const data = await res.json()
                    
                    // Update state with fetched settings
                    if (data.eventName !== undefined) setEventName(data.eventName || '')
                    
                    // Settings are nested under data.settings
                    if (data.settings.maxGroupSize !== undefined) setMaxGroupSize(data.settings.maxGroupSize)
                    if (data.settings.allowJoinAfterStart !== undefined) setAllowJoinAfterStart(data.settings.allowJoinAfterStart)
                    
                    // Handle both "prioitizeWinners" (typo) and "prioritizeWinners"
                    if (data.settings.prioritizeWinners !== undefined) {
                        setPrioritizeWinners(data.settings.prioritizeWinners)
                    } else if (data.settings.prioitizeWinners !== undefined) {
                        setPrioritizeWinners(data.settings.prioitizeWinners)
                    }
                    
                    if (data.settings.allowGroupOfThree !== undefined) setAllowGroupOfThree(data.settings.allowGroupOfThree)
                    if (data.settings.allowGroupOfFive !== undefined) setAllowGroupOfFive(data.settings.allowGroupOfFive)
                    if (data.settings.furtherReduceOddsOfGroupOfThree !== undefined) setFurtherReduceOddsOfGroupOfThree(data.settings.furtherReduceOddsOfGroupOfThree)
                    if (data.settings.roundLength !== undefined) setRoundLength(data.settings.roundLength)
                    if (data.settings.usePoints !== undefined) setUsePoints(data.settings.usePoints)
                    if (data.settings.pointsForWin !== undefined) setPointsForWin(data.settings.pointsForWin)
                    if (data.settings.pointsForDraw !== undefined) setPointsForDraw(data.settings.pointsForDraw)
                    if (data.settings.pointsForLoss !== undefined) setPointsForLoss(data.settings.pointsForLoss)
                    if (data.settings.pointsForABye !== undefined) setPointsForABye(data.settings.pointsForABye)
                    if (data.settings.allowCustomGroups !== undefined) setAllowCustomGroups(data.settings.allowCustomGroups)
                    if (data.settings.tournamentMode !== undefined) setTournamentMode(data.settings.tournamentMode)
                    if (data.settings.maxRounds !== undefined) setMaxRounds(data.settings.maxRounds)
                    if (data.settings.allowPlayersToCreateCustomGroups !== undefined) setAllowPlayersToCreateCustomGroups(data.settings.allowPlayersToCreateCustomGroups)
                } else {
                    const errorMessage = res.status === 404 ? 'Room not found' : 'Unable to load settings'
                    setError(errorMessage)
                }
            } catch (err) {
                console.error('Error fetching settings:', err)
                setError('Network error while loading settings')
            } finally {
                setFetchingSettings(false)
            }
        }

        fetchSettings()
    }, [validatedCode])

    const handleSaveSettings = async () => {
        if (!validatedCode || !validatedHostId) return

        // Check rate limiting
        if (!settingsRateLimiter.canAttempt('settings')) {
            setError('Too many settings updates. Please wait a moment.')
            return
        }

        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const payload = {
                hostId: validatedHostId,
                eventName: eventName,
                maxGroupSize: parseInt(maxGroupSize),
                allowJoinAfterStart: allowJoinAfterStart,
                prioitizeWinners: prioritizeWinners, // Using the typo from the API
                allowGroupOfThree: allowGroupOfThree,
                allowGroupOfFive: allowGroupOfFive,
                furtherReduceOddsOfGroupOfThree: furtherReduceOddsOfGroupOfThree,
                roundLength: parseInt(roundLength),
                usePoints: usePoints,
                pointsForWin: parseInt(pointsForWin),
                pointsForDraw: parseInt(pointsForDraw),
                pointsForLoss: parseInt(pointsForLoss),
                pointsForABye: parseInt(pointsForABye),
                allowCustomGroups: allowCustomGroups,
                tournamentMode: tournamentMode,
                maxRounds: parseInt(maxRounds),
                allowPlayersToCreateCustomGroups: allowPlayersToCreateCustomGroups
            }

            const res = await fetch(`${apiBase}/${encodeURIComponent(validatedCode)}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const errorText = await res.text().catch(() => 'Failed to update settings')
                throw new Error(errorText)
            }

            setSuccess('Settings saved successfully!')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            console.error('Save settings error:', err)
            setError(err.message || 'Unable to save settings')
        } finally {
            setLoading(false)
        }
    }

    const handleBackToHost = () => {
        navigate(`/host/${encodeURIComponent(validatedCode)}/${encodeURIComponent(validatedHostId)}`)
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Host Settings</h1>
                <div style={styles.headerInfo}>
                    <span style={styles.roomLabel}>Room Code:</span>
                    <span style={styles.roomCode}>{validatedCode}</span>
                </div>
            </div>

            {/* Back Button */}
            <div style={styles.backButtonContainer}>
                <button onClick={handleBackToHost} style={styles.backButton}>
                    ← Back to Host Dashboard
                </button>
            </div>

            {/* Messages */}
            {error && (
                <div style={styles.errorMessage}>
                    <span>⚠️</span> {error}
                </div>
            )}
            {success && (
                <div style={styles.successMessage}>
                    <span>✅</span> {success}
                </div>
            )}

            {/* Loading State */}
            {fetchingSettings && (
                <div style={styles.loadingCard}>
                    <span style={styles.spinner}></span>
                    <span>Loading settings...</span>
                </div>
            )}

            {/* Settings Form */}
            {!fetchingSettings && (
                <div style={styles.settingsCard}>
                    <h2 style={styles.sectionTitle}>Game Settings</h2>

                    {/* Event Name */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Event Name
                            <input
                                type="text"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                placeholder="Enter event name (optional)"
                                style={styles.input}
                                disabled={loading}
                                maxLength={100}
                            />
                        </label>
                    </div>

                    {/* Max Group Size */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Max Group Size
                            <input
                                type="number"
                                value={maxGroupSize}
                                onChange={(e) => setMaxGroupSize(e.target.value)}
                                style={styles.input}
                                disabled={loading}
                                min="2"
                                max="10"
                            />
                        </label>
                        <span style={styles.hint}>Recommended: 4 players per group</span>
                    </div>

                    {/* Round Length */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Round Length (minutes)
                            <input
                                type="number"
                                value={roundLength}
                                onChange={(e) => setRoundLength(e.target.value)}
                                style={styles.input}
                                disabled={loading}
                                min="0"
                                max="999"
                            />
                        </label>
                        <span style={styles.hint}>Recommended: 90 minutes</span>
                    </div>

                    {/* Max Rounds */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Max Rounds
                            <input
                                type="number"
                                value={maxRounds}
                                onChange={(e) => setMaxRounds(e.target.value)}
                                style={styles.input}
                                disabled={loading}
                                min="0"
                                max="10000"
                            />
                        </label>
                        <span style={styles.hint}>0 = Unlimited rounds</span>
                    </div>

                    {/* Checkboxes */}
                    <div style={styles.checkboxGrid}>
                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={allowJoinAfterStart}
                                onChange={(e) => setAllowJoinAfterStart(e.target.checked)}
                                style={styles.checkbox}
                                disabled={loading}
                            />
                            <span>Allow Join After Start</span>
                        </label>

                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={prioritizeWinners}
                                onChange={(e) => setPrioritizeWinners(e.target.checked)}
                                style={styles.checkbox}
                                disabled={loading}
                            />
                            <span>Prioritize Winners</span>
                        </label>

                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={allowGroupOfThree}
                                onChange={(e) => setAllowGroupOfThree(e.target.checked)}
                                style={styles.checkbox}
                                disabled={loading}
                            />
                            <span>Allow Groups of 3</span>
                        </label>

                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={allowGroupOfFive}
                                onChange={(e) => setAllowGroupOfFive(e.target.checked)}
                                style={styles.checkbox}
                                disabled={loading}
                            />
                            <span>Allow Groups of 5</span>
                        </label>

                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={furtherReduceOddsOfGroupOfThree}
                                onChange={(e) => setFurtherReduceOddsOfGroupOfThree(e.target.checked)}
                                style={styles.checkbox}
                                disabled={loading || !allowGroupOfThree}
                            />
                            <span>Further Reduce Odds of Groups of 3</span>
                        </label>

                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={allowCustomGroups}
                                onChange={(e) => setAllowCustomGroups(e.target.checked)}
                                style={styles.checkbox}
                                disabled={loading}
                            />
                            <span>Allow Host Custom Groups</span>
                        </label>

                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={allowPlayersToCreateCustomGroups}
                                onChange={(e) => setAllowPlayersToCreateCustomGroups(e.target.checked)}
                                style={styles.checkbox}
                                disabled={loading}
                            />
                            <span>Allow Players To Create Custom Groups</span>
                        </label>

                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={tournamentMode}
                                onChange={(e) => setTournamentMode(e.target.checked)}
                                style={styles.checkbox}
                                disabled={loading}
                            />
                            <span>Tournament Mode</span>
                        </label>

                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={usePoints}
                                onChange={(e) => setUsePoints(e.target.checked)}
                                style={styles.checkbox}
                                disabled={loading}
                            />
                            <span>Use Points System</span>
                        </label>
                    </div>

                    {/* Points Settings (only visible when usePoints is true) */}
                    {usePoints && (
                        <div style={styles.pointsSection}>
                            <h3 style={styles.subsectionTitle}>Points Configuration</h3>
                            <div style={styles.pointsGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Points for Win
                                        <input
                                            type="number"
                                            value={pointsForWin}
                                            onChange={(e) => setPointsForWin(e.target.value)}
                                            style={styles.input}
                                            disabled={loading}
                                            min="0"
                                            max="999"
                                        />
                                    </label>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Points for Draw
                                        <input
                                            type="number"
                                            value={pointsForDraw}
                                            onChange={(e) => setPointsForDraw(e.target.value)}
                                            style={styles.input}
                                            disabled={loading}
                                            min="0"
                                            max="999"
                                        />
                                    </label>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Points for Loss
                                        <input
                                            type="number"
                                            value={pointsForLoss}
                                            onChange={(e) => setPointsForLoss(e.target.value)}
                                            style={styles.input}
                                            disabled={loading}
                                            min="0"
                                            max="999"
                                        />
                                    </label>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Points for Bye
                                        <input
                                            type="number"
                                            value={pointsForABye}
                                            onChange={(e) => setPointsForABye(e.target.value)}
                                            style={styles.input}
                                            disabled={loading}
                                            min="0"
                                            max="999"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <div style={styles.actionButtons}>
                        <button
                            onClick={handleSaveSettings}
                            disabled={loading}
                            style={{
                                ...styles.saveButton,
                                ...(loading ? styles.buttonDisabled : {})
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.spinner}></span>
                                    Saving...
                                </>
                            ) : (
                                '💾 Save Settings'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}