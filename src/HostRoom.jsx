import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiBase } from './api'

// Helper component to display round results in a consistent format
function RoundDisplay({ round, index, label }) {
    if (!round) return null

    // Handle both array of groups and object with groups property
    let groups = []
    let roundNumber = 'N/A'

    if (Array.isArray(round)) {
        // API returns array of groups directly
        groups = round
        // Extract round number from first group
        if (groups.length > 0 && groups[0].round !== undefined) {
            roundNumber = groups[0].round
        } else if (index !== undefined) {
            roundNumber = index + 1
        }
    } else {
        // Round is an object with groups property
        roundNumber = round.round ?? round.roundNumber ?? (index !== undefined ? index + 1 : 'N/A')
        groups = round.groups ?? []
    }

    return (
        <div style={{
            background: '#1a1a1a',
            padding: 16,
            borderRadius: 4,
            minWidth: 300,
            flex: '0 0 300px',
            color: '#fff'
        }}>
            <h4 style={{ marginTop: 0, color: '#fff' }}>
                {label || `Round ${roundNumber}`}
            </h4>

            {groups.length > 0 ? (
                groups.map((group, groupIdx) => {
                    const groupNumber = group.groupNumber ?? groupIdx + 1
                    const members = group.members ?? group.participants ?? []
                    const result = group.result
                    const winner = group.winner
                    const draw = group.draw

                    return (
                        <div key={groupIdx} style={{
                            marginBottom: 16,
                            paddingLeft: 16,
                            borderLeft: '3px solid #444',
                            paddingBottom: 8
                        }}>
                            <div style={{ marginBottom: 8 }}>
                                <strong>Group {groupNumber}</strong>
                            </div>

                            {/* Result details if available */}
                            {(result !== undefined || winner !== undefined || draw !== undefined) && (
                                <div style={{ marginBottom: 8, fontSize: 14, color: '#aaa' }}>
                                    {result !== undefined && (
                                        <div>
                                            <strong>Result Reported:</strong> {result ? 'Yes' : 'No'}
                                        </div>
                                    )}
                                    {winner !== undefined && winner !== null && (
                                        <div>
                                            <strong>Winner:</strong> {winner}
                                        </div>
                                    )}
                                    {draw !== undefined && (
                                        <div>
                                            <strong>Draw:</strong> {draw ? 'Yes' : 'No'}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Group members */}
                            {members.length > 0 && (
                                <div>
                                    <strong>Players:</strong>
                                    <ul style={{ marginTop: 4, paddingLeft: 20, marginBottom: 0 }}>
                                        {members.map((member, memberIdx) => (
                                            <li key={memberIdx}>
                                                {member.name ?? member.id ?? 'Unknown'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )
                })
            ) : (
                <div style={{ fontSize: 14, color: '#999' }}>No groups in this round.</div>
            )}
        </div>
    )
}

export default function HostRoomPage() {
    const { code } = useParams()
    const navigate = useNavigate()
    const [participants, setParticipants] = useState([])
    const [currentRound, setCurrentRound] = useState(null)
    const [archivedRounds, setArchivedRounds] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [starting, setStarting] = useState(false)
    const [startingNewRound, setStartingNewRound] = useState(false)
    const pollRef = useRef(null)

    // Fetch participants list
    const fetchParticipants = async () => {
        if (!code) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(code)}`)
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }
            const data = await res.json().catch(() => null)
            if (data && Array.isArray(data.participants)) {
                setParticipants(data.participants)
            }
        } catch (err) {
            console.error('Error fetching participants', err)
            // Don't set error for polling failures
        }
    }

    // Fetch current round data
    const fetchCurrentRound = async () => {
        if (!code) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(code)}/current`)
            if (res.status === 404 || res.status === 204) {
                setCurrentRound(null)
                return
            }
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }
            const data = await res.json().catch(() => null)
            setCurrentRound(data)
        } catch (err) {
            console.error('Error fetching current round', err)
            // Don't set error for polling failures
        }
    }

    // Fetch archived rounds
    const fetchArchivedRounds = async () => {
        if (!code) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(code)}/archived`)
            if (res.status === 404 || res.status === 204) {
                setArchivedRounds([])
                return
            }
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }
            const data = await res.json().catch(() => null)
            if (Array.isArray(data)) {
                setArchivedRounds(data)
            } else {
                setArchivedRounds([])
            }
        } catch (err) {
            console.error('Error fetching archived rounds', err)
            // Don't set error for polling failures
        }
    }

    // Fetch all data
    const fetchAllData = async () => {
        setLoading(true)
        await Promise.all([
            fetchParticipants(),
            fetchCurrentRound(),
            fetchArchivedRounds()
        ])
        setLoading(false)
    }

    // Start the game
    const handleStart = async () => {
        setStarting(true)
        setError(null)
        setMessage(null)
        try {
            const url = `${apiBase}/${encodeURIComponent(code)}/start`
            const res = await fetch(url)
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }
            const data = await res.json().catch(() => null)
            setMessage(
                data && data.message
                    ? `Started: ${data.message}`
                    : 'Game started successfully'
            )
            // Refresh data after starting
            await fetchAllData()
        } catch (err) {
            console.error('Start game error', err)
            setError(err.message || 'Unknown error while starting game')
        } finally {
            setStarting(false)
        }
    }

    // Start a new round
    const handleNewRound = async () => {
        setStartingNewRound(true)
        setError(null)
        setMessage(null)
        try {
            const url = `${apiBase}/${encodeURIComponent(code)}/newround`
            const res = await fetch(url)
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }
            const data = await res.json().catch(() => null)
            setMessage(
                data && data.message
                    ? data.message
                    : 'New round started successfully'
            )
            // Refresh data after starting new round
            await fetchAllData()
        } catch (err) {
            console.error('New round error', err)
            setError(err.message || 'Unknown error while starting new round')
        } finally {
            setStartingNewRound(false)
        }
    }

    // Copy code to clipboard
    const copyCode = async () => {
        if (!code) return
        try {
            await navigator.clipboard.writeText(code)
            setMessage('Code copied to clipboard')
        } catch {
            alert(`Copy this code: ${code}`)
        }
    }

    // Initial load and polling setup
    useEffect(() => {
        if (!code) {
            navigate('/new-game')
            return
        }

        // Store code in localStorage
        localStorage.setItem('hostRoomCode', code)

        // Initial fetch
        fetchAllData()

        // Poll every minute (60000ms)
        pollRef.current = setInterval(() => {
            fetchAllData()
        }, 60000)

        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current)
                pollRef.current = null
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code])

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>Host Room</h2>

            {/* Room Code Section */}
            <div style={{ marginBottom: 24, padding: 16, background: '#1a1a1a', borderRadius: 8, color: '#fff' }}>
                <div style={{ marginBottom: 8 }}>
                    <strong style={{ fontSize: 18 }}>Room Code: </strong>
                    <span style={{ fontSize: 24, fontWeight: 'bold', marginLeft: 8 }}>{code}</span>
                    <button
                        onClick={copyCode}
                        style={{ marginLeft: 16, padding: '4px 12px' }}
                    >
                        Copy Code
                    </button>
                </div>
                <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>
                    Share this code with players so they can join the game.
                </p>
            </div>

            {/* Error/Message Display */}
            {error && (
                <div style={{ marginBottom: 16, color: '#ff6b6b', fontSize: 14, padding: 12, background: '#1a1a1a', borderRadius: 4 }}>
                    {error}
                </div>
            )}
            {message && (
                <div style={{ marginBottom: 16, color: '#51cf66', fontSize: 14, padding: 12, background: '#1a1a1a', borderRadius: 4 }}>
                    {message}
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
                <button
                    onClick={handleStart}
                    disabled={starting || loading}
                    style={{ padding: '10px 20px', fontSize: 15 }}
                >
                    {starting ? 'Starting…' : 'Start Game'}
                </button>
                <button
                    onClick={handleNewRound}
                    disabled={startingNewRound || loading}
                    style={{ padding: '10px 20px', fontSize: 15 }}
                >
                    {startingNewRound ? 'Starting…' : 'Start New Round'}
                </button>
                <button
                    onClick={fetchAllData}
                    disabled={loading}
                    style={{ padding: '10px 20px', fontSize: 15 }}
                >
                    {loading ? 'Refreshing…' : 'Refresh Now'}
                </button>
            </div>

            {/* Participants List */}
            <div style={{ marginBottom: 24 }}>
                <h3>Players ({participants.length})</h3>
                {participants.length > 0 ? (
                    <ul style={{ textAlign: 'left', maxWidth: 400 }}>
                        {participants.map((p, i) => (
                            <li key={p.id ?? i}>
                                {p.name ?? p.id ?? 'Unknown'}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div style={{ fontSize: 14, color: '#666' }}>
                        No players have joined yet.
                    </div>
                )}
            </div>

            {/* Rounds Display - Horizontal Layout */}
            <div style={{ marginBottom: 24 }}>
                <h3>Game Rounds</h3>
                {(archivedRounds.length > 0 || currentRound) ? (
                    <div style={{
                        display: 'flex',
                        gap: 16,
                        overflowX: 'auto',
                        paddingBottom: 16
                    }}>
                        {/* Archived rounds first (left to right) */}
                        {archivedRounds.map((round, idx) => (
                            <RoundDisplay
                                key={idx}
                                round={round}
                                index={idx}
                                label={`Round ${idx + 1}`}
                            />
                        ))}

                        {/* Current round last (rightmost) */}
                        {currentRound && (
                            <RoundDisplay
                                round={currentRound}
                                label="Current Round"
                            />
                        )}
                    </div>
                ) : (
                    <div style={{ fontSize: 14, color: '#666' }}>
                        No rounds available yet.
                    </div>
                )}
            </div>
        </div>
    )
}