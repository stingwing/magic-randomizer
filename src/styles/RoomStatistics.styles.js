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
        maxWidth: '600px',
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
    card: {
        backgroundColor: 'var(--card-bg)',
        borderRadius: '12px',
        padding: 'clamp(1rem, 3vw, 1.5rem)',
        marginBottom: '1rem',
        border: '1px solid var(--border-color)',
        width: '100%',
        boxSizing: 'border-box'
    },
    cardTitle: {
        margin: '0 0 0.5rem 0',
        fontSize: 'clamp(1.1rem, 3vw, 1.25rem)',
        fontWeight: '600',
        color: 'var(--primary-color)'
    },
    cardDescription: {
        margin: '0 0 1rem 0',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
        color: 'var(--text-secondary)'
    },
    inputLabel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1rem',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
        fontWeight: '500',
        color: 'var(--text-primary)'
    },
    textInput: {
        padding: 'clamp(0.75rem, 2vw, 1rem)',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        color: 'var(--text-primary)',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        outline: 'none',
        transition: 'border-color 0.2s',
        width: '100%',
        minHeight: '44px',
        boxSizing: 'border-box'
    },
    inputError: {
        borderColor: 'var(--error-border)'
    },
    validationError: {
        color: 'var(--error-text)',
        fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
        marginTop: '0.25rem'
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        marginTop: '4px',
        maxHeight: '200px',
        overflowY: 'auto',
        zIndex: 1000,
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    dropdownItem: {
        padding: 'clamp(10px, 2vw, 12px)',
        cursor: 'pointer',
        color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border-color)',
        transition: 'background-color 0.2s',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
        minHeight: '44px',
        display: 'flex',
        alignItems: 'center'
    },
    saveButton: {
        width: '100%',
        padding: 'clamp(0.875rem, 2vw, 1rem)',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        minHeight: '48px',
        outline: 'none'
    },
    saveButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    errorBanner: {
        backgroundColor: 'var(--error-bg)',
        color: 'var(--error-text)',
        padding: 'clamp(0.75rem, 2vw, 1rem)',
        margin: 'clamp(0.75rem, 2vw, 1rem)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: '1px solid var(--error-border)',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
    },
    successBanner: {
        backgroundColor: 'var(--success-bg)',
        color: 'var(--success-text)',
        padding: 'clamp(0.75rem, 2vw, 1rem)',
        margin: 'clamp(0.75rem, 2vw, 1rem)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: '1px solid var(--success-border)',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
    },
    // Player order styles
    playerOrderContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginTop: '0.5rem'
    },
    playerOrderEmpty: {
        padding: '1rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)'
    },
    playerOrderItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: 'clamp(0.75rem, 2vw, 1rem)',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        transition: 'all 0.2s',
        cursor: 'move',
        minHeight: '56px',
        touchAction: 'none'
    },
    playerOrderItemDragging: {
        opacity: 0.5,
        transform: 'scale(0.98)'
    },
    playerOrderItemYou: {
        borderColor: 'var(--accent-color)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
    },
    playerOrderDragHandle: {
        color: 'var(--text-secondary)',
        fontSize: 'clamp(1rem, 3vw, 1.2rem)',
        cursor: 'grab',
        userSelect: 'none',
        padding: '0.5rem',
        touchAction: 'none'
    },
    playerOrderInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flex: 1,
        minWidth: 0
    },
    playerOrderNumber: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        minWidth: '28px',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '50%',
        fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)',
        fontWeight: '600',
        color: 'var(--primary-color)',
        flexShrink: 0
    },
    playerOrderName: {
        fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
        fontWeight: '500',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    playerOrderButtons: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        flexShrink: 0
    },
    orderButton: {
        padding: 'clamp(0.25rem, 1vw, 0.4rem) clamp(0.5rem, 2vw, 0.75rem)',
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
        transition: 'background-color 0.2s',
        minHeight: '32px',
        minWidth: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        outline: 'none'
    },
    orderButtonDisabled: {
        opacity: 0.3,
        cursor: 'not-allowed'
    },
    youBadge: {
        display: 'inline-block',
        marginLeft: '0.5rem',
        padding: '0.15rem 0.5rem',
        backgroundColor: 'var(--accent-color)',
        color: 'white',
        borderRadius: '4px',
        fontSize: 'clamp(0.65rem, 2vw, 0.7rem)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        flexShrink: 0
    }
}