export const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        paddingTop: '70px', // Space for fixed nav
        paddingBottom: '2rem',
        width: '100%',
        boxSizing: 'border-box'
    },
    content: {
        padding: 'clamp(1rem, 3vw, 2rem)',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
    },
    pageHeader: {
        marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
        textAlign: 'center'
    },
    title: {
        margin: '0 0 0.5rem 0',
        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
        fontWeight: '700',
        color: 'var(--text-primary)'
    },
    subtitle: {
        margin: 0,
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        color: 'var(--text-secondary)'
    },
    infoCard: {
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        padding: 'clamp(1rem, 3vw, 1.5rem)',
        marginBottom: '1.5rem',
        border: '1px solid var(--border-color)',
        width: '100%',
        boxSizing: 'border-box'
    },
    infoTitle: {
        margin: '0 0 0.75rem 0',
        fontSize: 'clamp(1rem, 3vw, 1.1rem)',
        fontWeight: '600',
        color: 'var(--primary-color)'
    },
    infoText: {
        margin: '0 0 0.75rem 0',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        color: 'var(--text-primary)',
        lineHeight: '1.6'
    },
    infoList: {
        margin: 0,
        paddingLeft: '1.5rem',
        fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
        color: 'var(--text-secondary)',
        lineHeight: '1.6'
    },
    errorMessage: {
        backgroundColor: 'var(--error-bg)',
        color: 'var(--error-text)',
        padding: 'clamp(0.75rem, 2vw, 1rem)',
        borderRadius: '8px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        border: '1px solid var(--error-border)',
        width: '100%',
        boxSizing: 'border-box'
    },
    successMessage: {
        backgroundColor: 'var(--success-bg)',
        color: 'var(--success-text)',
        padding: 'clamp(0.75rem, 2vw, 1rem)',
        borderRadius: '8px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        border: '1px solid var(--success-border)',
        width: '100%',
        boxSizing: 'border-box'
    },
    section: {
        marginBottom: 'clamp(1.5rem, 4vw, 2rem)'
    },
    sectionTitle: {
        margin: '0 0 1rem 0',
        fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
        fontWeight: '600',
        color: 'var(--text-primary)'
    },
    groupsList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
        gap: 'clamp(0.75rem, 2vw, 1rem)'
    },
    groupCard: {
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        padding: 'clamp(1rem, 3vw, 1.5rem)',
        border: '1px solid var(--border-color)',
        width: '100%',
        boxSizing: 'border-box'
    },
    groupHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        gap: '0.5rem',
        flexWrap: 'wrap'
    },
    groupTitle: {
        margin: 0,
        fontSize: 'clamp(1rem, 3vw, 1.1rem)',
        fontWeight: '600',
        color: 'var(--primary-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap'
    },
    groupColorIndicator: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        display: 'inline-block',
        flexShrink: 0
    },
    deleteButton: {
        padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
        backgroundColor: 'var(--error-bg)',
        color: 'var(--error-text)',
        border: '1px solid var(--error-border)',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
        fontWeight: '500',
        transition: 'background-color 0.2s',
        minHeight: '44px', // Touch target
        outline: 'none'
    },
    groupMembers: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1rem'
    },
    memberItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
        color: 'var(--text-primary)'
    },
    memberDot: {
        color: 'var(--primary-color)',
        fontSize: '0.6rem',
        flexShrink: 0
    },
    youBadgeSmall: {
        display: 'inline-block',
        padding: '0.1rem 0.4rem',
        backgroundColor: 'var(--accent-color)',
        color: 'white',
        borderRadius: '4px',
        fontSize: 'clamp(0.65rem, 2vw, 0.7rem)',
        fontWeight: '600',
        marginLeft: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    groupInfo: {
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-color)'
    },
    groupInfoText: {
        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
        color: 'var(--text-secondary)'
    },
    selectionInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        padding: 'clamp(0.75rem, 2vw, 1rem)',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '8px',
        flexWrap: 'wrap',
        gap: '0.5rem',
        border: '1px solid var(--border-color)'
    },
    selectionCount: {
        fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
        color: 'var(--text-primary)',
        fontWeight: '500'
    },
    clearButton: {
        padding: 'clamp(0.4rem, 2vw, 0.5rem) clamp(0.8rem, 2vw, 1rem)',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
        transition: 'background-color 0.2s',
        minHeight: '44px',
        outline: 'none'
    },
    playersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
        gap: 'clamp(0.5rem, 2vw, 0.75rem)',
        marginBottom: '1.5rem'
    },
    playerCard: {
        padding: 'clamp(0.75rem, 2vw, 1rem)',
        backgroundColor: 'var(--card-bg)',
        border: '2px solid var(--border-color)',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minHeight: '60px', // Better touch target
        boxSizing: 'border-box',
        outline: 'none'
    },
    playerCardSelected: {
        borderColor: 'var(--accent-color)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
    },
    playerCardYou: {
        borderColor: 'var(--primary-color)',
        backgroundColor: 'rgba(100, 108, 255, 0.1)'
    },
    playerName: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        fontWeight: '500',
        color: 'var(--text-primary)',
        flexWrap: 'wrap'
    },
    checkmark: {
        color: 'var(--accent-color)',
        fontSize: 'clamp(1rem, 3vw, 1.2rem)',
        fontWeight: '700',
        flexShrink: 0
    },
    youBadge: {
        display: 'inline-block',
        padding: '0.15rem 0.5rem',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        borderRadius: '4px',
        fontSize: 'clamp(0.65rem, 2vw, 0.7rem)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    customBadge: {
        display: 'inline-block',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        fontSize: 'clamp(0.65rem, 2vw, 0.75rem)',
        fontWeight: '600',
        color: 'white',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    createActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        cursor: 'pointer',
        padding: 'clamp(0.75rem, 2vw, 1rem)',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        minHeight: '44px'
    },
    checkbox: {
        width: '20px',
        height: '20px',
        cursor: 'pointer',
        marginTop: '0.2rem',
        flexShrink: 0
    },
    checkboxText: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        color: 'var(--text-primary)'
    },
    checkboxHint: {
        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
        color: 'var(--text-secondary)',
        fontStyle: 'italic'
    },
    createButton: {
        width: '100%',
        padding: 'clamp(0.875rem, 2vw, 1rem)',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        border: '1px solid var(--primary-color)',
        borderRadius: '8px',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        minHeight: '48px',
        outline: 'none'
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    }
}