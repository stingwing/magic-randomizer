import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE?.replace('/api/Rooms', '') || 'https://localhost:7086'

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('')
    const navigate = useNavigate()
    const { updateUser, user } = useAuth()

    useEffect(() => {
        const token = searchParams.get('token')
        
        if (!token) {
            setStatus('error')
            setMessage('Invalid verification link')
            return
        }

        verifyEmail(token)
    }, [searchParams])

    const verifyEmail = async (token) => {
        try {
            const response = await fetch(`${API_BASE}/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
                method: 'GET'
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Email verification failed')
            }

            const data = await response.json()
            setStatus('success')
            setMessage(data.message || 'Email verified successfully!')

            // Update user's email verification status if they're logged in
            if (user) {
                updateUser({ ...user, emailVerified: true })
            }

            // Redirect to profile after 2 seconds
            setTimeout(() => {
                navigate('/profile', { replace: true })
            }, 2000)
        } catch (err) {
            console.error('Verification error:', err)
            setStatus('error')
            setMessage(err.message || 'Failed to verify email')
        }
    }

    const styles = {
        container: {
            minHeight: 'calc(100vh - 60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        },
        card: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '3rem',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center'
        },
        icon: {
            fontSize: '4rem',
            marginBottom: '1rem'
        },
        title: {
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: '#1a202c'
        },
        message: {
            fontSize: '1.125rem',
            color: '#4a5568',
            marginBottom: '2rem'
        },
        spinner: {
            display: 'inline-block',
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
        },
        button: {
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            backgroundColor: 'var(--primary-color)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease'
        }
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
                {status === 'verifying' && (
                    <>
                        <div style={styles.spinner}></div>
                        <h1 style={styles.title}>Verifying Email</h1>
                        <p style={styles.message}>Please wait while we verify your email address...</p>
                    </>
                )}
                
                {status === 'success' && (
                    <>
                        <div style={styles.icon}>✅</div>
                        <h1 style={styles.title}>Email Verified!</h1>
                        <p style={styles.message}>{message}</p>
                        <p style={{ color: '#718096' }}>Redirecting to your profile...</p>
                    </>
                )}
                
                {status === 'error' && (
                    <>
                        <div style={styles.icon}>❌</div>
                        <h1 style={styles.title}>Verification Failed</h1>
                        <p style={styles.message}>{message}</p>
                        <button
                            onClick={() => navigate('/profile')}
                            style={styles.button}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Go to Profile
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
