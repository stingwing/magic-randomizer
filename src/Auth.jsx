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
        
        if (!formData.username.trim() || formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters'
        }
        
        if (!formData.email.trim() || !formData.email.includes('@')) {
            errors.email = 'Valid email is required'
        }
        
        if (!formData.password || formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters'
        }
        
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match'
        }
        
        if (!formData.displayName.trim()) {
            errors.displayName = 'Display name is required'
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
        </div>
    )
}
