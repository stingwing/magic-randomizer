import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function NavBar() {
    const location = useLocation()

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

    return (
        <nav style={styles.nav}>
            <div style={styles.navContent}>
                <div style={styles.navLinks}>
                    <Link 
                        to="/" 
                        style={{
                            ...styles.navLink,
                            ...(isActive('/') && !isActive('/manual') && !isActive('/new') && !isActive('/view') && !isActive('/rejoin') ? styles.navLinkActive : {})
                        }}
                    >
                        🏠 Join
                    </Link>
                    <Link 
                        to="/rejoin" 
                        style={{
                            ...styles.navLink,
                            ...(isActive('/rejoin') ? styles.navLinkActive : {})
                        }}
                    >
                        🔄 Rejoin
                    </Link>
                    <Link 
                        to="/view" 
                        style={{
                            ...styles.navLink,
                            ...(isActive('/view') ? styles.navLinkActive : {})
                        }}
                    >
                        👁️ History
                    </Link>
                    <Link 
                        to="/new" 
                        style={{
                            ...styles.navLink,
                            ...(isActive('/new') ? styles.navLinkActive : {})
                        }}
                    >
                        ℹ️ About
                    </Link>
                </div>
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
        justifyContent: 'center',
        padding: '0 clamp(0.5rem, 3vw, 2rem)',
        boxSizing: 'border-box',
        overflowX: 'auto'
    },
    navLinks: {
        display: 'flex',
        gap: 'clamp(0.25rem, 2vw, 2rem)',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center'
    },
    navLink: {
        textDecoration: 'none',
        color: 'var(--text-secondary)',
        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
        fontWeight: '500',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap'
    },
    navLinkActive: {
        color: 'var(--primary-color)',
        background: 'var(--bg-secondary)'
    }
}