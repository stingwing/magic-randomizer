import { useState } from 'react'

export default function NewGamePage() {
    const [creating, setCreating] = useState(false)
    const [starting, setStarting] = useState(false)
    const [newRoomCode, setNewRoomCode] = useState(null)
    const [startCodeInput, setStartCodeInput] = useState('')
    const [message, setMessage] = useState(null)
    const [error, setError] = useState(null)

    const apiBase = 'https://magicreactrandomizerapi.onrender.com:443/api/Rooms'

    const handleCreate = async () => {
        setCreating(true)
        setError(null)
        setMessage(null)
        try {
            const res = await fetch(apiBase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ hostId: 'host1' })
            })

            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }

            // Try to read JSON response first
            const data = await res.json().catch(() => null)

            // Try common property names for returned room code
            const code =
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

            if (code) {
                setNewRoomCode(code)
                setStartCodeInput(code)
                setMessage(`Room created: ${code}`)
                return code
            } else {
                // If no code field, show whole response for debugging
                setNewRoomCode(null)
                const text = data && typeof data === 'string' ? data : JSON.stringify(data, null, 2)
                setMessage(text)
                return null
            }
        } catch (err) {
            console.error('Create room error', err)
            setError(err.message || 'Unknown error while creating room')
            return null
        } finally {
            setCreating(false)
        }
    }

    const handleStart = async () => {
        const trimmed = (startCodeInput || '').trim()
        if (!trimmed) {
            alert('Please provide a room code to start')
            return
        }

        setStarting(true)
        setError(null)
        setMessage(null)
        try {
            const url = `${apiBase}/${encodeURIComponent(trimmed)}/start`

            const res = await fetch(url)
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }


            //const res = await fetch(url, {
            //    method: 'GET',
            //    headers: {
            //        'Content-Type': 'application/json'
            //    },
            //    body: JSON.stringify({})
            //})

            //if (!res.ok) {
            //    const txt = await res.text().catch(() => '')
            //    throw new Error(txt || `Server returned ${res.status}`)
            //}

            const data = await res.json().catch(() => null)
            setMessage(
                data && data.message
                    ? `Started: ${data.message}`
                    : `Start request sent for "${trimmed}"`
            )
        } catch (err) {
            console.error('Start game error', err)
            setError(err.message || 'Unknown error while starting game')
        } finally {
            setStarting(false)
        }
    }

    const copyCode = async code => {
        if (!code) return
        try {
            await navigator.clipboard.writeText(code)
            setMessage('Code copied to clipboard')
        } catch {
            // fallback alert
            alert(`Copy this code: ${code}`)
        }
    }

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>New Game</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                    <button onClick={handleCreate} disabled={creating}>
                        {creating ? 'Creating…' : 'New Game'}
                    </button>
                    {newRoomCode && (
                        <span style={{ marginLeft: 12 }}>
                            <strong>Code:</strong> {newRoomCode}{' '}
                            <button onClick={() => copyCode(newRoomCode)}>Copy</button>
                        </span>
                    )}
                </div>

                <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 14, textAlign: 'left' }}>
                        Room Code to Start
                        <input
                            type="text"
                            value={startCodeInput}
                            onChange={e => setStartCodeInput(e.target.value)}
                            placeholder="Enter room code (or use created code)"
                            style={{ width: '100%', marginTop: 6, padding: 8 }}
                            disabled={starting}
                        />
                    </label>
                    <div style={{ marginTop: 8 }}>
                        <button onClick={handleStart} disabled={starting}>
                            {starting ? 'Starting…' : 'Start Game'}
                        </button>
                    </div>
                </div>

                {message && (
                    <div style={{ marginTop: 12, color: '#006600', fontSize: 13 }}>
                        {message}
                    </div>
                )}
                {error && (
                    <div style={{ marginTop: 12, color: 'crimson', fontSize: 13 }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    )
}