export const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px'
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px'
    },
    title: {
        fontSize: '2em',
        color: 'var(--text-primary)',
        marginBottom: '8px',
        fontWeight: '600'
    },
    subtitle: {
        fontSize: '1em',
        color: 'var(--text-secondary)',
        margin: '0'
    },
    tabContainer: {
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        borderBottom: '2px solid var(--border-color)',
        paddingBottom: '0'
    },
    tabButton: {
        padding: '12px 24px',
        backgroundColor: 'transparent',
        color: 'var(--text-secondary)',
        border: 'none',
        borderBottom: '3px solid transparent',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        position: 'relative',
        bottom: '-2px'
    },
    tabButtonActive: {
        color: 'var(--primary-color)',
        borderBottomColor: 'var(--primary-color)',
        fontWeight: '600'
    },
    contentContainer: {
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    tableContainer: {
        overflowX: 'auto',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.95em'
    },
    th: {
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '12px',
        textAlign: 'left',
        fontWeight: '600',
        borderBottom: '2px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 1
    },
    td: {
        padding: '12px',
        color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border-color)'
    },
    tdCenter: {
        padding: '12px',
        color: 'var(--text-primary)',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center'
    },
    trEven: {
        backgroundColor: 'var(--bg-secondary)'
    },
    trOdd: {
        backgroundColor: 'var(--bg-primary)'
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--text-secondary)',
        fontSize: '1.1em'
    },
    filterContainer: {
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
    },
    filterLabel: {
        display: 'block',
        marginBottom: '8px',
        color: 'var(--text-primary)',
        fontWeight: '500'
    },
    filterCheckboxContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '8px',
        maxHeight: '200px',
        overflowY: 'auto',
        padding: '8px',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        backgroundColor: 'var(--bg-secondary)'
    },
    filterCheckboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        transition: 'background-color 0.2s'
    },
    filterCheckbox: {
        cursor: 'pointer'
    },
    summaryCards: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    },
    summaryCard: {
        backgroundColor: 'var(--bg-primary)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        textAlign: 'center'
    },
    summaryCardTitle: {
        fontSize: '0.85em',
        color: 'var(--text-secondary)',
        marginBottom: '8px',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    summaryCardValue: {
        fontSize: '2em',
        color: 'var(--primary-color)',
        fontWeight: '700'
    },
    exportButton: {
        padding: '10px 20px',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.95em',
        fontWeight: '500',
        marginBottom: '16px',
        transition: 'all 0.2s'
    }
}
