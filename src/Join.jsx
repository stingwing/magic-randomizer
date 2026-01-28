import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function JoinPage() {
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleJoin = async () => {
        const trimmedCode = code.trim()
        const trimmedName = name.trim()
        if (!trimmedCode || !trimmedName) {
            alert('Please enter both a code and a name')
            return
        }

        const url = `https://magicreactrandomizerapi.onrender.com:443/api/Rooms/${encodeURIComponent(
            trimmedCode
        )}/join`

        setLoading(true)
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

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>Join</h2>
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
                        {loading ? 'Joining…' : 'Join'}
                    </button>
                </div>
            </div>
        </div>
    )
}