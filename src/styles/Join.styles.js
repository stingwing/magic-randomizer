export const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: 'clamp(1rem, 3vw, 2rem)',
        fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box'
    },
    header: {
        textAlign: 'center',
        marginBottom: 'clamp(2rem, 5vw, 3rem)'
    },
    title: {
        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
        fontWeight: '700',
        marginBottom: '0.5rem',
        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    },
    subtitle: {
        fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
        color: 'var(--text-secondary)',
        margin: 0
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
        gap: 'clamp(1rem, 3vw, 2rem)',
        marginBottom: '2rem'
    },
    card: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: 'clamp(1.5rem, 3vw, 2rem)',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px var(--shadow-color)',
        width: '100%',
        boxSizing: 'border-box'
    },
    cardIcon: {
        fontSize: 'clamp(2.5rem, 6vw, 3rem)',
        marginBottom: '1rem'
    },
    cardTitle: {
        fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
        fontWeight: '600',
        marginTop: 0,
        marginBottom: '0.75rem',
        color: 'var(--text-primary)'
    },
    cardDescription: {
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        marginBottom: '1.5rem'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    label: {
        display: 'flex',
        flexDirection: 'column',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
        fontWeight: '500',
        gap: '0.5rem',
        textAlign: 'left',
        color: 'var(--text-primary)'
    },
    input: {
        width: '100%',
        padding: 'clamp(0.6rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        transition: 'all 0.2s ease',
        outline: 'none',
        boxSizing: 'border-box',
        minHeight: '44px'
    },
    inputError: {
        borderColor: 'var(--error-border)',
        background: 'var(--error-bg)'
    },
    validationError: {
        color: 'var(--error-text)',
        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
        marginTop: '0.25rem'
    },
    primaryButton: {
        width: '100%',
        padding: 'clamp(0.875rem, 2vw, 1rem)',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        fontWeight: '600',
        borderRadius: '8px',
        border: 'none',
        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        boxShadow: '0 4px 12px var(--button-shadow)',
        minHeight: '48px',
        outline: 'none'
    },
    secondaryButton: {
        width: '100%',
        padding: 'clamp(0.875rem, 2vw, 1rem)',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        fontWeight: '600',
        borderRadius: '8px',
        border: '1px solid var(--primary-color)',
        background: 'transparent',
        color: 'var(--primary-color)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        minHeight: '48px',
        outline: 'none'
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
    },
    errorBanner: {
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)',
        borderRadius: '8px',
        background: 'var(--error-bg)',
        border: '1px solid var(--error-border)',
        color: 'var(--error-text)',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
        width: '100%',
        boxSizing: 'border-box'
    },
    errorIcon: {
        fontSize: 'clamp(1rem, 3vw, 1.25rem)',
        flexShrink: 0
    },
    spinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
        flexShrink: 0
    }
}

export const modeStyles = {
    modeSelector: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap'
    },
    modeButton: {
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        fontWeight: '600',
        borderRadius: '12px',
        border: '2px solid var(--border-color)',
        background: 'var(--card-bg)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 2px 8px var(--shadow-color)',
        whiteSpace: 'nowrap',
        minHeight: '48px',
        outline: 'none'
    },
    modeButtonActive: {
        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
        color: 'white',
        borderColor: 'var(--primary-color)',
        boxShadow: '0 4px 12px var(--button-shadow)',
        transform: 'translateY(-2px)'
    }
}