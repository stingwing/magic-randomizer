export const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        backgroundColor: 'var(--bg-primary)'
    },
    card: {
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid var(--border-color)'
    },
    title: {
        fontSize: '2rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
        color: 'var(--text-primary)',
        textAlign: 'center'
    },
    subtitle: {
        fontSize: '1rem',
        color: 'var(--text-secondary)',
        marginBottom: '2rem',
        textAlign: 'center'
    },
    tabs: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-primary)',
        padding: '4px'
    },
    tab: {
        flex: 1,
        padding: '0.75rem',
        border: 'none',
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '1rem',
        borderRadius: '6px',
        transition: 'all 0.2s ease'
    },
    tabActive: {
        backgroundColor: 'var(--primary-color)',
        color: '#fff',
        fontWeight: '600'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: 'var(--text-primary)'
    },
    input: {
        padding: '0.75rem',
        fontSize: '1rem',
        border: '2px solid var(--border-color)',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        transition: 'border-color 0.2s ease'
    },
    inputError: {
        borderColor: '#ff4444'
    },
    errorMessage: {
        color: '#ff4444',
        fontSize: '0.85rem',
        marginTop: '0.25rem'
    },
    button: {
        padding: '0.875rem',
        fontSize: '1rem',
        fontWeight: '600',
        backgroundColor: 'var(--primary-color)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
    },
    successMessage: {
        backgroundColor: '#4ade80',
        color: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: '500'
    },
    errorBanner: {
        backgroundColor: '#ff4444',
        color: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '1rem'
    },
    link: {
        color: 'var(--primary-color)',
        textDecoration: 'none',
        fontWeight: '500',
        cursor: 'pointer'
    },
    divider: {
        textAlign: 'center',
        margin: '1.5rem 0',
        position: 'relative',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
    },
    spinner: {
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite'
    }
}
