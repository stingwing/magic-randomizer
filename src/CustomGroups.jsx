import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as signalR from '@microsoft/signalr'
import { apiBase, signalRBase } from './api'
import { validateUrlParam } from './utils/validation'
import { isInCustomGroup, getCustomGroupColor } from './utils/customGroupColors'
import { styles } from './styles/CustomGroups.styles'
import { useHostValidation } from './hooks/useHostValidation'
import LoadingState from './components/LoadingState'

export default function CustomGroupsPage() {
    const { code, hostId } = useParams()
    const navigate = useNavigate()
    
    // Use the custom hook for validation
    const { validatedCode, validatedHostId, hostValidated, validating } = useHostValidation(code, hostId)
    
    const [participants, setParticipants] = useState([])
    const [selectedPlayers, setSelectedPlayers] = useState([])
    const [autoFill, setAutoFill] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [maxGroupSize, setMaxGroupSize] = useState(4)
    const [connectionStatus, setConnectionStatus] = useState('disconnected')
    const hubConnectionRef = useRef(null)

    // Check if custom groups are allowed
    useEffect(() => {
        if (!validatedCode || !hostValidated) return
        
        const checkSettings = async () => {
            try {
                const res = await fetch(`${apiBase}/${encodeURIComponent(validatedCode)}`)
                if (res.ok) {
                    const data = await res.json()
                    
                    // Check if allowCustomGroups is false
                    if (data.settings?.allowCustomGroups === false) {
                        setError('Custom groups have been disabled by the host')
                        setTimeout(() => {
                            navigate(`/host/${encodeURIComponent(validatedCode)}/${encodeURIComponent(validatedHostId)}`)
                        }, 2000)
                    }
                }
            } catch (err) {
                console.error('Error checking settings:', err)
            }
        }

        checkSettings()
    }, [validatedCode, validatedHostId, hostValidated, navigate])

    // Fetch participants
    const fetchParticipants = async () => {
        if (!validatedCode) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(validatedCode)}`)
            if (!res.ok) {
                throw new Error('Unable to load participants')
            }
            const data = await res.json()
            
            // Check settings on every fetch
            if (data.settings?.allowCustomGroups === false) {
                setError('Custom groups have been disabled by the host')
                setTimeout(() => {
                    navigate(`/host/${encodeURIComponent(validatedCode)}/${encodeURIComponent(validatedHostId)}`)
                }, 2000)
                return
            }
            
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
        if (validatedCode && hostValidated) {
            fetchParticipants()
        }
    }, [validatedCode, hostValidated])

    // SignalR Connection Setup
    useEffect(() => {
        if (!validatedCode || !validatedHostId || !hostValidated) {
            return
        }

        // Setup SignalR connection
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

        // Connection event handlers
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

        // SignalR message handlers
        connection.on('CustomGroupCreated', (data) => {
            console.log('CustomGroupCreated event received:', data)
            fetchParticipants()
            setMessage('Custom group created successfully')
            setTimeout(() => setMessage(null), 3000)
        })

        connection.on('CustomGroupDeleted', (data) => {
            console.log('CustomGroupDeleted event received:', data)
            fetchParticipants()
            setMessage('Custom group deleted successfully')
            setTimeout(() => setMessage(null), 3000)
        })

        connection.on('ParticipantJoined', (data) => {
            console.log('ParticipantJoined event received:', data)
            fetchParticipants()
        })

        connection.on('ParticipantDroppedOut', (data) => {
            console.log('ParticipantDroppedOut event received:', data)
            fetchParticipants()
        })

        // Start the connection
        setConnectionStatus('connecting')
        connection.start()
            .then(() => {
                console.log('SignalR Connected')
                setConnectionStatus('connected')
                return connection.invoke('JoinRoomGroup', validatedCode)
            })
            .then(() => {
                console.log(`Joined room: ${validatedCode}`)
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
                            .then(() => console.log('SignalR connection stopped'))
                            .catch(err => console.error('Error stopping SignalR:', err))
                    })
            }
        }
    }, [validatedCode, validatedHostId, hostValidated])

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

    // Toggle player selection
    const togglePlayerSelection = (playerId) => {
        setSelectedPlayers(prev => {
            if (prev.includes(playerId)) {
                return prev.filter(id => id !== playerId)
            } else {
                // Use dynamic maxGroupSize
                if (prev.length >= maxGroupSize) {
                    setError(`Maximum ${maxGroupSize} players per custom group`)
                    return prev
                }
                return [...prev, playerId]
            }
        })
        setError(null)
    }

    // Create custom group
    const handleCreateCustomGroup = async () => {
        if (selectedPlayers.length < 2) {
            setError('Please select at least 2 players')
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
                result: 'createcustom',
                hostId: validatedHostId,
                participantId: '',
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
            setSelectedPlayers([])

            // SignalR will handle the update, but refresh for immediate feedback
            await fetchParticipants()
        } catch (err) {
            console.error('Error creating custom group', err)
            setError(err.message || 'Unable to create custom group')
        } finally {
            setLoading(false)
        }
    }

    // Delete custom group
    const handleDeleteCustomGroup = async (customGroupId) => {
        if (!window.confirm('Are you sure you want to delete this custom group?')) {
            return
        }

        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const url = `${apiBase}/${encodeURIComponent(validatedCode)}/handlegame`
            const body = {
                result: 'deletecustom',
                hostId: validatedHostId,
                participantId: '',
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
            
            // SignalR will handle the update, but refresh for immediate feedback
            await fetchParticipants()
        } catch (err) {
            console.error('Error deleting custom group', err)
            setError(err.message || 'Unable to delete custom group')
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () => {
        navigate(`/host/${encodeURIComponent(validatedCode)}/${encodeURIComponent(validatedHostId)}`)
    }

    const isPlayerSelected = (playerId) => selectedPlayers.includes(playerId)

    // Show loading state while validating
    if (validating) {
        return <LoadingState title="Custom Groups" message="Verifying host credentials..." />
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 style={styles.title}>Custom Groups</h1>
                    {connectionStatus === 'connected' && (
                        <span style={{ color: 'var(--success-color)', fontSize: '0.85rem' }}>
                            ● Live
                        </span>
                    )}
                    {connectionStatus === 'connecting' && (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            ⟳ Connecting...
                        </span>
                    )}
                </div>
                <button onClick={handleBack} style={styles.backButton}>
                    ← Back to Dashboard
                </button>
            </div>

            <div style={styles.infoCard}>
                <h3 style={styles.infoTitle}>ℹ️ About Custom Groups</h3>
                <p style={styles.infoText}>
                    Custom groups allow you to ensure specific players are always grouped together.
                    Select 2-6 players and create a custom group. These players will be placed in the same group when rounds are generated.
                </p>
                <ul style={styles.infoList}>
                    <li>Select 2-6 players to form a custom group</li>
                    <li>Enable "Auto Fill" to automatically add other players to complete the group</li>
                    <li>Players can be in multiple custom groups</li>
                    <li>Delete custom groups when no longer needed</li>
                    <li>Changes are synced in real-time with all players</li>
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

            {/* Create New Custom Group */}
            <div style={styles.createSection}>
                <h2 style={styles.sectionTitle}>Create New Custom Group</h2>
                
                <div style={styles.selectionInfo}>
                    <span style={styles.selectionCount}>
                        Selected: {selectedPlayers.length} / {maxGroupSize}
                    </span>
                    {selectedPlayers.length > 0 && (
                        <button 
                            onClick={() => setSelectedPlayers([])}
                            style={styles.clearButton}
                        >
                            Clear Selection
                        </button>
                    )}
                </div>

                <div style={styles.playersGrid}>
                    {participants
                        .filter(p => !p.dropped)
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((player) => {
                            const selected = isPlayerSelected(player.id)
                            const inCustom = isInCustomGroup(player.inCustomGroup)
                            const customGroupColor = inCustom ? getCustomGroupColor(player.inCustomGroup) : null

                            return (
                                <button
                                    key={player.id}
                                    onClick={() => togglePlayerSelection(player.id)}
                                    disabled={loading}
                                    style={{
                                        ...styles.playerCard,
                                        ...(selected ? styles.playerCardSelected : {}),
                                        ...(loading ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                                    }}
                                >
                                    <div style={styles.playerName}>
                                        {selected && <span style={styles.checkmark}>✓</span>}
                                        {player.name ?? player.id}
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

            {/* Existing Custom Groups */}
            {Object.keys(customGroups).length > 0 && (
                <div style={styles.existingSection}>
                    <h2 style={styles.sectionTitle}>
                        Existing Custom Groups ({Object.keys(customGroups).length})
                    </h2>
                    
                    <div style={styles.groupsList}>
                        {Object.entries(customGroups).map(([groupId, members], index) => {
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
                                            onClick={() => handleDeleteCustomGroup(groupId)}
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
                                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                            .map((member) => (
                                                <div key={member.id} style={styles.memberItem}>
                                                    <span style={styles.memberDot}>●</span>
                                                    {member.name ?? member.id}
                                                </div>
                                            ))}
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

            {Object.keys(customGroups).length === 0 && (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📦</div>
                    <h3 style={styles.emptyTitle}>No Custom Groups Yet</h3>
                    <p style={styles.emptyText}>
                        Create your first custom group by selecting 2-6 players above
                    </p>
                </div>
            )}
        </div>
    )
}