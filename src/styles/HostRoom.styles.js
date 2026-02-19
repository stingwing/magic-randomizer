export const styles = {
    container: {
        maxWidth: '1400px',
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
        margin: 0
    },
    hostInfo: {
        marginTop: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        flexWrap: 'wrap'
    },
    hostLabel: {
        color: 'var(--text-secondary)',
        fontWeight: '500'
    },
    hostId: {
        color: 'var(--accent-color)',
        fontWeight: '700',
        fontSize: 'clamp(1rem, 3vw, 1.1rem)',
        wordBreak: 'break-word'
    },
    codeBanner: {
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        borderRadius: '16px',
        padding: 'clamp(1rem, 3vw, 2rem)',
        marginBottom: '2rem',
        boxShadow: '0 8px 24px rgba(100, 108, 255, 0.3)'
    },
    codeContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'clamp(1rem, 3vw, 2rem)',
        flexWrap: 'wrap'
    },
    codeLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
        fontWeight: '500',
        marginBottom: '0.5rem'
    },
    code: {
        color: 'white',
        fontSize: 'clamp(1.75rem, 6vw, 3rem)',
        fontWeight: '700',
        letterSpacing: '0.15em',
        marginBottom: '0.5rem',
        wordBreak: 'break-all'
    },
    codeHint: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
    },
    codeActions: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
    },
    copyButton: {
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)',
        fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
        fontWeight: '600',
        background: 'white',
        color: '#646cff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        whiteSpace: 'nowrap'
    },
    settingsButton: {
        background: 'linear-gradient(135deg, #748ffc 0%, #5c7cfa 100%)',
        boxShadow: '0 4px 12px rgba(116, 143, 252, 0.3)'
    },
    roundManagerButton: {
        background: 'linear-gradient(135deg, #845ef7 0%, #7048e8 100%)',
        boxShadow: '0 4px 12px rgba(132, 94, 247, 0.3)'
    },
    qrToggleButton: {
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)',
        fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
        fontWeight: '600',
        background: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
        border: '2px solid white',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        whiteSpace: 'nowrap'
    },
    qrSection: {
        marginTop: '2rem',
        paddingTop: '2rem',
        borderTop: '2px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(1rem, 3vw, 2rem)',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    qrCodeWrapper: {
        background: 'white',
        padding: 'clamp(1rem, 3vw, 1.5rem)',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
    },
    qrInfo: {
        flex: '1 1 250px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    qrDescription: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        lineHeight: '1.6',
        margin: 0
    },
    copyUrlButton: {
        padding: 'clamp(0.75rem, 2vw, 0.875rem) clamp(1rem, 3vw, 1.5rem)',
        fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
        fontWeight: '600',
        background: 'white',
        color: '#646cff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        width: 'fit-content',
        whiteSpace: 'nowrap'
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
    controlPanel: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: 'clamp(1rem, 3vw, 2rem)',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    sectionTitle: {
        fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
        fontWeight: '600',
        margin: 0,
        marginBottom: '1.5rem',
        color: 'var(--text-primary)'
    },
    sectionTitleRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
    },
    buttonGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))',
        gap: '1rem'
    },
    actionButton: {
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
        color: 'white',
        whiteSpace: 'nowrap'
    },
    startButton: {
        background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
        boxShadow: '0 4px 12px rgba(81, 207, 102, 0.3)'
    },
    newRoundButton: {
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        boxShadow: '0 4px 12px rgba(100, 108, 255, 0.3)'
    },
    refreshButton: {
        background: 'linear-gradient(135deg, #ffd43b 0%, #fab005 100%)',
        color: '#333',
        boxShadow: '0 4px 12px rgba(255, 212, 59, 0.3)'
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        backgroundColor: '#64748b',
        color: '#cbd5e1',
        pointerEvents: 'none'
    },
    addPlayerSection: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: 'clamp(1rem, 3vw, 2rem)',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    addPlayerForm: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'flex-start'
    },
    inputWrapper: {
        flex: '1 1 250px',
        minWidth: 'min(250px, 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    playerInput: {
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
    inputError: {
        border: '1px solid #ff6b6b',
        background: 'rgba(255, 107, 107, 0.1)'
    },
    validationError: {
        color: '#ff6b6b',
        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)'
    },
    addButton: {
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)',
        fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
        fontWeight: '600',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap',
        alignSelf: 'flex-end'
    },
    participantsSection: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: 'clamp(1rem, 3vw, 2rem)',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    participantsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
        gap: '1rem',
        marginTop: '1rem'
    },
    participantCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'clamp(0.75rem, 2vw, 1rem)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        transition: 'all 0.2s ease',
        gap: '0.5rem'
    },
    participantName: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        fontWeight: '500',
        color: 'var(--text-primary)',
        wordBreak: 'break-word',
        flex: 1
    },
    participantDot: {
        color: 'var(--success-color)',
        fontSize: '0.8rem',
        flexShrink: 0
    },
    dropButton: {
        padding: '0.5rem 0.75rem',
        fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
        background: '#ff6b6b',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flexShrink: 0
    },
    roundsSection: {
        marginBottom: '2rem'
    },
    roundsContainer: {
        display: 'flex',
        gap: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '1rem',
        WebkitOverflowScrolling: 'touch',
        scrollSnapType: 'x mandatory'
    },
    roundCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: 'clamp(1rem, 3vw, 1.5rem)',
        minWidth: 'min(280px, 85vw)',
        flex: '0 0 min(320px, 90vw)',
        boxShadow: '0 4px 12px var(--shadow-color)',
        scrollSnapAlign: 'start'
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
        fontSize: 'clamp(1rem, 3vw, 1.2rem)',
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
        width: 'fit-content',
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
    groupContainer: {
        marginBottom: '1.5rem',
        padding: 'clamp(0.75rem, 2vw, 1rem)',
        background: 'var(--bg-secondary)',
        borderRadius: '10px',
        border: '1px solid var(--border-color)'
    },
    groupHeader: {
        marginBottom: '0.75rem'
    },
    groupNumber: {
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
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
        fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
        marginBottom: '0.25rem',
        gap: '0.5rem'
    },
    resultLabel: {
        color: 'var(--text-secondary)',
        fontWeight: '500'
    },
    resultValue: {
        color: 'var(--text-primary)',
        fontWeight: '600',
        wordBreak: 'break-word',
        textAlign: 'right'
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
        fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
        color: 'var(--text-primary)',
        wordBreak: 'break-word'
    },
    memberDot: {
        color: 'var(--success-color)',
        fontSize: '0.6rem',
        flexShrink: 0
    },
    emptyState: {
        padding: 'clamp(2rem, 5vw, 3rem) clamp(1rem, 3vw, 2rem)',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        border: '2px dashed var(--border-color)'
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
    },
    endGameButton: {
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        color: 'white',
    }
}