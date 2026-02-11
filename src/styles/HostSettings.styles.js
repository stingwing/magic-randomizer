export const styles = {
    container: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: 'clamp(1rem, 3vw, 2rem) 1rem'
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem'
    },
    title: {
        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0,
        marginBottom: '0.75rem'
    },
    headerInfo: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        flexWrap: 'wrap'
    },
    roomLabel: {
        color: 'var(--text-secondary)',
        fontWeight: '500'
    },
    roomCode: {
        color: 'var(--accent-color)',
        fontWeight: '700',
        fontSize: 'clamp(1rem, 3vw, 1.1rem)',
        wordBreak: 'break-word'
    },
    backButtonContainer: {
        marginBottom: '2rem'
    },
    backButton: {
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)',
        fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
        fontWeight: '600',
        borderRadius: '10px',
        background: 'var(--card-bg)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    errorMessage: {
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)',
        borderRadius: '12px',
        background: 'var(--error-bg)',
        border: '1px solid var(--error-border)',
        color: 'var(--error-text)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        animation: 'slideIn 0.3s ease',
        fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
        flexWrap: 'wrap'
    },
    successMessage: {
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)',
        borderRadius: '12px',
        background: 'var(--success-bg)',
        border: '1px solid var(--success-border)',
        color: 'var(--success-text)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        animation: 'slideIn 0.3s ease',
        fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
        flexWrap: 'wrap'
    },
    loadingCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: 'clamp(3rem, 6vw, 4rem) clamp(1.5rem, 4vw, 2.5rem)',
        boxShadow: '0 4px 12px var(--shadow-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
        color: 'var(--text-secondary)'
    },
    settingsCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    sectionTitle: {
        fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)',
        fontWeight: '600',
        marginTop: 0,
        marginBottom: '2rem',
        color: 'var(--text-primary)'
    },
    subsectionTitle: {
        fontSize: 'clamp(1rem, 3vw, 1.2rem)',
        fontWeight: '600',
        marginTop: 0,
        marginBottom: '1rem',
        color: 'var(--text-primary)'
    },
    formGroup: {
        marginBottom: '1.5rem'
    },
    label: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        fontWeight: '500',
        color: 'var(--text-primary)'
    },
    input: {
        padding: 'clamp(0.75rem, 2vw, 1rem)',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        background: 'var(--input-bg)',
        color: 'var(--text-primary)',
        transition: 'all 0.2s ease',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box'
    },
    hint: {
        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
        marginTop: '0.25rem'
    },
    checkboxGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: 'clamp(0.75rem, 2vw, 1rem)',
        background: 'var(--bg-secondary)',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        fontWeight: '500',
        color: 'var(--text-primary)'
    },
    checkbox: {
        width: '20px',
        height: '20px',
        cursor: 'pointer',
        accentColor: 'var(--accent-color)'
    },
    pointsSection: {
        marginTop: '2rem',
        padding: 'clamp(1rem, 3vw, 1.5rem)',
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
    },
    pointsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
        gap: '1rem'
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '2rem',
        gap: '1rem',
        flexWrap: 'wrap'
    },
    saveButton: {
        padding: 'clamp(1rem, 2.5vw, 1.25rem) clamp(2rem, 4vw, 3rem)',
        fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
        fontWeight: '600',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(100, 108, 255, 0.3)',
        whiteSpace: 'nowrap'
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
    },
    spinner: {
        width: '20px',
        height: '20px',
        border: '3px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block',
        flexShrink: 0
    }
}