import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as signalR from '@microsoft/signalr'
import { apiBase, signalRBase } from './api'
import { validateUrlParam } from './utils/validation'
import { isInCustomGroup, getCustomGroupColor } from './utils/customGroupColors'
import RoomNav from './components/RoomNav'
import { styles } from './styles/PlayerCustomGroups.styles'

export default function PlayerCustomGroupsPage() {
    const { code, participantId } = useParams()
    const navigate = useNavigate()
    const [participants, setParticipants] = useState([])
    const [selectedPlayers, setSelectedPlayers] = useState([])
    const [autoFill, setAutoFill] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [validatedCode, setValidatedCode] = useState('')
    const [validatedParticipantId, setValidatedParticipantId] = useState('')
    const [connectionStatus, setConnectionStatus] = useState('disconnected')
    const [allowCustomGroups, setAllowCustomGroups] = useState(true)
    const [maxGroupSize, setMaxGroupSize] = useState(4) // Add state for maxGroupSize
    const hubConnectionRef = useRef(null)

    // Validate URL parameters on mount
    useEffect(() => {
        const codeValidation = validateUrlParam(code)
        const participantValidation = validateUrlParam(participantId)

        if (!codeValidation.valid || !participantValidation.valid) {
            navigate('/')
            return
        }

        setValidatedCode(codeValidation.sanitized)
        setValidatedParticipantId(participantValidation.sanitized)
    }, [code, participantId, navigate])

    // Fetch participants and room settings
    const fetchParticipants = async () => {
        if (!validatedCode) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(validatedCode)}`)
            if (!res.ok) {
                throw new Error('Unable to load participants')
            }
            const data = await res.json()
            
            // Disable custom groups if either setting is false
            const shouldAllowCustomGroups = 
                (data.settings?.allowPlayersToCreateCustomGroups !== false) &&
                (data.settings?.allowCustomGroups !== false)
            
            setAllowCustomGroups(shouldAllowCustomGroups)
            
            // Update maxGroupSize from settings
            if (data.settings?.maxGroupSize !== undefined) {
                setMaxGroupSize(data.settings.maxGroupSize)
            }
            
            if (data && Array.isArray(data.participants)) {
                setParticipants(data.participants)
            }
        } catch (err) {
            console.error('Error fetching participants', err)
            setError('Unable to load participants')
        }
    }

    useEffect(() => {
        if (validatedCode) {
            fetchParticipants()
        }
    }, [validatedCode])

    // SignalR Connection Setup
    useEffect(() => {
        if (!validatedCode || !validatedParticipantId) {
            return
        }

        const hubUrl = `${signalRBase}/hubs/rooms`
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl)
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.previousRetryCount === 0) return 0
                    if (retryContext.previousRetryCount === 1) return 2000
                    if (retryContext.previousRetryCount === 2) return 10000
                    if (retryContext.previousRetryCount === 3) return 30000
                    return 60000
                }
            })
            .configureLogging(signalR.LogLevel.Information)
            .build()

        hubConnectionRef.current = connection

        connection.onreconnecting(() => {
            console.log('SignalR reconnecting...')
            setConnectionStatus('connecting')
        })

        connection.onreconnected(() => {
            console.log('SignalR reconnected')
            setConnectionStatus('connected')
            connection.invoke('JoinRoomGroup', validatedCode).catch(err =>
                console.error('Error rejoining room:', err)
            )
            fetchParticipants()
        })

        connection.onclose(() => {
            console.log('SignalR connection closed')
            setConnectionStatus('disconnected')
        })

        connection.on('CustomGroupCreated', (data) => {
            console.log('CustomGroupCreated event received:', data)
            fetchParticipants()
            if (data && data.createdBy === validatedParticipantId) {
                setMessage('Custom group created successfully')
                setTimeout(() => setMessage(null), 3000)
            }
        })

        connection.on('CustomGroupDeleted', (data) => {
            console.log('CustomGroupDeleted event received:', data)
            fetchParticipants()
            if (data && data.deletedBy === validatedParticipantId) {
                setMessage('Custom group deleted successfully')
                setTimeout(() => setMessage(null), 3000)
            }
        })

        connection.on('ParticipantJoined', () => fetchParticipants())
        connection.on('ParticipantDroppedOut', () => fetchParticipants())
        
        connection.on('SettingsUpdated', (data) => {
            console.log('SettingsUpdated event received:', data)
            // Update setting from SignalR event
            if (data) {
                // Disable custom groups if either setting is false
                const shouldAllowCustomGroups = 
                    (typeof data.allowPlayersToCreateCustomGroups === 'boolean' 
                        ? data.allowPlayersToCreateCustomGroups 
                        : true) &&
                    (typeof data.allowCustomGroups === 'boolean'
                        ? data.allowCustomGroups
                        : true)
                
                setAllowCustomGroups(shouldAllowCustomGroups)
                
                if (!shouldAllowCustomGroups) {
                    setError('Custom groups have been disabled by the host')
                } else {
                    // Clear error if custom groups are re-enabled
                    if (error === 'Custom groups have been disabled by the host') {
                        setError(null)
                    }
                }
            }
        })

        connection.on('RoomUpdated', (data) => {
            console.log('RoomUpdated event received:', data)
            // Update participants and settings from room data
            if (data) {
                // Disable custom groups if either setting is false
                const shouldAllowCustomGroups = 
                    (typeof data.allowPlayersToCreateCustomGroups === 'boolean' 
                        ? data.allowPlayersToCreateCustomGroups 
                        : true) &&
                    (typeof data.allowCustomGroups === 'boolean'
                        ? data.allowCustomGroups
                        : true)
                
                setAllowCustomGroups(shouldAllowCustomGroups)
                
                if (data.participants && Array.isArray(data.participants)) {
                    setParticipants(data.participants)
                }
            }
        })

        setConnectionStatus('connecting')
        connection.start()
            .then(() => {
                console.log('SignalR Connected')
                setConnectionStatus('connected')
                return connection.invoke('JoinRoomGroup', validatedCode)
            })
            .catch(err => {
                console.error('SignalR Connection Error:', err)
                setConnectionStatus('disconnected')
            })

        return () => {
            if (hubConnectionRef.current) {
                hubConnectionRef.current.invoke('LeaveRoomGroup', validatedCode)
                    .catch(err => console.error('Error leaving room group:', err))
                    .finally(() => {
                        hubConnectionRef.current.stop()
                    })
            }
        }
    }, [validatedCode, validatedParticipantId])

    // Group participants by custom group
    const customGroups = participants.reduce((groups, participant) => {
        if (isInCustomGroup(participant.inCustomGroup)) {
            if (!groups[participant.inCustomGroup]) {
                groups[participant.inCustomGroup] = []
            }
            groups[participant.inCustomGroup].push(participant)
        }
        return groups
    }, {})

    const myCustomGroups = Object.entries(customGroups).filter(([groupId, members]) =>
        members.some(m => m.id === validatedParticipantId)
    )

    // Auto-select current player when component mounts
    useEffect(() => {
        if (validatedParticipantId && selectedPlayers.length === 0 && allowCustomGroups) {
            setSelectedPlayers([validatedParticipantId])
        }
    }, [validatedParticipantId, allowCustomGroups])

    const togglePlayerSelection = (playerId) => {
        if (playerId === validatedParticipantId || !allowCustomGroups) {
            return
        }

        setSelectedPlayers(prev => {
            if (prev.includes(playerId)) {
                return prev.filter(id => id !== playerId)
            } else {
                if (prev.length >= maxGroupSize) {
                    setError(`Maximum ${maxGroupSize} players per custom group`)
                    return prev
                }
                return [...prev, playerId]
            }
        })
        setError(null)
    }

    const handleCreateCustomGroup = async () => {
        if (!allowCustomGroups) {
            setError('Custom groups have been disabled by the host')
            return
        }

        if (!selectedPlayers.includes(validatedParticipantId)) {
            setError('You must be part of the custom group')
            return
        }

        if (selectedPlayers.length < 2) {
            setError('Please select at least 1 other player')
            return
        }
        if (selectedPlayers.length > maxGroupSize) {
            setError(`Maximum ${maxGroupSize} players per custom group`)
            return
        }

        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const url = `${apiBase}/${encodeURIComponent(validatedCode)}/handlegame`
            const body = {
                result: 'createcustomplayer',
                hostId: validatedParticipantId,
                participantId: validatedParticipantId,
                groupNumber: 0,
                roundNumber: 0,
                moveGroup: 0,
                participantIds: selectedPlayers,
                autoFill: autoFill
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                let errorMessage = 'Unable to create custom group'
                try {
                    const errorData = await res.json()
                    errorMessage = errorData.message || errorData.error || errorMessage
                } catch {
                    // Ignore parsing errors
                }
                throw new Error(errorMessage)
            }

            const data = await res.json().catch(() => null)
            setMessage(data?.message || 'Custom group created successfully')
            setSelectedPlayers([validatedParticipantId])
            setAutoFill(true)
            
            await fetchParticipants()
        } catch (err) {
            console.error('Error creating custom group', err)
            setError(err.message || 'Unable to create custom group')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteCustomGroup = async (customGroupId, members) => {
        if (!allowCustomGroups) {
            setError('Custom groups have been disabled by the host')
            return
        }

        const isMember = members.some(m => m.id === validatedParticipantId)
        if (!isMember) {
            setError('You can only delete groups you are a member of')
            return
        }

        if (!window.confirm('Are you sure you want to delete this custom group?')) {
            return
        }

        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const url = `${apiBase}/${encodeURIComponent(validatedCode)}/handlegame`
            const body = {
                result: 'deletecustomplayer',
                hostId: validatedParticipantId,
                participantId: validatedParticipantId,
                groupNumber: 0,
                roundNumber: 0,
                moveGroup: 0,
                participantIds: [],
                autoFill: true,
                customGroupId: customGroupId
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                let errorMessage = 'Unable to delete custom group'
                try {
                    const errorData = await res.json()
                    errorMessage = errorData.message || errorData.error || errorMessage
                } catch {
                    // Ignore parsing errors
                }
                throw new Error(errorMessage)
            }

            const data = await res.json().catch(() => null)
            setMessage(data?.message || 'Custom group deleted successfully')
            
            await fetchParticipants()
        } catch (err) {
            console.error('Error deleting custom group', err)
            setError(err.message || 'Unable to delete custom group')
        } finally {
            setLoading(false)
        }
    }

    const isPlayerSelected = (playerId) => selectedPlayers.includes(playerId)
    const isCurrentPlayer = (playerId) => playerId === validatedParticipantId

    // Show disabled state if custom groups are disabled
    if (!allowCustomGroups) {
        return (
            <div style={styles.container}>
                <RoomNav 
                    roomCode={validatedCode} 
                    participantId={validatedParticipantId}
                    currentPage="custom-groups"
                    allowCustomGroups={allowCustomGroups}
                />

                <div style={styles.content}>
                    <div style={styles.pageHeader}>
                        <h1 style={styles.title}>Custom Groups Disabled</h1>
                    </div>

                    <div style={{
                        ...styles.infoCard,
                        textAlign: 'center',
                        padding: 'clamp(2rem, 5vw, 3rem)'
                    }}>
                        <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', marginBottom: '1rem' }}>🚫</div>
                        <h3 style={styles.infoTitle}>Custom Groups Have Been Disabled</h3>
                        <p style={styles.infoText}>
                            The host has disabled custom groups for this game.
                        </p>
                        <p style={styles.infoText}>
                            Use the navigation bar above to return to the game room or view other sections.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.container}>
            <RoomNav 
                roomCode={validatedCode} 
                participantId={validatedParticipantId}
                currentPage="custom-groups"
                allowCustomGroups={allowCustomGroups}
            />

            <div style={styles.content}>
                <div style={styles.pageHeader}>
                    <h1 style={styles.title}>Custom Groups</h1>
                    <p style={styles.subtitle}>Create groups to play with specific players</p>
                </div>

                <div style={styles.infoCard}>
                    <h3 style={styles.infoTitle}>ℹ️ About Custom Groups</h3>
                    <p style={styles.infoText}>
                        Custom groups ensure you're always paired with specific players.
                    </p>
                    <ul style={styles.infoList}>
                        <li>Select up to {maxGroupSize} other players to form a group</li>
                        <li>Enable "Auto Fill" if you want other players to be randomly added to your group</li>
                    </ul>
                </div>

                {error && (
                    <div style={styles.errorMessage}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                {message && (
                    <div style={styles.successMessage}>
                        <span>✅</span> {message}
                    </div>
                )}

                {/* My Custom Groups */}
                {myCustomGroups.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>
                            My Custom Groups ({myCustomGroups.length})
                        </h2>

                        <div style={styles.groupsList}>
                            {myCustomGroups.map(([groupId, members], index) => {
                                const groupColor = getCustomGroupColor(groupId)

                                return (
                                    <div key={groupId} style={styles.groupCard}>
                                        <div style={styles.groupHeader}>
                                            <h3 style={styles.groupTitle}>
                                                <span
                                                    style={{
                                                        ...styles.groupColorIndicator,
                                                        backgroundColor: groupColor
                                                    }}
                                                />
                                                Custom Group {index + 1}
                                            </h3>
                                            <button
                                                onClick={() => handleDeleteCustomGroup(groupId, members)}
                                                disabled={loading}
                                                style={{
                                                    ...styles.deleteButton,
                                                    ...(loading ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                                                }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>

                                        <div style={styles.groupMembers}>
                                            {members
                                                .sort((a, b) => {
                                                    // Always put current player first
                                                    if (a.id === validatedParticipantId) return -1
                                                    if (b.id === validatedParticipantId) return 1
                                                    // Sort others by ID
                                                    return (a.id ?? '').localeCompare(b.id ?? '')
                                                })
                                                .map((member) => {
                                                    const isMe = member.id === validatedParticipantId
                                                    return (
                                                        <div key={member.id} style={styles.memberItem}>
                                                            <span style={styles.memberDot}>●</span>
                                                            {member.name ?? member.id}
                                                            {isMe && <span style={styles.youBadgeSmall}>YOU</span>}
                                                        </div>
                                                    )
                                                })}
                                        </div>

                                        <div style={styles.groupInfo}>
                                            <span style={styles.groupInfoText}>
                                                {members.length} {members.length === 1 ? 'player' : 'players'}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Create New Custom Group */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>Create New Custom Group</h2>
                    
                    <div style={styles.selectionInfo}>
                        <span style={styles.selectionCount}>
                            Selected: {selectedPlayers.length} / {maxGroupSize}
                        </span>
                        {selectedPlayers.length > 1 && (
                            <button 
                                onClick={() => setSelectedPlayers([validatedParticipantId])}
                                style={styles.clearButton}
                            >
                                Clear Others
                            </button>
                        )}
                    </div>

                    <div style={styles.playersGrid}>
                        {participants
                            .filter(p => !p.dropped)
                            .sort((a, b) => {
                                // Always put current player first
                                if (a.id === validatedParticipantId) return -1
                                if (b.id === validatedParticipantId) return 1
                                // Sort others by ID
                                return (a.id ?? '').localeCompare(b.id ?? '')
                            })
                            .map((player) => {
                                const selected = isPlayerSelected(player.id)
                                const isMe = isCurrentPlayer(player.id)
                                const inCustom = isInCustomGroup(player.inCustomGroup)
                                const customGroupColor = inCustom ? getCustomGroupColor(player.inCustomGroup) : null

                                return (
                                    <button
                                        key={player.id}
                                        onClick={() => togglePlayerSelection(player.id)}
                                        disabled={loading || isMe}
                                        style={{
                                            ...styles.playerCard,
                                            ...(selected ? styles.playerCardSelected : {}),
                                            ...(isMe ? styles.playerCardYou : {}),
                                            ...(loading || isMe ? { cursor: 'not-allowed' } : {})
                                        }}
                                    >
                                        <div style={styles.playerName}>
                                            {selected && <span style={styles.checkmark}>✓</span>}
                                            {player.name ?? player.id}
                                            {isMe && <span style={styles.youBadge}>YOU</span>}
                                        </div>
                                        {inCustom && (
                                            <span style={{ 
                                                ...styles.customBadge,
                                                backgroundColor: customGroupColor
                                            }}>
                                                IN GROUP
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                    </div>

                    <div style={styles.createActions}>
                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={autoFill}
                                onChange={(e) => setAutoFill(e.target.checked)}
                                style={styles.checkbox}
                                disabled={loading}
                            />
                            <span style={styles.checkboxText}>
                                Auto Fill
                                <span style={styles.checkboxHint}>
                                    (Automatically add other players to complete the group)
                                </span>
                            </span>
                        </label>

                        <button
                            onClick={handleCreateCustomGroup}
                            disabled={loading || selectedPlayers.length < 2 || selectedPlayers.length > 6}
                            style={{
                                ...styles.createButton,
                                ...(loading || selectedPlayers.length < 2 || selectedPlayers.length > 6 ? styles.buttonDisabled : {})
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={styles.spinner}></span>
                                    Creating...
                                </>
                            ) : (
                                `Create Custom Group (${selectedPlayers.length} players)`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}