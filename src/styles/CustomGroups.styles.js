export const styles = {
    container: {
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        minHeight: '100vh',
        overflowX: 'hidden'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        flex: '1 1 auto',
        minWidth: '0'
    },
    title: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'var(--text-primary)',
        margin: 0
    },
    connectionStatus: {
        fontSize: '0.85rem',
        whiteSpace: 'nowrap'
    },
    backButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: 'var(--card-background)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontWeight: '500',
        whiteSpace: 'nowrap'
    },
    infoCard: {
        backgroundColor: 'var(--card-background)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)'
    },
    infoTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '0.75rem'
    },
    infoText: {
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        marginBottom: '1rem'
    },
    infoList: {
        color: 'var(--text-secondary)',
        lineHeight: '1.8',
        paddingLeft: '1.5rem',
        margin: 0
    },
    errorMessage: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: '1px solid #fca5a5'
    },
    successMessage: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: '1px solid #6ee7b7'
    },
    createSection: {
        backgroundColor: 'var(--card-background)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)'
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '1.5rem'
    },
    selectionInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '0.75rem',
        backgroundColor: 'var(--background-primary)',
        borderRadius: '8px',
        flexWrap: 'wrap',
        gap: '0.5rem'
    },
    selectionCount: {
        fontSize: '0.95rem',
        fontWeight: '500',
        color: 'var(--text-primary)'
    },
    clearButton: {
        padding: '0.5rem 1rem',
        backgroundColor: 'transparent',
        color: 'var(--danger-color)',
        border: '1px solid var(--danger-color)',
        borderRadius: '6px',
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    playersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
    },
    playerCard: {
        padding: '1rem',
        backgroundColor: 'var(--background-primary)',
        border: '2px solid var(--border-color)',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        textAlign: 'left'
    },
    playerCardSelected: {
        backgroundColor: 'var(--primary-color)',
        border: '2px solid var(--primary-color)',
        color: 'white'
    },
    playerCardYou: {
        backgroundColor: 'var(--success-color)',
        borderColor: 'var(--success-color)',
        color: 'white',
        opacity: 0.9
    },
    playerName: {
        fontSize: '1rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap'
    },
    checkmark: {
        fontSize: '1.25rem',
        fontWeight: 'bold'
    },
    youBadge: {
        fontSize: '0.7rem',
        padding: '2px 6px',
        borderRadius: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        fontWeight: '600'
    },
    youBadgeSmall: {
        fontSize: '0.7rem',
        padding: '2px 6px',
        borderRadius: '4px',
        backgroundColor: 'var(--success-color)',
        color: 'white',
        fontWeight: '600',
        marginLeft: '0.5rem'
    },
    customBadge: {
        fontSize: '0.75rem',
        padding: '2px 8px',
        borderRadius: '4px',
        color: 'white',
        fontWeight: '600',
        alignSelf: 'flex-start'
    },
    createActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginTop: '1.5rem'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        cursor: 'pointer',
        padding: '1rem',
        backgroundColor: 'var(--background-primary)',
        borderRadius: '8px'
    },
    checkbox: {
        width: '20px',
        height: '20px',
        cursor: 'pointer',
        marginTop: '2px'
    },
    checkboxText: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
    },
    checkboxHint: {
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        fontStyle: 'italic'
    },
    createButton: {
        padding: '1rem 2rem',
        backgroundColor: 'var(--success-color)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    existingSection: {
        backgroundColor: 'var(--card-background)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)'
    },
    groupsList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
    },
    groupCard: {
        backgroundColor: 'var(--background-primary)',
        borderRadius: '8px',
        padding: '1.5rem',
        border: '1px solid var(--border-color)'
    },
    groupHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '0.5rem'
    },
    groupTitle: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    },
    groupColorIndicator: {
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        flexShrink: 0
    },
    deleteButton: {
        padding: '0.5rem 1rem',
        backgroundColor: 'transparent',
        color: 'var(--danger-color)',
        border: '1px solid var(--danger-color)',
        borderRadius: '6px',
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
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
        padding: '0.5rem',
        backgroundColor: 'var(--card-background)',
        borderRadius: '4px',
        fontSize: '0.9rem'
    },
    memberDot: {
        color: 'var(--primary-color)',
        fontSize: '0.75rem'
    },
    groupInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-color)'
    },
    groupInfoText: {
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        fontStyle: 'italic'
    },
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: 'var(--card-background)',
        borderRadius: '12px',
        border: '2px dashed var(--border-color)'
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '1rem'
    },
    emptyTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '0.5rem'
    },
    emptyText: {
        color: 'var(--text-secondary)',
        fontSize: '1rem'
    },
    spinner: {
        display: 'inline-block',
        width: '1rem',
        height: '1rem',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite'
    },
    contentWrapper: {
        // Placeholder for mobile padding-top
    }
}

// Add media query styles as a string to be injected
export const mediaQueryStyles = `
    @media (max-width: 768px) {
        body {
            overflow-x: hidden;
        }
    }
`