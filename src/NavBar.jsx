import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

export default function NavBar() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

    return (
        <nav style={styles.nav}>
            <div style={styles.navContent}>
                <Link 
                    to="/" 
                    style={{
                        ...styles.navLink,
                        ...(isActive('/') && !isActive('/manual') && !isActive('/new') && !isActive('/view') && !isActive('/rejoin') ? styles.navLinkActive : {})
                    }}
                    title="Join Game"
                >
                    🏠 Join
                </Link>
                <Link 
                    to="/rejoin" 
                    style={{
                        ...styles.navLink,
                        ...(isActive('/rejoin') ? styles.navLinkActive : {})
                    }}
                    title="Rejoin Game"
                >
                    🔄 Rejoin
                </Link>
                <Link 
                    to="/view" 
                    style={{
                        ...styles.navLink,
                        ...(isActive('/view') ? styles.navLinkActive : {})
                    }}
                    title="View History"
                >
                    👁️ History
                </Link>
                <Link 
                    to="/new" 
                    style={{
                        ...styles.navLink,
                        ...(isActive('/new') ? styles.navLinkActive : {})
                    }}
                    title="About"
                >
                    ℹ️ About
                </Link>
                {user ? (
                    <button
                        onClick={() => navigate('/profile')}
                        style={{
                            ...styles.navLink,
                            ...styles.authButton,
                            ...(isActive('/profile') ? styles.navLinkActive : {})
                        }}
                        title={user.displayName || user.username}
                    >
                        👤 Profile
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/auth')}
                        style={{
                            ...styles.navLink,
                            ...styles.authButton,
                            ...styles.loginButton
                        }}
                        title="Login"
                    >
                        🔐 Login
                    </button>
                )}
            </div>
        </nav>
    )
}

const styles = {
    nav: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    navContent: {
        maxWidth: '1400px',
        margin: '0 auto',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        padding: '0 0.5rem',
        boxSizing: 'border-box',
        gap: '0.25rem'
    },
    navLink: {
        flex: '1 1 0',
        textDecoration: 'none',
        color: 'var(--text-secondary)',
        fontSize: 'clamp(0.75rem, 2.5vw, 1rem)',
        fontWeight: '500',
        padding: 'clamp(0.35rem, 1vw, 0.5rem) clamp(0.35rem, 1.5vw, 0.75rem)',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0
    },
    navLinkActive: {
        color: 'var(--primary-color)',
        background: 'var(--bg-secondary)'
    },
    authButton: {
        background: 'transparent',
        border: '1px solid var(--border-color)',
        cursor: 'pointer'
    },
    loginButton: {
        background: 'var(--primary-color)',
        color: '#fff',
        fontWeight: '600',
        border: 'none'
    }
}