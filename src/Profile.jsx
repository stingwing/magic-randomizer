import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { styles } from './styles/Profile.styles'
import { analytics } from './utils/analytics'

const API_BASE = import.meta.env.VITE_API_BASE?.replace('/api/Rooms', '') || 'https://localhost:7086'

export default function ProfilePage() {
    const { user, logout, updateUser } = useAuth()
    const navigate = useNavigate()
    const [games, setGames] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    })
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordError, setPasswordError] = useState(null)
    const [passwordSuccess, setPasswordSuccess] = useState(null)
    const [resendVerificationLoading, setResendVerificationLoading] = useState(false)
    const [resendVerificationSuccess, setResendVerificationSuccess] = useState(false)

    useEffect(() => {
        if (!user) {
            navigate('/auth')
            return
        }

        fetchUserProfile()
        fetchGames()
    }, [user, navigate])

    const fetchUserProfile = async () => {
        if (!user?.token) return

        try {
            const response = await fetch(`${API_BASE}/api/Auth/profile/me`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })

            if (!response.ok) {
                // If token is invalid, logout
                if (response.status === 401) {
                    logout()
                    navigate('/auth')
                }
                throw new Error('Failed to fetch profile')
            }

            const profileData = await response.json()
            // Update user data with fresh profile info
            const updatedUser = {
                ...user,
                emailVerified: profileData.emailConfirmed,
                createdAtUtc: profileData.createdAtUtc,
                lastLoginUtc: profileData.lastLoginUtc
            }
            // Update context with fresh data
            if (JSON.stringify(user) !== JSON.stringify(updatedUser)) {
                updateUser(updatedUser)
            }
        } catch (err) {
            console.error('Error fetching profile:', err)
        }
    }

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

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
                analytics.navigateToHostRoom(game.code)
                navigate(`/host/${game.code}/${user.username}`)
            } else {
                // Encode room code for view page and pass state to indicate we came from profile
                const encodedCode = btoa(game.code)
                analytics.viewRoom(game.code)
                navigate(`/view/${encodedCode}`, { state: { from: 'profile' } })
            }
        } else {
            // Try to navigate to player view if we have stored participantId
            if ((!game.archived)) {
                analytics.navigateToPlayerRoom(game.code)
                navigate(`/room/${game.code}/${user.username}`)
            } else {
                // Otherwise go to view page with encoded code and pass state to indicate we came from profile
                const encodedCode = btoa(game.code)
                analytics.viewRoom(game.code)
                navigate(`/view/${encodedCode}`, { state: { from: 'profile' } })
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

    const filterGames = (gameList) => {
        if (!searchQuery.trim()) return gameList

        const query = searchQuery.toLowerCase()
        return gameList.filter(game => 
            game.code?.toLowerCase().includes(query) ||
            game.eventName?.toLowerCase().includes(query) ||
            game.participantCount?.toString().includes(query)
        )
    }

    const renderMobileGameCard = (game, isHost) => {
        const status = getGameStatus(game)
        return (
            <div
                key={game.code}
                onClick={() => handleGameClick(game, isHost)}
                style={{
                    padding: '16px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-color)'
                    e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                }}>
                    <div style={{
                        fontWeight: '700',
                        fontSize: '1.2em',
                        color: 'var(--primary-color)',
                        fontFamily: 'monospace'
                    }}>
                        {game.code}
                    </div>
                    <div style={{
                        fontSize: '0.75em',
                        backgroundColor: status === 'active' ? '#22c55e' : status === 'ended' ? '#f59e0b' : status === 'archived' ? '#666' : '#94a3b8',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                    }}>
                        {getStatusText(status)}
                    </div>
                </div>
                <div style={{
                    fontSize: '1em',
                    color: 'var(--text-primary)',
                    fontWeight: '500',
                    marginBottom: '8px'
                }}>
                    {game.eventName || '-'}
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85em',
                    color: 'var(--text-secondary)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>👥</span>
                        <span>{game.participantCount} players</span>
                    </div>
                    <div>
                        {formatDate(game.createdAtUtc)}
                    </div>
                </div>
            </div>
        )
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
            const response = await fetch(`${API_BASE}/api/Auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
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
            analytics.changePassword()
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

    const handleResendVerification = async () => {
        if (!user?.email) return

        setResendVerificationLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE}/api/Auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: user.email
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Failed to resend verification email')
            }

            setResendVerificationSuccess(true)
            analytics.resendVerificationEmail()

            // Hide success message after 5 seconds
            setTimeout(() => {
                setResendVerificationSuccess(false)
            }, 5000)
        } catch (err) {
            console.error('Resend verification error:', err)
            setError(err.message || 'Failed to resend verification email')
        } finally {
            setResendVerificationLoading(false)
        }
    }

    if (!user) {
        return null
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>My Profile</h1>
                <div style={{ display: 'flex', gap: isMobile ? '0.5rem' : '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        style={{
                            ...styles.changePasswordButton,
                            padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.5rem',
                            fontSize: isMobile ? '0.9rem' : '1rem',
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={styles.value}>{user.email}</span>
                            {user.emailVerified === false && (
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: '#ff6b6b',
                                    fontWeight: '600',
                                    backgroundColor: '#ffe0e0',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px'
                                }}>
                                    Unverified
                                </span>
                            )}
                        </div>
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

            {user.emailVerified === false && (
                <div style={styles.verificationBanner}>
                    <div style={styles.verificationText}>
                        ⚠️ Your email address is not verified. Please check your inbox for a verification email.
                    </div>
                    {resendVerificationSuccess ? (
                        <div style={styles.successText}>
                            ✅ Verification email sent! Check your inbox.
                        </div>
                    ) : (
                        <button
                            onClick={handleResendVerification}
                            disabled={resendVerificationLoading}
                            style={{
                                ...styles.resendButton,
                                ...(resendVerificationLoading ? styles.resendButtonDisabled : {})
                            }}
                            onMouseEnter={(e) => !resendVerificationLoading && (e.currentTarget.style.opacity = '0.9')}
                            onMouseLeave={(e) => !resendVerificationLoading && (e.currentTarget.style.opacity = '1')}
                        >
                            {resendVerificationLoading ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                    )}
                </div>
            )}

            {error && (
                <div style={styles.errorBanner}>
                    ⚠️ {error}
                </div>
            )}

            {/* Search Bar */}
            {games && ((games.hostedGames && games.hostedGames.length > 0) || (games.playedGames && games.playedGames.length > 0)) && (
                <div style={{
                    marginBottom: '2rem',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '600px'
                    }}>
                        <input
                            type="text"
                            placeholder="Search games by code, event name, or player count..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 44px',
                                fontSize: '1rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary-color)'
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)'
                            }}
                        />
                        <span style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '1.2rem'
                        }}>
                            🔍
                        </span>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    padding: '4px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = 'var(--primary-color)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = 'var(--text-secondary)'
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
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
                            {filterGames(games.hostedGames.filter(game => !game.archived)).length > 0 && (
                                <>
                                    <h2 style={styles.sectionTitle}>
                                        Active Hosted Games ({filterGames(games.hostedGames.filter(game => !game.archived)).length})
                                    </h2>
                                    {isMobile ? (
                                        <div style={{
                                            display: 'grid',
                                            gap: '12px'
                                        }}>
                                            {filterGames(games.hostedGames.filter(game => !game.archived)).map((game) => 
                                                renderMobileGameCard(game, true)
                                            )}
                                        </div>
                                    ) : (
                                    <div style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        {/* Grid Header */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '120px 2fr 200px 80px 100px',
                                            gap: '12px',
                                            padding: '0 16px 12px',
                                            borderBottom: '1px solid var(--border-color)',
                                            fontWeight: '600',
                                            fontSize: '0.85em',
                                            color: 'var(--text-secondary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            <div>Code</div>
                                            <div>Event Name</div>
                                            <div>Created</div>
                                            <div>Players</div>
                                            <div>Status</div>
                                        </div>
                                        {/* Game List Items */}
                                        <div style={{
                                            display: 'grid',
                                            gap: '12px',
                                            marginTop: '12px'
                                        }}>
                                            {filterGames(games.hostedGames.filter(game => !game.archived)).map((game) => {
                                                const status = getGameStatus(game)
                                                return (
                                                    <div
                                                        key={game.code}
                                                        onClick={() => handleGameClick(game, true)}
                                                        style={{
                                                            padding: '12px 16px',
                                                            backgroundColor: 'var(--bg-secondary)',
                                                            borderRadius: '8px',
                                                            border: '1px solid var(--border-color)',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            display: 'grid',
                                                            gridTemplateColumns: '120px 2fr 200px 80px 100px',
                                                            gap: '12px',
                                                            alignItems: 'center'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.borderColor = 'var(--primary-color)'
                                                            e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.borderColor = 'var(--border-color)'
                                                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                                                        }}
                                                    >
                                                        <div style={{
                                                            fontWeight: '700',
                                                            fontSize: '1.1em',
                                                            color: 'var(--primary-color)',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {game.code}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.9em',
                                                            color: 'var(--text-primary)',
                                                            fontWeight: '500',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {game.eventName || '-'}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.85em',
                                                            color: 'var(--text-secondary)'
                                                        }}>
                                                            {formatDate(game.createdAtUtc)}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.9em',
                                                            color: 'var(--text-primary)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <span>👥</span>
                                                            <span>{game.participantCount}</span>
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.75em',
                                                            backgroundColor: status === 'active' ? '#22c55e' : status === 'ended' ? '#f59e0b' : '#94a3b8',
                                                            color: 'white',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontWeight: '600',
                                                            textAlign: 'center',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {getStatusText(status)}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    )}
                                </>
                            )}

                            {filterGames(games.hostedGames.filter(game => game.archived)).length > 0 && (
                                <>
                                    <h2 style={styles.sectionTitle}>
                                        Archived Hosted Games ({filterGames(games.hostedGames.filter(game => game.archived)).length})
                                    </h2>
                                    {isMobile ? (
                                        <div style={{
                                            display: 'grid',
                                            gap: '12px'
                                        }}>
                                            {filterGames(games.hostedGames.filter(game => game.archived)).map((game) => 
                                                renderMobileGameCard(game, true)
                                            )}
                                        </div>
                                    ) : (
                                    <div style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        {/* Grid Header */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '120px 2fr 200px 80px 100px',
                                            gap: '12px',
                                            padding: '0 16px 12px',
                                            borderBottom: '1px solid var(--border-color)',
                                            fontWeight: '600',
                                            fontSize: '0.85em',
                                            color: 'var(--text-secondary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            <div>Code</div>
                                            <div>Event Name</div>
                                            <div>Created</div>
                                            <div>Players</div>
                                            <div>Status</div>
                                        </div>
                                        {/* Game List Items */}
                                        <div style={{
                                            display: 'grid',
                                            gap: '12px',
                                            marginTop: '12px'
                                        }}>
                                            {filterGames(games.hostedGames.filter(game => game.archived)).map((game) => {
                                                const status = getGameStatus(game)
                                                return (
                                                    <div
                                                        key={game.code}
                                                        onClick={() => handleGameClick(game, true)}
                                                        style={{
                                                            padding: '12px 16px',
                                                            backgroundColor: 'var(--bg-secondary)',
                                                            borderRadius: '8px',
                                                            border: '1px solid var(--border-color)',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            display: 'grid',
                                                            gridTemplateColumns: '120px 2fr 200px 80px 100px',
                                                            gap: '12px',
                                                            alignItems: 'center'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.borderColor = 'var(--primary-color)'
                                                            e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.borderColor = 'var(--border-color)'
                                                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                                                        }}
                                                    >
                                                        <div style={{
                                                            fontWeight: '700',
                                                            fontSize: '1.1em',
                                                            color: 'var(--primary-color)',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {game.code}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.9em',
                                                            color: 'var(--text-primary)',
                                                            fontWeight: '500',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {game.eventName || '-'}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.85em',
                                                            color: 'var(--text-secondary)'
                                                        }}>
                                                            {formatDate(game.createdAtUtc)}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.9em',
                                                            color: 'var(--text-primary)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <span>👥</span>
                                                            <span>{game.participantCount}</span>
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.75em',
                                                            backgroundColor: '#666',
                                                            color: 'white',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontWeight: '600',
                                                            textAlign: 'center',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            ARCHIVED
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {games.playedGames && games.playedGames.length > 0 && (
                        <>
                            {filterGames(games.playedGames.filter(game => !game.archived)).length > 0 && (
                                <>
                                    <h2 style={styles.sectionTitle}>
                                        Active Played Games ({filterGames(games.playedGames.filter(game => !game.archived)).length})
                                    </h2>
                                    {isMobile ? (
                                        <div style={{
                                            display: 'grid',
                                            gap: '12px'
                                        }}>
                                            {filterGames(games.playedGames.filter(game => !game.archived)).map((game) => 
                                                renderMobileGameCard(game, false)
                                            )}
                                        </div>
                                    ) : (
                                    <div style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        {/* Grid Header */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '120px 2fr 200px 80px 100px',
                                            gap: '12px',
                                            padding: '0 16px 12px',
                                            borderBottom: '1px solid var(--border-color)',
                                            fontWeight: '600',
                                            fontSize: '0.85em',
                                            color: 'var(--text-secondary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            <div>Code</div>
                                            <div>Event Name</div>
                                            <div>Created</div>
                                            <div>Players</div>
                                            <div>Status</div>
                                        </div>
                                        {/* Game List Items */}
                                        <div style={{
                                            display: 'grid',
                                            gap: '12px',
                                            marginTop: '12px'
                                        }}>
                                            {filterGames(games.playedGames.filter(game => !game.archived)).map((game) => {
                                                const status = getGameStatus(game)
                                                return (
                                                    <div
                                                        key={game.code}
                                                        onClick={() => handleGameClick(game, false)}
                                                        style={{
                                                            padding: '12px 16px',
                                                            backgroundColor: 'var(--bg-secondary)',
                                                            borderRadius: '8px',
                                                            border: '1px solid var(--border-color)',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            display: 'grid',
                                                            gridTemplateColumns: '120px 2fr 200px 80px 100px',
                                                            gap: '12px',
                                                            alignItems: 'center'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.borderColor = 'var(--primary-color)'
                                                            e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.borderColor = 'var(--border-color)'
                                                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                                                        }}
                                                    >
                                                        <div style={{
                                                            fontWeight: '700',
                                                            fontSize: '1.1em',
                                                            color: 'var(--primary-color)',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {game.code}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.9em',
                                                            color: 'var(--text-primary)',
                                                            fontWeight: '500',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {game.eventName || '-'}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.85em',
                                                            color: 'var(--text-secondary)'
                                                        }}>
                                                            {formatDate(game.createdAtUtc)}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.9em',
                                                            color: 'var(--text-primary)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <span>👥</span>
                                                            <span>{game.participantCount}</span>
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.75em',
                                                            backgroundColor: status === 'active' ? '#22c55e' : status === 'ended' ? '#f59e0b' : '#94a3b8',
                                                            color: 'white',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontWeight: '600',
                                                            textAlign: 'center',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {getStatusText(status)}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    )}
                                </>
                            )}

                            {filterGames(games.playedGames.filter(game => game.archived)).length > 0 && (
                                <>
                                    <h2 style={styles.sectionTitle}>
                                        Archived Played Games ({filterGames(games.playedGames.filter(game => game.archived)).length})
                                    </h2>
                                    {isMobile ? (
                                        <div style={{
                                            display: 'grid',
                                            gap: '12px'
                                        }}>
                                            {filterGames(games.playedGames.filter(game => game.archived)).map((game) => 
                                                renderMobileGameCard(game, false)
                                            )}
                                        </div>
                                    ) : (
                                    <div style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        {/* Grid Header */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '120px 2fr 200px 80px 100px',
                                            gap: '12px',
                                            padding: '0 16px 12px',
                                            borderBottom: '1px solid var(--border-color)',
                                            fontWeight: '600',
                                            fontSize: '0.85em',
                                            color: 'var(--text-secondary)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            <div>Code</div>
                                            <div>Event Name</div>
                                            <div>Created</div>
                                            <div>Players</div>
                                            <div>Status</div>
                                        </div>
                                        {/* Game List Items */}
                                        <div style={{
                                            display: 'grid',
                                            gap: '12px',
                                            marginTop: '12px'
                                        }}>
                                            {filterGames(games.playedGames.filter(game => game.archived)).map((game) => {
                                                const status = getGameStatus(game)
                                                return (
                                                    <div
                                                        key={game.code}
                                                        onClick={() => handleGameClick(game, false)}
                                                        style={{
                                                            padding: '12px 16px',
                                                            backgroundColor: 'var(--bg-secondary)',
                                                            borderRadius: '8px',
                                                            border: '1px solid var(--border-color)',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            display: 'grid',
                                                            gridTemplateColumns: '120px 2fr 200px 80px 100px',
                                                            gap: '12px',
                                                            alignItems: 'center'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.borderColor = 'var(--primary-color)'
                                                            e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.borderColor = 'var(--border-color)'
                                                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                                                        }}
                                                    >
                                                        <div style={{
                                                            fontWeight: '700',
                                                            fontSize: '1.1em',
                                                            color: 'var(--primary-color)',
                                                            fontFamily: 'monospace'
                                                        }}>
                                                            {game.code}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.9em',
                                                            color: 'var(--text-primary)',
                                                            fontWeight: '500',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {game.eventName || '-'}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.85em',
                                                            color: 'var(--text-secondary)'
                                                        }}>
                                                            {formatDate(game.createdAtUtc)}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.9em',
                                                            color: 'var(--text-primary)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <span>👥</span>
                                                            <span>{game.participantCount}</span>
                                                        </div>
                                                        <div style={{
                                                            fontSize: '0.75em',
                                                            backgroundColor: '#666',
                                                            color: 'white',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontWeight: '600',
                                                            textAlign: 'center',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            ARCHIVED
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    )}
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

                    {/* No search results message */}
                    {searchQuery && 
                     games.hostedGames && games.playedGames &&
                     filterGames([...games.hostedGames, ...games.playedGames]).length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            color: 'var(--text-secondary)',
                            fontSize: '1.1rem'
                        }}>
                            No games match your search for "{searchQuery}"
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
