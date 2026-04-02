import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiBase } from './api'
import GameStatistics from './components/GameStatistics'
import { styles as viewPageStyles } from './styles/ViewPage.styles'

export default function MultiGameStatistics() {
    const location = useLocation()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [combinedData, setCombinedData] = useState({
        archivedRounds: [],
        currentRound: null
    })
    const [roomCodes, setRoomCodes] = useState([])

    useEffect(() => {
        if (!location.state?.roomCodes || location.state.roomCodes.length === 0) {
            navigate('/view')
            return
        }

        setRoomCodes(location.state.roomCodes)
        fetchMultipleRooms(location.state.roomCodes)
    }, [location.state, navigate])

    const fetchMultipleRooms = async (codes) => {
        setLoading(true)
        setError(null)

        try {
            const fetchPromises = codes.map(code =>
                fetch(`${apiBase}/${encodeURIComponent(code)}/summary`)
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`Failed to load room ${code}`)
                        }
                        return res.json()
                    })
                    .catch(err => {
                        console.error(`Error fetching room ${code}:`, err)
                        return null
                    })
            )

            const results = await Promise.all(fetchPromises)
            const validResults = results.filter(r => r !== null)

            if (validResults.length === 0) {
                setError('Failed to load any rooms')
                setLoading(false)
                return
            }

            const allArchivedRounds = []
            let anyCurrentRound = null

            validResults.forEach(result => {
                if (result.archivedRounds && Array.isArray(result.archivedRounds)) {
                    allArchivedRounds.push(...result.archivedRounds)
                }
                if (result.currentRound && !anyCurrentRound) {
                    anyCurrentRound = result.currentRound
                }
            })

            setCombinedData({
                archivedRounds: allArchivedRounds,
                currentRound: anyCurrentRound
            })
        } catch (err) {
            console.error('Error fetching multiple rooms:', err)
            setError(err.message || 'Failed to load room data')
        } finally {
            setLoading(false)
        }
    }

    const handleBackToView = () => {
        navigate('/view')
    }

    return (
        <div style={viewPageStyles.container}>
            <div style={viewPageStyles.header}>
                <h1 style={viewPageStyles.title}>Multi-Game Statistics</h1>
            </div>

            <div style={{
                ...viewPageStyles.codeBanner,
                marginBottom: '24px'
            }}>
                <div style={viewPageStyles.codeContent}>
                    <div>
                        <div style={viewPageStyles.codeHint}>
                            Viewing statistics from {roomCodes.length} game{roomCodes.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <button 
                        onClick={handleBackToView}
                        style={viewPageStyles.changeButton}
                    >
                        ← Back to View
                    </button>
                </div>
            </div>

            {loading && (
                <div style={viewPageStyles.loadingState}>
                    <span style={viewPageStyles.spinner}></span>
                    <span>Loading game data...</span>
                </div>
            )}

            {error && (
                <div style={viewPageStyles.errorMessage}>
                    <span>⚠️</span> {error}
                </div>
            )}

            {!loading && !error && (
                <GameStatistics
                    archivedRounds={combinedData.archivedRounds}
                    currentRound={combinedData.currentRound}
                    totalSessions={roomCodes.length}
                />
            )}
        </div>
    )
}
