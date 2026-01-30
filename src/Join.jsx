import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiBase } from './api'

export default function JoinPage() {
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleJoin = async () => {
        const trimmedCode = code.trim()
        const trimmedName = name.trim()
        if (!trimmedCode || !trimmedName) {
            alert('Please enter both a code and a name')
            return
        }
        const url = `${apiBase}/${encodeURIComponent(trimmedCode)}/join`

        setLoading(true)
        setError(null)
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participantId: trimmedName,
                    participantName: trimmedName
                })
            })

            if (!res.ok) {
                const text = await res.text().catch(() => '')
                const message = text || `Server returned ${res.status}`
                alert(`Join failed: ${message}`)
                return
            }

            const data = await res.json().catch(() => null)

            // Use server provided id if available, otherwise fall back to the provided name
            const participantId =
                (data && (data.participantId || data.id || data.participant?.participantId)) ||
                trimmedName

            alert(
                data && data.message
                    ? `Joined: ${data.message}`
                    : `Joined code "${trimmedCode}" as "${trimmedName}"`
            )

            // Navigate to the room page which now contains all room polling / start-game logic
            navigate(
                `/room/${encodeURIComponent(trimmedCode)}/${encodeURIComponent(participantId)}`
            )

            // Clear inputs after successful join
            setCode('')
            setName('')
        } catch (err) {
            console.error('Join error', err)
            alert('Network error while attempting to join. Check console for details.')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateNewGame = async () => {
        setCreating(true)
        setError(null)
        try {
            const res = await fetch(apiBase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ hostId: 'host1' }) // change this
            })

            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }

            // Try to read JSON response first
            const data = await res.json().catch(() => null)

            // Try common property names for returned room code
            const roomCode =
                (data && (data.code || data.roomCode || data.id || data.roomId)) ||
                // Fallback: some APIs return the new resource location header
                (() => {
                    const loc = res.headers.get('location') || res.headers.get('Location')
                    if (loc) {
                        const parts = loc.split('/').filter(Boolean)
                        return parts[parts.length - 1]
                    }
                    return null
                })()

            if (roomCode) {
                // Store the room code in localStorage for the host
                localStorage.setItem('hostRoomCode', roomCode)

                // Navigate to the host room page
                navigate(`/host/${roomCode}`)
            } else {
                // If no code field, show error
                setError('Unable to extract room code from server response')
            }
        } catch (err) {
            console.error('Create room error', err)
            setError(err.message || 'Unknown error while creating room')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>Commander Pod Creator</h2>

            {/* New Game Section */}
            <div style={{ marginBottom: 32, padding: 16, background: '#f0f8ff', borderRadius: 8 }}>
                <h3 style={{ marginTop: 0 }}>Host a New Game</h3>
                <p style={{ fontSize: 14, color: '#555', marginBottom: 12 }}>
                    Create a new game room and share the code with players.
                </p>
                <button
                    onClick={handleCreateNewGame}
                    disabled={creating}
                    style={{ padding: '10px 20px', fontSize: 15 }}
                >
                    {creating ? 'Creating…' : 'Create New Game'}
                </button>
                {error && (
                    <div style={{ marginTop: 12, color: 'crimson', fontSize: 13 }}>
                        {error}
                    </div>
                )}
            </div>

            {/* Join Existing Game Section */}
            <div>
                <h3>Join Existing Game</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 14, textAlign: 'left' }}>
                        Code
                        <input
                            type="text"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="Enter join code"
                            style={{ width: '100%', marginTop: 6, padding: 8 }}
                            disabled={loading}
                        />
                    </label>
                    <label style={{ fontSize: 14, textAlign: 'left' }}>
                        Name
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter your name"
                            style={{ width: '100%', marginTop: 6, padding: 8 }}
                            disabled={loading}
                        />
                    </label>
                    <div style={{ marginTop: 8 }}>
                        <button onClick={handleJoin} disabled={loading}>
                            {loading ? 'Joining…' : 'Join Game'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}