export const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif'
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
        fontSize: '2rem',
        fontWeight: '700',
        color: 'var(--primary-color)',
        margin: 0
    },
    headerActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },
    liveIndicator: {
        color: 'var(--success-color)',
        fontSize: '0.9rem',
        fontWeight: '500'
    },
    backButton: {
        padding: '0.6rem 1.2rem',
        backgroundColor: 'var(--secondary-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: 'var(--hover-bg)',
            transform: 'translateY(-1px)'
        }
    },
    errorMessage: {
        padding: '1rem',
        backgroundColor: '#fee',
        border: '1px solid var(--error-color)',
        borderRadius: '8px',
        color: 'var(--error-color)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.95rem'
    },
    successMessage: {
        padding: '1rem',
        backgroundColor: '#efe',
        border: '1px solid var(--success-color)',
        borderRadius: '8px',
        color: 'var(--success-color)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.95rem'
    },
    section: {
        marginBottom: '3rem',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    },
    startedBadge: {
        fontSize: '0.85rem',
        color: 'var(--success-color)',
        fontWeight: '500',
        padding: '0.25rem 0.75rem',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: '12px'
    },
    groupsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1.5rem'
    },
    groupCard: {
        backgroundColor: 'var(--secondary-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem',
        transition: 'all 0.2s ease'
    },
    groupHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '2px solid var(--border-color)'
    },
    groupTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--primary-color)',
        margin: 0
    },
    winnerBadge: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: 'var(--success-color)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        padding: '0.35rem 0.75rem',
        borderRadius: '12px'
    },
    drawBadge: {
        fontSize: '0.85rem',
        fontWeight: '600',
        color: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        padding: '0.35rem 0.75rem',
        borderRadius: '12px'
    },
    membersList: {
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
    },
    memberRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.6rem 0',
        borderBottom: '1px solid var(--border-color)',
        gap: '0.5rem'
    },
    memberRowExtended: {
        display: 'flex',
        flexDirection: 'column',
        padding: '0.75rem',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        gap: '0.75rem'
    },
    memberNameSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem'
    },
    memberName: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.95rem',
        color: 'var(--text-primary)',
        flex: 1,
        minWidth: 0
    },
    memberDot: {
        color: 'var(--primary-color)',
        fontSize: '0.8rem',
        flexShrink: 0
    },
    inlineWinButton: {
        padding: '0.4rem 0.8rem',
        backgroundColor: 'var(--success-color)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ':hover': {
            backgroundColor: '#16a34a',
            transform: 'translateY(-1px)'
        },
        ':disabled': {
            opacity: 0.6,
            cursor: 'not-allowed'
        }
    },
    moveGroupSection: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center'
    },
    moveGroupSelect: {
        flex: 1,
        padding: '0.5rem',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-primary)',
        fontSize: '0.85rem',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease'
    },
    moveGroupButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#845ef7',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        ':hover': {
            backgroundColor: '#7048e8',
            transform: 'translateY(-1px)'
        },
        ':disabled': {
            opacity: 0.6,
            cursor: 'not-allowed'
        }
    },
    moveSelect: {
        padding: '0.35rem 0.5rem',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--card-bg)',
        color: 'var(--text-primary)',
        fontSize: '0.85rem',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease'
    },
    actionButtons: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-color)'
    },
    resetButton: {
        padding: '0.6rem 1rem',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#dc2626',
            transform: 'translateY(-1px)'
        }
    },
    drawButton: {
        padding: '0.6rem 1rem',
        backgroundColor: '#f59e0b',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#d97706',
            transform: 'translateY(-1px)'
        }
    },
    winnerButton: {
        padding: '0.6rem 1rem',
        backgroundColor: 'var(--success-color)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#16a34a',
            transform: 'translateY(-1px)'
        }
    },
    archivedRoundsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
    },
    archivedRoundCard: {
        backgroundColor: 'var(--secondary-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem'
    },
    archivedRoundTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '2px solid var(--border-color)'
    },
    archivedGroupsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem'
    },
    archivedGroupCard: {
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '1rem'
    },
    archivedGroupTitle: {
        fontSize: '1rem',
        fontWeight: '600',
        color: 'var(--primary-color)'
    },
    archivedMemberItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
    },
    emptyState: {
        textAlign: 'center',
        padding: '3rem 1rem',
        color: 'var(--text-secondary)',
        fontSize: '1rem'
    }
}