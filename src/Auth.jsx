import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { styles } from './styles/Auth.styles'

const API_BASE = import.meta.env.VITE_API_BASE?.replace('/api/Rooms', '') || 'https://localhost:7086'

export default function AuthPage() {
    const [mode, setMode] = useState('login') // 'login' or 'register'
    const [formData, setFormData] = useState({
        usernameOrEmail: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        displayName: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [validationErrors, setValidationErrors] = useState({})
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()

    const from = location.state?.from?.pathname || '/'

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const { [name]: _, ...rest } = prev
                return rest
            })
        }
    }

    const validateLoginForm = () => {
        const errors = {}
        
        if (!formData.usernameOrEmail.trim()) {
            errors.usernameOrEmail = 'Username or email is required'
        }
        
        if (!formData.password) {
            errors.password = 'Password is required'
        }
        
        return errors
    }

    const validateRegisterForm = () => {
        const errors = {}

        if (!formData.username.trim()) {
            errors.username = 'Username is required'
        } else if (formData.username.length < 3 || formData.username.length > 100) {
            errors.username = 'Username must be between 3 and 100 characters'
        } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
            errors.username = 'Username can only contain letters, numbers, underscores, and hyphens'
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required'
        } else if (!formData.email.includes('@')) {
            errors.email = 'Invalid email address'
        }

        if (!formData.password) {
            errors.password = 'Password is required'
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters'
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{}|;:,.<>])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{}|;:,.<>]{8,}$/.test(formData.password)) {
            errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Password confirmation is required'
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match'
        }

        if (formData.displayName && formData.displayName.length > 100) {
            errors.displayName = 'Display name must not exceed 100 characters'
        }

        return errors
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        
        const errors = validateLoginForm()
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            return
        }
        
        setLoading(true)
        setError(null)
        
        try {
            const response = await fetch(`${API_BASE}/api/Auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usernameOrEmail: formData.usernameOrEmail,
                    password: formData.password
                })
            })
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))

                // Handle new validation error format
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const fieldErrors = {}
                    errorData.errors.forEach(error => {
                        if (error.field && error.errors && error.errors.length > 0) {
                            // Map API field names to form field names
                            const fieldName = error.field.charAt(0).toLowerCase() + error.field.slice(1)
                            if (fieldName === 'usernameOrEmail') {
                                fieldErrors.usernameOrEmail = error.errors[0]
                            } else {
                                fieldErrors[fieldName] = error.errors[0]
                            }
                        }
                    })
                    setValidationErrors(fieldErrors)
                    throw new Error(errorData.message || 'Login failed')
                }

                throw new Error(errorData.message || 'Login failed')
            }
            
            const userData = await response.json()
            login(userData)
            navigate(from, { replace: true })
        } catch (err) {
            console.error('Login error:', err)
            setError(err.message || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()

        const errors = validateRegisterForm()
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE}/api/Auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    displayName: formData.displayName
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))

                // Handle new validation error format
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const fieldErrors = {}
                    errorData.errors.forEach(error => {
                        if (error.field && error.errors && error.errors.length > 0) {
                            // Map API field names to form field names
                            const fieldName = error.field.charAt(0).toLowerCase() + error.field.slice(1)
                            fieldErrors[fieldName] = error.errors[0]
                        }
                    })
                    setValidationErrors(fieldErrors)
                    throw new Error(errorData.message || 'Registration failed')
                }

                throw new Error(errorData.message || 'Registration failed')
            }

            const userData = await response.json()
            login(userData)
            navigate(from, { replace: true })
        } catch (err) {
            console.error('Registration error:', err)
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()

        if (!forgotPasswordEmail.trim() || !forgotPasswordEmail.includes('@')) {
            setError('Please enter a valid email address')
            return
        }

        setForgotPasswordLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_BASE}/api/Auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: forgotPasswordEmail
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Failed to send reset email')
            }

            await response.json()
            setForgotPasswordSuccess(true)
        } catch (err) {
            console.error('Forgot password error:', err)
            setError(err.message || 'Failed to send reset email. Please try again.')
        } finally {
            setForgotPasswordLoading(false)
        }
    }

    const closeForgotPasswordModal = () => {
        setShowForgotPassword(false)
        setForgotPasswordEmail('')
        setForgotPasswordSuccess(false)
        setError(null)
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p style={styles.subtitle}>
                    {mode === 'login' 
                        ? 'Sign in to track your game history' 
                        : 'Join to save your game history'}
                </p>

                <div style={styles.tabs}>
                    <button
                        type="button"
                        style={{
                            ...styles.tab,
                            ...(mode === 'login' ? styles.tabActive : {})
                        }}
                        onClick={() => {
                            setMode('login')
                            setError(null)
                            setValidationErrors({})
                        }}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        style={{
                            ...styles.tab,
                            ...(mode === 'register' ? styles.tabActive : {})
                        }}
                        onClick={() => {
                            setMode('register')
                            setError(null)
                            setValidationErrors({})
                        }}
                    >
                        Register
                    </button>
                </div>

                {error && (
                    <div style={styles.errorBanner}>
                        ⚠️ {error}
                    </div>
                )}

                {mode === 'login' ? (
                    <form style={styles.form} onSubmit={handleLogin}>
                        <div style={styles.formGroup}>
                            <label htmlFor="usernameOrEmail" style={styles.label}>
                                Username or Email
                            </label>
                            <input
                                id="usernameOrEmail"
                                name="usernameOrEmail"
                                type="text"
                                value={formData.usernameOrEmail}
                                onChange={handleInputChange}
                                style={{
                                    ...styles.input,
                                    ...(validationErrors.usernameOrEmail ? styles.inputError : {})
                                }}
                                autoComplete="username"
                            />
                            {validationErrors.usernameOrEmail && (
                                <span style={styles.errorMessage}>
                                    {validationErrors.usernameOrEmail}
                                </span>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="password" style={styles.label}>
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                style={{
                                    ...styles.input,
                                    ...(validationErrors.password ? styles.inputError : {})
                                }}
                                autoComplete="current-password"
                            />
                            {validationErrors.password && (
                                <span style={styles.errorMessage}>
                                    {validationErrors.password}
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.button,
                                ...(loading ? styles.buttonDisabled : {})
                            }}
                        >
                            {loading && <span style={styles.spinner}></span>}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary-color)',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                textAlign: 'center',
                                padding: '0.5rem'
                            }}
                        >
                            Forgot Password?
                        </button>
                    </form>
                ) : (
                    <form style={styles.form} onSubmit={handleRegister}>
                        <div style={styles.formGroup}>
                            <label htmlFor="username" style={styles.label}>
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleInputChange}
                                style={{
                                    ...styles.input,
                                    ...(validationErrors.username ? styles.inputError : {})
                                }}
                                autoComplete="username"
                            />
                            {validationErrors.username && (
                                <span style={styles.errorMessage}>
                                    {validationErrors.username}
                                </span>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="email" style={styles.label}>
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                style={{
                                    ...styles.input,
                                    ...(validationErrors.email ? styles.inputError : {})
                                }}
                                autoComplete="email"
                            />
                            {validationErrors.email && (
                                <span style={styles.errorMessage}>
                                    {validationErrors.email}
                                </span>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="displayName" style={styles.label}>
                                Display Name
                            </label>
                            <input
                                id="displayName"
                                name="displayName"
                                type="text"
                                value={formData.displayName}
                                onChange={handleInputChange}
                                style={{
                                    ...styles.input,
                                    ...(validationErrors.displayName ? styles.inputError : {})
                                }}
                                autoComplete="name"
                            />
                            {validationErrors.displayName && (
                                <span style={styles.errorMessage}>
                                    {validationErrors.displayName}
                                </span>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="registerPassword" style={styles.label}>
                                Password
                            </label>
                            <input
                                id="registerPassword"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                style={{
                                    ...styles.input,
                                    ...(validationErrors.password ? styles.inputError : {})
                                }}
                                autoComplete="new-password"
                            />
                            {validationErrors.password && (
                                <span style={styles.errorMessage}>
                                    {validationErrors.password}
                                </span>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="confirmPassword" style={styles.label}>
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                style={{
                                    ...styles.input,
                                    ...(validationErrors.confirmPassword ? styles.inputError : {})
                                }}
                                autoComplete="new-password"
                            />
                            {validationErrors.confirmPassword && (
                                <span style={styles.errorMessage}>
                                    {validationErrors.confirmPassword}
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.button,
                                ...(loading ? styles.buttonDisabled : {})
                            }}
                        >
                            {loading && <span style={styles.spinner}></span>}
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                )}
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div style={styles.modalOverlay} onClick={closeForgotPasswordModal}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Reset Password</h2>
                            <button
                                onClick={closeForgotPasswordModal}
                                style={styles.modalClose}
                            >
                                ×
                            </button>
                        </div>

                        {forgotPasswordSuccess ? (
                            <div style={styles.successBanner}>
                                ✅ If the email exists, a password reset link has been sent
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div style={styles.errorBanner}>
                                        ⚠️ {error}
                                    </div>
                                )}

                                <p style={styles.modalSubtitle}>
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>

                                <form style={styles.form} onSubmit={handleForgotPassword}>
                                    <div style={styles.formGroup}>
                                        <label htmlFor="forgotPasswordEmail" style={styles.label}>
                                            Email
                                        </label>
                                        <input
                                            id="forgotPasswordEmail"
                                            name="forgotPasswordEmail"
                                            type="email"
                                            value={forgotPasswordEmail}
                                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                            style={styles.input}
                                            autoComplete="email"
                                            autoFocus
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={forgotPasswordLoading}
                                        style={{
                                            ...styles.button,
                                            ...(forgotPasswordLoading ? styles.buttonDisabled : {})
                                        }}
                                    >
                                        {forgotPasswordLoading && <span style={styles.spinner}></span>}
                                        {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
