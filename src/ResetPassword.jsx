import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE?.replace('/api/Rooms', '') || 'https://localhost:7086'

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmNewPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [validationErrors, setValidationErrors] = useState({})
    const navigate = useNavigate()

    const token = searchParams.get('token')

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const { [name]: _, ...rest } = prev
                return rest
            })
        }
    }

    const validateForm = () => {
        const errors = {}
        
        if (!formData.newPassword || formData.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters'
        }
        
        if (formData.newPassword !== formData.confirmNewPassword) {
            errors.confirmNewPassword = 'Passwords do not match'
        }
        
        return errors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!token) {
            setError('Invalid reset link')
            return
        }

        const errors = validateForm()
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            return
        }
        
        setLoading(true)
        setError(null)
        
        try {
            const response = await fetch(`${API_BASE}/api/Auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: formData.newPassword,
                    confirmNewPassword: formData.confirmNewPassword
                })
            })
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Password reset failed')
            }

            await response.json()
            setSuccess(true)
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/auth', { replace: true })
            }, 2000)
        } catch (err) {
            console.error('Password reset error:', err)
            setError(err.message || 'Failed to reset password. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const styles = {
        container: {
            minHeight: 'calc(100vh - 60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: '#f7fafc'
        },
        card: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '2.5rem',
            maxWidth: '450px',
            width: '100%'
        },
        title: {
            fontSize: '1.875rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            color: '#1a202c',
            textAlign: 'center'
        },
        subtitle: {
            fontSize: '0.9375rem',
            color: '#718096',
            marginBottom: '2rem',
            textAlign: 'center'
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        },
        label: {
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#2d3748'
        },
        input: {
            padding: '0.75rem',
            fontSize: '1rem',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            transition: 'border-color 0.2s ease',
            outline: 'none'
        },
        inputError: {
            borderColor: '#fc8181'
        },
        errorMessage: {
            fontSize: '0.875rem',
            color: '#e53e3e'
        },
        errorBanner: {
            backgroundColor: '#fff5f5',
            color: '#c53030',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            border: '1px solid #feb2b2'
        },
        successBanner: {
            backgroundColor: '#f0fff4',
            color: '#22543d',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '1rem',
            border: '1px solid #9ae6b4'
        },
        button: {
            padding: '0.875rem',
            fontSize: '1rem',
            fontWeight: '600',
            backgroundColor: 'var(--primary-color)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
        },
        buttonDisabled: {
            opacity: 0.6,
            cursor: 'not-allowed'
        },
        spinner: {
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid #fff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
        }
    }

    if (!token) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h1 style={styles.title}>Invalid Reset Link</h1>
                    <p style={styles.subtitle}>This password reset link is invalid or expired.</p>
                    <button
                        onClick={() => navigate('/auth')}
                        style={styles.button}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <div style={styles.card}>
                <h1 style={styles.title}>Reset Password</h1>
                <p style={styles.subtitle}>Enter your new password below</p>

                {success ? (
                    <div style={styles.successBanner}>
                        ✅ Password reset successfully! Redirecting to login...
                    </div>
                ) : (
                    <>
                        {error && (
                            <div style={styles.errorBanner}>
                                ⚠️ {error}
                            </div>
                        )}

                        <form style={styles.form} onSubmit={handleSubmit}>
                            <div style={styles.formGroup}>
                                <label htmlFor="newPassword" style={styles.label}>
                                    New Password
                                </label>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    style={{
                                        ...styles.input,
                                        ...(validationErrors.newPassword ? styles.inputError : {})
                                    }}
                                    autoComplete="new-password"
                                />
                                {validationErrors.newPassword && (
                                    <span style={styles.errorMessage}>
                                        {validationErrors.newPassword}
                                    </span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label htmlFor="confirmNewPassword" style={styles.label}>
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmNewPassword"
                                    name="confirmNewPassword"
                                    type="password"
                                    value={formData.confirmNewPassword}
                                    onChange={handleInputChange}
                                    style={{
                                        ...styles.input,
                                        ...(validationErrors.confirmNewPassword ? styles.inputError : {})
                                    }}
                                    autoComplete="new-password"
                                />
                                {validationErrors.confirmNewPassword && (
                                    <span style={styles.errorMessage}>
                                        {validationErrors.confirmNewPassword}
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
                                onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '0.9')}
                                onMouseLeave={(e) => !loading && (e.currentTarget.style.opacity = '1')}
                            >
                                {loading && <span style={styles.spinner}></span>}
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
