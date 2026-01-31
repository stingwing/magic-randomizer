import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function NavBar() {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode')
        return saved !== null ? JSON.parse(saved) : true // Default to dark mode
    })
    const location = useLocation()

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
        localStorage.setItem('darkMode', JSON.stringify(darkMode))
    }, [darkMode])

    const toggleTheme = () => {
        setDarkMode(!darkMode)
    }

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

    return (
        <nav style={styles.nav}>
            <div style={styles.navContent}>
                <div style={styles.navLinks}>
                    <Link 
                        to="/" 
                        style={{
                            ...styles.navLink,
                            ...(isActive('/') && !isActive('/manual') && !isActive('/new') && !isActive('/view') ? styles.navLinkActive : {})
                        }}
                    >
                        🏠 Join
                    </Link>
                    <Link 
                        to="/manual" 
                        style={{
                            ...styles.navLink,
                            ...(isActive('/manual') ? styles.navLinkActive : {})
                        }}
                    >
                        ✏️ Manual
                    </Link>
                    <Link 
                        to="/view" 
                        style={{
                            ...styles.navLink,
                            ...(isActive('/view') ? styles.navLinkActive : {})
                        }}
                    >
                        👁️ View
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
                <button 
                    onClick={toggleTheme} 
                    style={styles.themeToggle}
                    aria-label="Toggle theme"
                >
                    {darkMode ? '☀️' : '🌙'}
                </button>
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
        justifyContent: 'space-between',
        padding: '0 2rem'
    },
    navLinks: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center'
    },
    navLink: {
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    navLinkActive: {
        background: 'var(--accent-color)',
        color: 'white',
        boxShadow: '0 2px 8px var(--accent-shadow)'
    },
    themeToggle: {
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        background: 'var(--card-bg)',
        cursor: 'pointer',
        fontSize: '1.2rem',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
}