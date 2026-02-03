export const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: 'clamp(1rem, 3vw, 2rem) 1rem'
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem'
    },
    title: {
        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
        fontWeight: '700',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    },
    codeDisplay: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'clamp(0.5rem, 2vw, 0.75rem)',
        padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px var(--shadow-color)',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    codeLabel: {
        fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
        color: 'var(--text-secondary)',
        fontWeight: '500'
    },
    code: {
        fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
        fontWeight: '700',
        color: 'var(--accent-color)',
        letterSpacing: '0.1em',
        wordBreak: 'break-all'
    },
    errorBanner: {
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem)',
        borderRadius: '12px',
        background: 'var(--error-bg)',
        border: '1px solid var(--error-border)',
        color: 'var(--error-text)',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        animation: 'slideIn 0.3s ease',
        flexWrap: 'wrap'
    },
    errorIcon: {
        fontSize: 'clamp(1rem, 3vw, 1.25rem)',
        flexShrink: 0
    },
    waitingCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: 'clamp(2rem, 5vw, 3rem) clamp(1rem, 3vw, 2rem)',
        textAlign: 'center',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    waitingIcon: {
        fontSize: 'clamp(3rem, 8vw, 4rem)',
        marginBottom: '1rem',
        animation: 'pulse 2s ease-in-out infinite'
    },
    waitingTitle: {
        fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: 'var(--text-primary)'
    },
    waitingText: {
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        color: 'var(--text-secondary)',
        marginBottom: '1.5rem',
        lineHeight: '1.6'
    },
    loadingIndicator: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
        color: 'var(--text-secondary)',
        flexWrap: 'wrap'
    },
    participantsCard: {
        marginTop: '2rem',
        padding: 'clamp(1rem, 3vw, 1.5rem)',
        background: 'var(--bg-secondary)',
        borderRadius: '12px'
    },
    participantsTitle: {
        fontSize: 'clamp(1rem, 3vw, 1.1rem)',
        fontWeight: '600',
        marginBottom: '1rem',
        color: 'var(--text-primary)'
    },
    participantsList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(150px, 100%), 1fr))',
        gap: '0.5rem'
    },
    participantItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        color: 'var(--text-primary)',
        wordBreak: 'break-word'
    },
    participantDot: {
        color: 'var(--success-color)',
        fontSize: '0.6rem',
        flexShrink: 0
    },
    lastUpdated: {
        marginTop: '1rem',
        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
        color: 'var(--text-tertiary)',
        textAlign: 'center'
    },
    startedContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    loadingText: {
        textAlign: 'center',
        padding: 'clamp(1.5rem, 4vw, 2rem)',
        fontSize: 'clamp(1rem, 3vw, 1.1rem)',
        color: 'var(--text-secondary)'
    },
    noResults: {
        textAlign: 'center',
        padding: 'clamp(1.5rem, 4vw, 2rem)',
        background: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
    },
    resultsCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: 'clamp(1rem, 3vw, 2rem)',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    resultsHeader: {
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
    },
    resultsTitle: {
        fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
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
        maxWidth: '100%'
    },
    timerIcon: {
        fontSize: 'clamp(1rem, 3vw, 1.2rem)',
        flexShrink: 0
    },
    timerContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.1rem'
    },
    timerLabel: {
        fontSize: 'clamp(0.65rem, 2vw, 0.7rem)',
        color: 'var(--text-secondary)',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    timerValue: {
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        fontWeight: '700',
        color: 'var(--accent-color)',
        fontFamily: 'monospace'
    },
    resultDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1.5rem'
    },
    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'clamp(0.5rem, 2vw, 0.75rem)',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        gap: '0.5rem',
        flexWrap: 'wrap'
    },
    detailLabel: {
        fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
        fontWeight: '500',
        color: 'var(--text-secondary)'
    },
    detailValue: {
        fontSize: 'clamp(0.95rem, 2.5vw, 1rem)',
        fontWeight: '600',
        color: 'var(--text-primary)',
        wordBreak: 'break-word',
        textAlign: 'right'
    },
    membersSection: {
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '2px solid var(--border-color)'
    },
    membersTitle: {
        fontSize: 'clamp(1rem, 3vw, 1.1rem)',
        fontWeight: '600',
        marginBottom: '1rem',
        color: 'var(--text-primary)'
    },
    membersList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    memberItem: {
        padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        color: 'var(--text-primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.5rem',
        wordBreak: 'break-word'
    },
    memberItemYou: {
        background: 'linear-gradient(135deg, rgba(100, 108, 255, 0.1) 0%, rgba(83, 91, 242, 0.1) 100%)',
        border: '1px solid var(--accent-color)',
        fontWeight: '600'
    },
    youBadge: {
        padding: '0.25rem 0.5rem',
        background: 'var(--accent-color)',
        color: 'white',
        borderRadius: '4px',
        fontSize: 'clamp(0.7rem, 2vw, 0.75rem)',
        fontWeight: '700',
        flexShrink: 0
    },
    statisticsCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: 'clamp(1rem, 3vw, 2rem)',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    statisticsTitle: {
        fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: 'var(--text-primary)'
    },
    statisticsDescription: {
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        color: 'var(--text-secondary)',
        marginBottom: '1.5rem',
        lineHeight: '1.6'
    },
    inputGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))',
        gap: '1rem'
    },
    inputLabel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
        fontWeight: '500',
        color: 'var(--text-primary)'
    },
    textInput: {
        padding: 'clamp(0.5rem, 2vw, 0.75rem)',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        background: 'var(--input-bg)',
        color: 'var(--text-primary)',
        transition: 'all 0.2s ease',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box'
    },
    inputError: {
        border: '1px solid #ff6b6b',
        background: 'rgba(255, 107, 107, 0.1)'
    },
    validationError: {
        color: '#ff6b6b',
        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
        marginTop: '0.25rem'
    },
    reportCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: 'clamp(1rem, 3vw, 2rem)',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    reportTitle: {
        fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: 'var(--text-primary)'
    },
    reportDescription: {
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        color: 'var(--text-secondary)',
        marginBottom: '1.5rem',
        lineHeight: '1.6'
    },
    reportButtons: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(110px, 100%), 1fr))',
        gap: '1rem'
    },
    reportButton: {
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 2vw, 1.5rem)',
        fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
        fontWeight: '600',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        boxShadow: '0 2px 8px var(--shadow-color)',
        whiteSpace: 'nowrap'
    },
    winButton: {
        background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
        color: 'white'
    },
    drawButton: {
        background: 'linear-gradient(135deg, #ffd43b 0%, #fab005 100%)',
        color: '#333'
    },
    dropButton: {
        background: 'linear-gradient(135deg, #ff6b6b 0%, #fa5252 100%)',
        color: 'white'
    },
    updateButton: {
        background: 'linear-gradient(135deg, #748ffc 0%, #5c7cfa 100%)',
        color: 'white'
    },
    successMessage: {
        marginTop: '1rem',
        padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
        background: 'var(--success-bg)',
        border: '1px solid var(--success-border)',
        borderRadius: '8px',
        color: 'var(--success-text)',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap'
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