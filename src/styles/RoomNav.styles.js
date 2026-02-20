export const styles = {
    nav: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--card-bg)',
        borderBottom: '2px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 'clamp(0.5rem, 2vw, 0.75rem)',
        zIndex: 1000,
        boxShadow: '0 2px 10px var(--shadow-color)',
        boxSizing: 'border-box',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        opacity: 1
    },
    navButton: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        padding: 'clamp(0.5rem, 2vw, 0.75rem)',
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        borderRadius: '8px',
        minWidth: '60px',
        minHeight: '44px',
        outline: 'none',
        opacity: 1
    },
    navButtonActive: {
        color: 'var(--primary-color)',
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--primary-color)',
        fontWeight: '600'
    },
    navButtonDisabled: {
        opacity: 0.4,
        cursor: 'not-allowed',
        color: 'var(--text-tertiary)'
    },
    navLabel: {
        fontSize: 'clamp(0.65rem, 2vw, 0.75rem)',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    }
}