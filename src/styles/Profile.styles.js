export const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        fontFamily: 'sans-serif'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: 'var(--text-primary)',
        margin: 0
    },
    logoutButton: {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        backgroundColor: '#ff4444',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    userInfo: {
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)'
    },
    userInfoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem'
    },
    userInfoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    value: {
        fontSize: '1.1rem',
        fontWeight: '500',
        color: 'var(--text-primary)'
    },
    sectionTitle: {
        fontSize: '1.75rem',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '1rem',
        marginTop: '2rem'
    },
    gamesGrid: {
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
    },
    gameCard: {
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid var(--border-color)',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
    },
    gameCardHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },
    gameCode: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: 'var(--primary-color)',
        marginBottom: '0.5rem'
    },
    gameEventName: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '1rem'
    },
    gameDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
    },
    gameStatus: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginTop: '0.5rem'
    },
    statusActive: {
        backgroundColor: '#4ade8020',
        color: '#4ade80'
    },
    statusEnded: {
        backgroundColor: '#94a3b820',
        color: '#94a3b8'
    },
    statusArchived: {
        backgroundColor: '#f59e0b20',
        color: '#f59e0b'
    },
    noGames: {
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        fontSize: '1.1rem'
    },
    loading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        fontSize: '1.1rem',
        color: 'var(--text-secondary)'
    },
    spinner: {
        display: 'inline-block',
        width: '24px',
        height: '24px',
        border: '3px solid var(--border-color)',
        borderTopColor: 'var(--primary-color)',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
        marginRight: '1rem'
    },
    errorBanner: {
        backgroundColor: '#ff4444',
        color: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '2rem',
        fontWeight: '500'
    },
    backButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'all 0.2s ease'
    }
}
