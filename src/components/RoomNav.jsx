import { useNavigate } from 'react-router-dom'
import { styles } from '../styles/RoomNav.styles'

export default function RoomNav({ roomCode, participantId, currentPage = 'room', allowCustomGroups = true }) {
    const navigate = useNavigate()

    const navigateTo = (page) => {
        const basePath = `/room/${encodeURIComponent(roomCode)}/${encodeURIComponent(participantId)}`
        
        switch (page) {
            case 'room':
                navigate(basePath)
                break
            case 'statistics':
                navigate(`${basePath}/statistics`)
                break
            case 'custom-groups':
                // Allow navigation regardless of custom groups setting
                navigate(`${basePath}/custom-groups`)
                break
            case 'view':
                navigate(`/view/${encodeURIComponent(roomCode)}/mobile/${encodeURIComponent(participantId)}`)
                break
            case 'home':
                if (window.confirm('Are you sure you want to leave this room?')) {
                    sessionStorage.removeItem('currentRoomCode')
                    sessionStorage.removeItem('currentParticipantId')
                    navigate('/')
                }
                break
            default:
                break
        }
    }

    return (
        <nav style={styles.nav}>
            <button
                onClick={() => navigateTo('room')}
                style={{
                    ...styles.navButton,
                    ...(currentPage === 'room' ? styles.navButtonActive : {})
                }}
                title="Game Room"
            >
                <span style={styles.navLabel}>Room</span>
            </button>
            
            <button
                onClick={() => navigateTo('statistics')}
                style={{
                    ...styles.navButton,
                    ...(currentPage === 'statistics' ? styles.navButtonActive : {})
                }}
                title="Update Statistics"
            >
                <span style={styles.navLabel}>Report</span>
            </button>

            <button
                onClick={() => navigateTo('view')}
                style={{
                    ...styles.navButton,
                    ...(currentPage === 'view' ? styles.navButtonActive : {})
                }}
                title="View All Groups"
            >
                <span style={styles.navLabel}>History</span>
            </button>
            
            <button
                onClick={() => navigateTo('custom-groups')}
                style={{
                    ...styles.navButton,
                    ...(currentPage === 'custom-groups' ? styles.navButtonActive : {})
                }}
                title="Manage Custom Groups"
            >
                <span style={styles.navLabel}>Custom</span>
            </button>
            
            <button
                onClick={() => navigateTo('home')}
                style={styles.navButton}
                title="Leave Room"
            >
                <span style={styles.navLabel}>Exit</span>
            </button>
        </nav>
    )
}