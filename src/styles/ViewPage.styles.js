export const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1rem'
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0
    },
    subtitle: {
        fontSize: '1.1rem',
        color: 'var(--text-secondary)',
        marginTop: '0.5rem'
    },
    searchCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    searchContent: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'flex-end'
    },
    label: {
        flex: '1 1 300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: '500',
        color: 'var(--text-primary)'
    },
    input: {
        padding: '1rem',
        fontSize: '1rem',
        borderRadius: '10px',
        border: '1px solid var(--input-border)',
        background: 'var(--input-bg)',
        color: 'var(--text-primary)',
        transition: 'all 0.2s ease',
        outline: 'none'
    },
    inputError: {
        border: '1px solid #ff6b6b',
        background: 'rgba(255, 107, 107, 0.1)'
    },
    validationError: {
        color: '#ff6b6b',
        fontSize: '0.85rem'
    },
    viewButton: {
        padding: '1rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 4px 12px rgba(100, 108, 255, 0.3)',
        transition: 'all 0.3s ease'
    },
    buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed'
    },
    infoCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    infoTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        marginTop: 0,
        marginBottom: '1rem',
        color: 'var(--text-primary)'
    },
    infoText: {
        fontSize: '1rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        marginBottom: '1rem'
    },
    infoList: {
        margin: 0,
        paddingLeft: '1.5rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.8'
    },
    codeBanner: {
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 24px rgba(100, 108, 255, 0.3)'
    },
    codeContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap'
    },
    codeLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '0.9rem',
        fontWeight: '500',
        marginBottom: '0.5rem'
    },
    code: {
        color: 'white',
        fontSize: '3rem',
        fontWeight: '700',
        letterSpacing: '0.15em',
        marginBottom: '0.5rem'
    },
    codeHint: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '0.9rem'
    },
    changeButton: {
        padding: '1rem 2rem',
        fontSize: '1rem',
        fontWeight: '600',
        background: 'white',
        color: '#646cff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    },
    errorMessage: {
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        background: 'var(--error-bg)',
        border: '1px solid var(--error-border)',
        color: 'var(--error-text)',
        marginTop: '1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        animation: 'slideIn 0.3s ease'
    },
    participantsSection: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    sectionTitle: {
        fontSize: '1.3rem',
        fontWeight: '600',
        margin: 0,
        color: 'var(--text-primary)'
    },
    participantsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem'
    },
    participantCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px'
    },
    participantName: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '1rem',
        fontWeight: '500',
        color: 'var(--text-primary)'
    },
    participantDot: {
        color: 'var(--success-color)',
        fontSize: '0.8rem'
    },
    roundsSection: {
        marginBottom: '2rem'
    },
    roundsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
    },
    headerActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
    },
    refreshButton: {
        padding: '0.75rem 1.5rem',
        fontSize: '0.9rem',
        fontWeight: '600',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #ffd43b 0%, #fab005 100%)',
        color: '#333',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 4px 12px rgba(255, 212, 59, 0.3)',
        transition: 'all 0.3s ease'
    },
    roundsContainer: {
        display: 'flex',
        gap: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '1rem'
    },
    roundCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.5rem',
        minWidth: '320px',
        flex: '0 0 320px',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    roundHeader: {
        marginBottom: '1.5rem',
        paddingBottom: '0.75rem',
        borderBottom: '2px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
    },
    roundTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        margin: 0,
        color: 'var(--text-primary)'
    },
    timerDisplay: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: 'linear-gradient(135deg, rgba(100, 108, 255, 0.1) 0%, rgba(83, 91, 242, 0.1) 100%)',
        border: '1px solid var(--accent-color)',
        borderRadius: '8px',
        width: 'fit-content'
    },
    timerIcon: {
        fontSize: '1.2rem'
    },
    timerContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.1rem'
    },
    timerLabel: {
        fontSize: '0.7rem',
        color: 'var(--text-secondary)',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    timerValue: {
        fontSize: '1rem',
        fontWeight: '700',
        color: 'var(--accent-color)',
        fontFamily: 'monospace'
    },
    groupContainer: {
        marginBottom: '1.5rem',
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: '10px',
        border: '1px solid var(--border-color)'
    },
    groupHeader: {
        marginBottom: '0.75rem'
    },
    groupNumber: {
        fontSize: '1rem',
        fontWeight: '600',
        color: 'var(--accent-color)'
    },
    groupResults: {
        marginBottom: '0.75rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid var(--border-color)'
    },
    resultItem: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.9rem',
        marginBottom: '0.25rem'
    },
    resultLabel: {
        color: 'var(--text-secondary)',
        fontWeight: '500'
    },
    resultValue: {
        color: 'var(--text-primary)',
        fontWeight: '600'
    },
    membersList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    memberItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.9rem',
        color: 'var(--text-primary)'
    },
    memberDot: {
        color: 'var(--success-color)',
        fontSize: '0.6rem'
    },
    statisticsSection: {
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-color)'
    },
    statisticsHeader: {
        fontSize: '0.95rem',
        fontWeight: '600',
        marginTop: 0,
        marginBottom: '0.75rem',
        color: 'var(--text-primary)'
    },
    statisticsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    statisticItem: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        padding: '0.5rem',
        background: 'var(--card-bg)',
        borderRadius: '6px'
    },
    statisticLabel: {
        color: 'var(--text-secondary)',
        fontWeight: '500'
    },
    statisticValue: {
        color: 'var(--text-primary)',
        fontWeight: '600'
    },
    emptyState: {
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '2px dashed var(--border-color)'
    },
    loadingState: {
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
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