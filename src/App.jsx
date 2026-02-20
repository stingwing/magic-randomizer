import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import NewPage from './About'
import JoinPage from './Join'
import QuickJoinPage from './QuickJoin'
import RejoinPage from './Rejoin'
import RoomPage from './Room'
import HostRoomPage from './HostRoom'
import HostSettingsPage from './HostSettings'
import RoundManagerPage from './RoundManager'
import ViewPage from './ViewPage'
import Manual from './Manual'
import NavBar from './NavBar'
import { apiBase } from './api'
import CustomGroups from './CustomGroups'
import PlayerCustomGroups from './PlayerCustomGroups'
import RoomStatistics from './RoomStatistics'
import MobileViewPage from './MobileViewPage'

function AppContent() {
    const location = useLocation()
    
    // Check if current route should hide the main NavBar
    const shouldHideNavBar = location.pathname.match(/^\/room\/[^/]+\/[^/]+(\/.*)?$/) ||
                            location.pathname.match(/^\/view\/[^/]+\/mobile\/[^/]+$/)
    
    return (
        <>
            {!shouldHideNavBar && <NavBar />}
            <Routes>
                <Route path="/" element={<JoinPage />} />
                <Route path="/rejoin" element={<RejoinPage />} />
                <Route path="/manual" element={<Manual />} />
                <Route path="/new" element={<NewPage />} />
                <Route path="/room/:code/:participantId" element={<RoomPage />} />
                <Route path="/room/:code/:participantId/statistics" element={<RoomStatistics />} />
                <Route path="/room/:code/:participantId/custom-groups" element={<PlayerCustomGroups />} />
                <Route path="/host/:code/:hostId" element={<HostRoomPage />} />
                <Route path="/host/:code/:hostId/settings" element={<HostSettingsPage />} />
                <Route path="/host/:code/:hostId/rounds" element={<RoundManagerPage />} />
                <Route path="/host/:code/:hostId/custom-groups" element={<CustomGroups />} />
                <Route path="/view" element={<ViewPage />} />
                <Route path="/view/:code" element={<ViewPage />} />
                <Route path="/view/:code/mobile/:participantId" element={<MobileViewPage />} />
                <Route path="/quick-join" element={<QuickJoinPage />} />
            </Routes>
        </>
    )
}

function App() {
    const [serviceStatus, setServiceStatus] = useState(null)

    // Health check on initial load
    useEffect(() => {
        const checkServiceHealth = async () => {
            try {
                const response = await fetch(`${apiBase}/test`)
                
                if (response.ok) {
                    const data = await response.json()
                    console.log('✅ Service health check:', data)
                    setServiceStatus({
                        message: data.message,
                        utcNow: data.utcNow,
                        status: 'online'
                    })
                } else {
                    console.warn('⚠️ Service health check failed:', response.status)
                    setServiceStatus({
                        status: 'offline',
                        error: `HTTP ${response.status}`
                    })
                }
            } catch (error) {
                console.error('❌ Service health check error:', error)
                setServiceStatus({
                    status: 'error',
                    error: error.message
                })
            }
        }

        checkServiceHealth()
    }, [])

    return (
        <Router>
            <div style={{ 
                maxWidth: 1200, 
                margin: "0 auto", 
                fontFamily: "sans-serif", 
                padding: "56px 0.5rem 1rem" 
            }}>
                <AppContent />
            </div>
        </Router>
    )
}

export default App