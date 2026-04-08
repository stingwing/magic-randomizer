import { useNavigate, useLocation } from 'react-router-dom'
import LoginModal from './components/LoginModal'
import { styles } from './styles/Auth.styles'

export default function AuthPage() {
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from?.pathname || '/'

    const handleLoginSuccess = () => {
        // Navigate to the originally requested page or home
        navigate(from, { replace: true })
    }

    const handleClose = () => {
        // If user closes the modal, navigate to home
        navigate('/', { replace: true })
    }

    return (
        <div style={styles.container}>
            <LoginModal
                onClose={handleClose}
                onSuccess={handleLoginSuccess}
            />
        </div>
    )
}
