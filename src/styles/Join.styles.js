export const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem 1rem',
        fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif'
    },
    header: {
        textAlign: 'center',
        marginBottom: '3rem'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#888',
        margin: 0
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
    },
    card: {
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '2rem',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
    },
    cardIcon: {
        fontSize: '3rem',
        marginBottom: '1rem'
    },
    cardTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginTop: 0,
        marginBottom: '0.75rem'
    },
    cardDescription: {
        fontSize: '0.95rem',
        color: '#888',
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
        fontSize: '0.9rem',
        fontWeight: '500',
        gap: '0.5rem',
        textAlign: 'left'
    },
    input: {
        width: '100%',
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.2)',
        color: 'inherit',
        transition: 'all 0.2s ease',
        outline: 'none',
        boxSizing: 'border-box'
    },
    inputError: {
        border: '1px solid #ff6b6b',
        background: 'rgba(255, 107, 107, 0.1)'
    },
    validationError: {
        color: '#ff6b6b',
        fontSize: '0.85rem',
        marginTop: '0.25rem'
    },
    primaryButton: {
        width: '100%',
        padding: '0.875rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '8px',
        border: 'none',
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        boxShadow: '0 4px 12px rgba(100, 108, 255, 0.3)'
    },
    secondaryButton: {
        width: '100%',
        padding: '0.875rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '8px',
        border: '1px solid #646cff',
        background: 'transparent',
        color: '#646cff',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
    },
    errorBanner: {
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        background: 'rgba(220, 38, 38, 0.1)',
        border: '1px solid rgba(220, 38, 38, 0.3)',
        color: '#fca5a5',
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        animation: 'slideIn 0.3s ease'
    },
    errorIcon: {
        fontSize: '1.25rem'
    },
    spinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block'
    }
}