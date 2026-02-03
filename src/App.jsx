import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import NewPage from './About'
import JoinPage from './Join'
import RejoinPage from './Rejoin'
import RoomPage from './Room'
import HostRoomPage from './HostRoom'
import ViewPage from './ViewPage'
import Manual from './Manual'
import NavBar from './NavBar'

function App() {
    return (
        <Router>
            <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "sans-serif", paddingTop: 56, padding: "56px 0.5rem 1rem" }}>
                <NavBar />
                <Routes>
                    <Route path="/" element={<JoinPage />} />
                    <Route path="/rejoin" element={<RejoinPage />} />
                    <Route path="/manual" element={<Manual />} />
                    <Route path="/new" element={<NewPage />} />
                    <Route path="/room/:code/:participantId" element={<RoomPage />} />
                    <Route path="/host/:code/:hostId" element={<HostRoomPage />} />
                    <Route path="/view" element={<ViewPage />} />
                    <Route path="/view/:code" element={<ViewPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App