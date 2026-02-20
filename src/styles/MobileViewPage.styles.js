export const styles = {
    container: {
        minHeight: '100vh',
        paddingBottom: '2rem',
        width: '100%',
        maxWidth: '100%',
        margin: 0,
        boxSizing: 'border-box'
    },
    
    header: {
        padding: '3rem',
        borderBottom: '1px solid var(--border-color)',
        width: '100%',
        boxSizing: 'border-box'
    },
    
    title: {
        margin: 0,
        fontSize: '1.5rem',
        fontWeight: '700',
        color: 'var(--text-primary)',
        marginBottom: '0.5rem'
    },
    
    codeDisplay: {
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        marginTop: '0.5rem'
    },
    
    code: {
        fontWeight: '700',
        color: 'var(--primary-color)',
        fontFamily: 'monospace',
        fontSize: '1rem'
    },
    
    roundDisplay: {
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        marginTop: '0.25rem'
    },
    
    roundNumber: {
        fontWeight: '700',
        color: 'var(--text-primary)'
    },
    
    loading: {
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem'
    },
    
    error: {
        margin: '1rem',
        padding: '1rem',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        borderRadius: '8px',
        color: '#ef4444',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem'
    },
    
    noData: {
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem'
    },
    
    roundTabs: {
        backgroundColor: 'var(--card-bg)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.75rem',
        position: 'sticky',
        top: '60px',
        zIndex: 10,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        width: '100%',
        boxSizing: 'border-box'
    },
    
    tabsContainer: {
        display: 'flex',
        gap: '0.5rem',
        minWidth: 'min-content'
    },
    
    tab: {
        padding: '0.625rem 1rem',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-color)',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        outline: 'none'
    },
    
    tabActive: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        borderColor: 'var(--primary-color)'
    },
    
    content: {
        padding: '1rem',
        width: '100%',
        boxSizing: 'border-box'
    },
    
    noGroups: {
        textAlign: 'center',
        padding: '3rem 1rem',
        color: 'var(--text-secondary)'
    },
    
    noGroupsIcon: {
        fontSize: '3rem',
        marginBottom: '1rem'
    },
    
    noGroupsSubtext: {
        fontSize: '0.875rem',
        marginTop: '0.5rem',
        opacity: 0.7
    },
    
    groupCard: {
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-color)',
        width: '100%',
        boxSizing: 'border-box'
    },
    
    groupHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
    },
    
    groupTitle: {
        margin: 0,
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--text-primary)'
    },
    
    timer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: '600'
    },
    
    timerIcon: {
        fontSize: '1rem'
    },
    
    timerValue: {
        fontFamily: 'monospace',
        fontSize: '0.875rem'
    },
    
    resultBadge: {
        marginBottom: '1rem',
        padding: '0.75rem',
        borderRadius: '8px',
        backgroundColor: 'rgba(134, 239, 172, 0.1)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'rgba(134, 239, 172, 0.3)',
        fontSize: '0.875rem'
    },
    
    resultWinner: {
        color: '#86efac',
        fontWeight: '600'
    },
    
    resultDraw: {
        color: '#fbbf24',
        fontWeight: '600'
    },
    
    resultComplete: {
        color: '#86efac',
        fontWeight: '600'
    },
    
    membersList: {
        listStyle: 'none',
        padding: 0,
        margin: 0
    },
    
    memberItem: {
        padding: '0.75rem',
        borderRadius: '8px',
        marginBottom: '0.5rem',
        backgroundColor: 'var(--bg-primary)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--border-color)',
        transition: 'all 0.2s ease'
    },
    
    memberItemYou: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 0.3)'
    },
    
    memberItemDropped: {
        opacity: 0.5
    },
    
    memberInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap'
    },
    
    memberName: {
        fontWeight: '500',
        color: 'var(--text-primary)',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap'
    },
    
    memberPoints: {
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        fontWeight: '600'
    },
    
    memberCommander: {
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        marginTop: '0.25rem',
        fontStyle: 'italic'
    },
    
    badge: {
        fontSize: '0.625rem',
        fontWeight: '700',
        padding: '0.125rem 0.375rem',
        borderRadius: '4px',
        backgroundColor: '#3b82f6',
        color: 'white',
        textTransform: 'uppercase',
        letterSpacing: '0.025em'
    }
}