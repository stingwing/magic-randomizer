export default function LoadingState({ title = "Validating Access...", message = "Verifying host credentials..." }) {
    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>{title}</h1>
            </div>
            <div style={loadingContainerStyle}>
                <span style={spinnerStyle}></span>
                <span style={messageStyle}>{message}</span>
            </div>
        </div>
    )
}

const containerStyle = {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto'
}

const headerStyle = {
    marginBottom: '2rem'
}

const titleStyle = {
    fontSize: '2rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0
}

const loadingContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    fontSize: '1.2rem',
    color: 'var(--text-secondary)',
    gap: '1rem'
}

const spinnerStyle = {
    width: '24px',
    height: '24px',
    border: '3px solid var(--border-color)',
    borderTop: '3px solid var(--primary-color)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
}

const messageStyle = {
    fontSize: '1.1rem'
}