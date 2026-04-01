import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { styles } from './styles/Profile.styles'

const API_BASE = import.meta.env.VITE_API_BASE?.replace('/api/Rooms', '') || 'https://localhost:7086'

export default function ProfilePage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [games, setGames] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [hoveredCard, setHoveredCard] = useState(null)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    })
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordError, setPasswordError] = useState(null)
    const [passwordSuccess, setPasswordSuccess] = useState(null)

    useEffect(() => {
        if (!user) {
            navigate('/auth')
            return
        }

        fetchGames()
    }, [user, navigate])

    const fetchGames = async () => {
        if (!user?.userId) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE}/api/Auth/${user.userId}/all-games`)
            
            if (!response.ok) {
                throw new Error('Failed to fetch games')
            }

            const data = await response.json()
            setGames(data)
        } catch (err) {
            console.error('Error fetching games:', err)
            setError(err.message || 'Failed to load game history')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const handleGameClick = (game, isHost) => {
        if (isHost) {
            // Navigate to host page if unarchived, otherwise view page
            if (!game.archived) {
                navigate(`/host/${game.code}/${user.username}`)
            } else {
                navigate(`/view/${game.code}`)
            }
        } else {
            // Try to navigate to player view if we have stored participantId
            const storedParticipantId = sessionStorage.getItem(`participantId_${game.code}`)
            if (storedParticipantId) {
                navigate(`/room/${game.code}/${user.username}`)
            } else {
                // Otherwise go to view page
                navigate(`/view/${game.code}`)
            }
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getGameStatus = (game) => {
        if (game.archived) return 'archived'
        if (game.isGameEnded) return 'ended'
        if (game.isGameStarted) return 'active'
        return 'waiting'
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active':
                return styles.statusActive
            case 'ended':
                return styles.statusEnded
            case 'archived':
                return styles.statusArchived
            default:
                return {}
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'In Progress'
            case 'ended':
                return 'Ended'
            case 'archived':
                return 'Archived'
            default:
                return 'Waiting'
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()

        setPasswordError(null)
        setPasswordSuccess(null)

        // Validate form
        if (!passwordForm.currentPassword) {
            setPasswordError('Current password is required')
            return
        }

        if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters')
            return
        }

        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            setPasswordError('New passwords do not match')
            return
        }

        if (passwordForm.currentPassword === passwordForm.newPassword) {
            setPasswordError('New password must be different from current password')
            return
        }

        setPasswordLoading(true)

        try {
            const response = await fetch(`${API_BASE}/api/Auth/change-password?userId=${user.userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                    confirmNewPassword: passwordForm.confirmNewPassword
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Failed to change password')
            }

            setPasswordSuccess('Password changed successfully!')
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            })

            // Close modal after 2 seconds
            setTimeout(() => {
                setShowPasswordModal(false)
                setPasswordSuccess(null)
            }, 2000)
        } catch (err) {
            console.error('Password change error:', err)
            setPasswordError(err.message || 'Failed to change password')
        } finally {
            setPasswordLoading(false)
        }
    }

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target
        setPasswordForm(prev => ({ ...prev, [name]: value }))
        setPasswordError(null)
    }

    const handleCloseModal = () => {
        setShowPasswordModal(false)
        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        })
        setPasswordError(null)
        setPasswordSuccess(null)
    }

    if (!user) {
        return null
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>My Profile</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        style={{
                            ...styles.changePasswordButton,
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            backgroundColor: 'var(--primary-color)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1'
                        }}
                    >
                        🔒 Change Password
                    </button>
                    <button
                        onClick={handleLogout}
                        style={styles.logoutButton}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#cc0000'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ff4444'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div style={styles.userInfo}>
                <div style={styles.userInfoGrid}>
                    <div style={styles.userInfoItem}>
                        <span style={styles.label}>Username</span>
                        <span style={styles.value}>{user.username}</span>
                    </div>
                    <div style={styles.userInfoItem}>
                        <span style={styles.label}>Display Name</span>
                        <span style={styles.value}>{user.displayName}</span>
                    </div>
                    <div style={styles.userInfoItem}>
                        <span style={styles.label}>Email</span>
                        <span style={styles.value}>{user.email}</span>
                    </div>
                    <div style={styles.userInfoItem}>
                        <span style={styles.label}>Member Since</span>
                        <span style={styles.value}>{formatDate(user.createdAtUtc)}</span>
                    </div>
                    {user.lastLoginUtc && (
                        <div style={styles.userInfoItem}>
                            <span style={styles.label}>Last Login</span>
                            <span style={styles.value}>{formatDate(user.lastLoginUtc)}</span>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div style={styles.errorBanner}>
                    ⚠️ {error}
                </div>
            )}

            {loading ? (
                <div style={styles.loading}>
                    <span style={styles.spinner}></span>
                    Loading game history...
                </div>
            ) : games ? (
                <>
                    {games.hostedGames && games.hostedGames.length > 0 && (
                        <>
                            {games.hostedGames.filter(game => !game.archived).length > 0 && (
                                <>
                                    <h2 style={styles.sectionTitle}>
                                        Active Hosted Games ({games.hostedGames.filter(game => !game.archived).length})
                                    </h2>
                                    <div style={styles.gamesGrid}>
                                        {games.hostedGames.filter(game => !game.archived).map((game) => {
                                            const status = getGameStatus(game)
                                            return (
                                                <div
                                                    key={game.code}
                                                    style={{
                                                        ...styles.gameCard,
                                                        ...(hoveredCard === `host-${game.code}` ? styles.gameCardHover : {})
                                                    }}
                                                    onClick={() => handleGameClick(game, true)}
                                                    onMouseEnter={() => setHoveredCard(`host-${game.code}`)}
                                                    onMouseLeave={() => setHoveredCard(null)}
                                                >
                                                    <div style={styles.gameCode}>
                                                        🎮 {game.code}
                                                    </div>
                                                    <div style={styles.gameEventName}>
                                                        {game.eventName || 'Unnamed Event'}
                                                    </div>
                                                    <div style={styles.gameDetails}>
                                                        <div>👥 {game.participantCount} participants</div>
                                                        <div>📅 Created: {formatDate(game.createdAtUtc)}</div>
                                                    </div>
                                                    <div style={{ ...styles.gameStatus, ...getStatusStyle(status) }}>
                                                        {getStatusText(status)}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}

                            {games.hostedGames.filter(game => game.archived).length > 0 && (
                                <>
                                    <h2 style={styles.sectionTitle}>
                                        Archived Hosted Games ({games.hostedGames.filter(game => game.archived).length})
                                    </h2>
                                    <div style={styles.gamesGrid}>
                                        {games.hostedGames.filter(game => game.archived).map((game) => {
                                            const status = getGameStatus(game)
                                            return (
                                                <div
                                                    key={game.code}
                                                    style={{
                                                        ...styles.gameCard,
                                                        ...(hoveredCard === `host-${game.code}` ? styles.gameCardHover : {})
                                                    }}
                                                    onClick={() => handleGameClick(game, true)}
                                                    onMouseEnter={() => setHoveredCard(`host-${game.code}`)}
                                                    onMouseLeave={() => setHoveredCard(null)}
                                                >
                                                    <div style={styles.gameCode}>
                                                        🎮 {game.code}
                                                    </div>
                                                    <div style={styles.gameEventName}>
                                                        {game.eventName || 'Unnamed Event'}
                                                    </div>
                                                    <div style={styles.gameDetails}>
                                                        <div>👥 {game.participantCount} participants</div>
                                                        <div>📅 Created: {formatDate(game.createdAtUtc)}</div>
                                                    </div>
                                                    <div style={{ ...styles.gameStatus, ...getStatusStyle(status) }}>
                                                        {getStatusText(status)}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {games.playedGames && games.playedGames.length > 0 && (
                        <>
                            {games.playedGames.filter(game => !game.archived).length > 0 && (
                                <>
                                    <h2 style={styles.sectionTitle}>
                                        Active Played Games ({games.playedGames.filter(game => !game.archived).length})
                                    </h2>
                                    <div style={styles.gamesGrid}>
                                        {games.playedGames.filter(game => !game.archived).map((game) => {
                                            const status = getGameStatus(game)
                                            return (
                                                <div
                                                    key={game.code}
                                                    style={{
                                                        ...styles.gameCard,
                                                        ...(hoveredCard === `played-${game.code}` ? styles.gameCardHover : {})
                                                    }}
                                                    onClick={() => handleGameClick(game, false)}
                                                    onMouseEnter={() => setHoveredCard(`played-${game.code}`)}
                                                    onMouseLeave={() => setHoveredCard(null)}
                                                >
                                                    <div style={styles.gameCode}>
                                                        🎯 {game.code}
                                                    </div>
                                                    <div style={styles.gameEventName}>
                                                        {game.eventName || 'Unnamed Event'}
                                                    </div>
                                                    <div style={styles.gameDetails}>
                                                        <div>👥 {game.participantCount} participants</div>
                                                        <div>📅 Created: {formatDate(game.createdAtUtc)}</div>
                                                    </div>
                                                    <div style={{ ...styles.gameStatus, ...getStatusStyle(status) }}>
                                                        {getStatusText(status)}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}

                            {games.playedGames.filter(game => game.archived).length > 0 && (
                                <>
                                    <h2 style={styles.sectionTitle}>
                                        Archived Played Games ({games.playedGames.filter(game => game.archived).length})
                                    </h2>
                                    <div style={styles.gamesGrid}>
                                        {games.playedGames.filter(game => game.archived).map((game) => {
                                            const status = getGameStatus(game)
                                            return (
                                                <div
                                                    key={game.code}
                                                    style={{
                                                        ...styles.gameCard,
                                                        ...(hoveredCard === `played-${game.code}` ? styles.gameCardHover : {})
                                                    }}
                                                    onClick={() => handleGameClick(game, false)}
                                                    onMouseEnter={() => setHoveredCard(`played-${game.code}`)}
                                                    onMouseLeave={() => setHoveredCard(null)}
                                                >
                                                    <div style={styles.gameCode}>
                                                        🎯 {game.code}
                                                    </div>
                                                    <div style={styles.gameEventName}>
                                                        {game.eventName || 'Unnamed Event'}
                                                    </div>
                                                    <div style={styles.gameDetails}>
                                                        <div>👥 {game.participantCount} participants</div>
                                                        <div>📅 Created: {formatDate(game.createdAtUtc)}</div>
                                                    </div>
                                                    <div style={{ ...styles.gameStatus, ...getStatusStyle(status) }}>
                                                        {getStatusText(status)}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {(!games.hostedGames || games.hostedGames.length === 0) &&
                     (!games.playedGames || games.playedGames.length === 0) && (
                        <div style={styles.noGames}>
                            No games found. Start by creating or joining a game!
                        </div>
                    )}

                    {games.totalGames > 0 && (
                        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>
                            Total Games: {games.totalGames}
                        </div>
                    )}
                </>
            ) : null}

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '1rem'
                    }}
                    onClick={handleCloseModal}
                >
                    <div
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            padding: '2rem',
                            maxWidth: '500px',
                            width: '100%',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                            border: '1px solid var(--border-color)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                            Change Password
                        </h2>

                        {passwordError && (
                            <div style={{
                                backgroundColor: '#ff4444',
                                color: '#fff',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                fontSize: '0.9rem'
                            }}>
                                ⚠️ {passwordError}
                            </div>
                        )}

                        {passwordSuccess && (
                            <div style={{
                                backgroundColor: '#4ade80',
                                color: '#fff',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                fontSize: '0.9rem'
                            }}>
                                ✅ {passwordSuccess}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label htmlFor="currentPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                    Current Password
                                </label>
                                <input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordInputChange}
                                    disabled={passwordLoading}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        fontSize: '1rem',
                                        border: '2px solid var(--border-color)',
                                        borderRadius: '8px',
                                        backgroundColor: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        boxSizing: 'border-box'
                                    }}
                                    autoComplete="current-password"
                                />
                            </div>

                            <div>
                                <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                    New Password
                                </label>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordInputChange}
                                    disabled={passwordLoading}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        fontSize: '1rem',
                                        border: '2px solid var(--border-color)',
                                        borderRadius: '8px',
                                        backgroundColor: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        boxSizing: 'border-box'
                                    }}
                                    autoComplete="new-password"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmNewPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    type="password"
                                    value={passwordForm.confirmNewPassword}
                                    onChange={handlePasswordInputChange}
                                    disabled={passwordLoading}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        fontSize: '1rem',
                                        border: '2px solid var(--border-color)',
                                        borderRadius: '8px',
                                        backgroundColor: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                        boxSizing: 'border-box'
                                    }}
                                    autoComplete="new-password"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    style={{
                                        flex: 1,
                                        padding: '0.875rem',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        backgroundColor: 'var(--primary-color)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: passwordLoading ? 'not-allowed' : 'pointer',
                                        opacity: passwordLoading ? 0.6 : 1,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {passwordLoading ? 'Changing...' : 'Change Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={passwordLoading}
                                    style={{
                                        flex: 1,
                                        padding: '0.875rem',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        border: '2px solid var(--border-color)',
                                        borderRadius: '8px',
                                        cursor: passwordLoading ? 'not-allowed' : 'pointer',
                                        opacity: passwordLoading ? 0.6 : 1,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
