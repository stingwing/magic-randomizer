import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function RoomPage() {
    const { code, participantId } = useParams()
    const navigate = useNavigate()
    const [roomData, setRoomData] = useState(null)
    const [roomError, setRoomError] = useState(null)
    const [roomLoading, setRoomLoading] = useState(false)
    const [started, setStarted] = useState(false)
    const [groupResult, setGroupResult] = useState(null)
    const pollRef = useRef(null)
    const lastUpdatedRef = useRef(null)

    const apiBase = 'https://magicreactrandomizerapi.onrender.com:443/api/Rooms'

    const fetchGroupResult = async () => {
        if (!code || !participantId) return false
        const url = `${apiBase}/${encodeURIComponent(code)}/group/${encodeURIComponent(
            participantId
        )}`
        setRoomLoading(true)
        // don't clear previous roomError here — only clear on meaningful success or explicit failures
        try {
            const res = await fetch(url)

            // If the group endpoint doesn't exist yet, treat as "not started" (no error)
            if (res.status === 404 || res.status === 204) {
                return false
            }

            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }

            const data = await res.json().catch(() => null)
            if (data) {
                setGroupResult(data)
                setStarted(true)
                // stop polling now that we have results
                if (pollRef.current) {
                    clearInterval(pollRef.current)
                    pollRef.current = null
                }
                return true
            }
            return false
        } catch (err) {
            console.error('Error fetching group result', err)
            // Surface only meaningful errors to the UI
            setRoomError(err.message || 'Unknown error fetching results')
            return false
        } finally {
            setRoomLoading(false)
        }
    }

    const checkIfStarted = data => {
        if (!data) return false
        // Heuristics to detect that host has started/grouping is complete.
        if (data.started === true || data.gameStarted === true || data.grouped === true) return true
        if (typeof data.status === 'string' && data.status.toLowerCase().includes('start')) return true
        if (data.groups || data.group || data.groupResult || data.grouping) return true
        return false
    }

    const fetchRoom = async () => {
        if (!code) return
        const roomUrl = `${apiBase}/${encodeURIComponent(code)}`
        setRoomLoading(true)
        setRoomError(null)
        try {
            const res = await fetch(roomUrl)
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }
            const data = await res.json().catch(() => null)
            setRoomData(data)
            lastUpdatedRef.current = new Date()

            // Always attempt to resolve per-player group result while not started.
            // This handles cases where the room resource doesn't yet expose a "started" flag
            // but the per-player grouping endpoint is already available.
            if (!started) {
                // First try lightweight heuristic check; if that doesn't indicate start,
                // still attempt fetchGroupResult which returns quietly when results are not ready.
                if (checkIfStarted(data)) {
                    await fetchGroupResult()
                } else {
                    await fetchGroupResult()
                }
            }
        } catch (err) {
            console.error('Error fetching room', err)
            setRoomError(err.message || 'Unknown error')
        } finally {
            setRoomLoading(false)
        }
    }

    // Poll room until started; when started we fetch the group result and stop polling
    useEffect(() => {
        if (!code || !participantId) {
            navigate('/join')
            return
        }

        // initial fetch
        fetchRoom()

        // poll frequently to detect start quickly (adjust interval as desired)
        if (!started) {
            pollRef.current = setInterval(() => {
                fetchRoom()
            }, 5_000) // 5 seconds
        }

        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current)
                pollRef.current = null
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code, participantId, started])

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>Room</h2>
            <div style={{ marginBottom: 12 }}>
                <strong>Code:</strong> {code}
            </div>

            {roomError && (
                <div style={{ color: 'crimson', marginBottom: 8 }}>Error: {roomError}</div>
            )}

            {!started && (
                <>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 13, color: '#333' }}>
                            Waiting for the host to start the game...
                            {roomLoading && <span style={{ marginLeft: 8 }}>Checking…</span>}
                        </div>
                    </div>

                    {roomData ? (
                        Array.isArray(roomData.participants) ? (
                            <div>
                                <strong>Participants ({roomData.participants.length}):</strong>
                                <ul>
                                    {roomData.participants.map((p, i) => (
                                        <li key={p.participantId ?? i}>
                                            {p.participantName ?? p.participantId ?? JSON.stringify(p)}
                                        </li>
                                    ))}
                                </ul>
                                <div style={{ fontSize: 12, color: '#666' }}>
                                    Last updated:{' '}
                                    {lastUpdatedRef.current
                                        ? lastUpdatedRef.current.toLocaleTimeString()
                                        : '—'}
                                </div>
                            </div>
                        ) : (
                            <pre
                                style={{
                                    background: '#f5f5f5',
                                    padding: 12,
                                    overflowX: 'auto'
                                }}
                            >
                                {JSON.stringify(roomData, null, 2)}
                            </pre>
                        )
                    ) : (
                        !roomLoading && <div>No room data available yet.</div>
                    )}
                </>
            )}

            {started && (
                <div style={{ marginTop: 12 }}>
                    <h3>Results</h3>
                    {roomLoading && <div>Loading results…</div>}
                    {!roomLoading && groupResult ? (
                        <pre
                            style={{
                                background: 'Black',
                                padding: 12,
                                overflowX: 'auto'
                            }}
                        >
                            {JSON.stringify(groupResult, null, 2)}
                        </pre>
                    ) : (
                        !roomLoading && <div>No results returned.</div>
                    )}
                </div>
            )}
        </div>
    )
}