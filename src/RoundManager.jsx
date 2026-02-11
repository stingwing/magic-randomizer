import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as signalR from '@microsoft/signalr'
import { apiBase, signalRBase } from './api'
import { validateUrlParam, RateLimiter } from './utils/validation'
import { styles } from './styles/RoundManager.styles'

const roundActionRateLimiter = new RateLimiter(30, 60000)

export default function RoundManagerPage() {
    const { code, hostId } = useParams()
    const navigate = useNavigate()
    const [currentRound, setCurrentRound] = useState(null)
    const [archivedRounds, setArchivedRounds] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [actionInProgress, setActionInProgress] = useState({})
    const [validatedCode, setValidatedCode] = useState('')
    const [validatedHostId, setValidatedHostId] = useState('')
    const [connectionStatus, setConnectionStatus] = useState('disconnected')
    const [selectedMoveGroups, setSelectedMoveGroups] = useState({})
    const [selectedMoveGroupsArchived, setSelectedMoveGroupsArchived] = useState({})
    const hubConnectionRef = useRef(null)

    // Validate URL parameters on mount
    useEffect(() => {
        const codeValidation = validateUrlParam(code)
        const hostIdValidation = validateUrlParam(hostId)

        if (!codeValidation.valid || !hostIdValidation.valid) {
            navigate('/')
            return
        }

        setValidatedCode(codeValidation.sanitized)
        setValidatedHostId(hostIdValidation.sanitized)
    }, [code, hostId, navigate])

    const fetchCurrentRound = async () => {
        if (!validatedCode) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(validatedCode)}/current`)
            if (res.status === 404 || res.status === 204) {
                setCurrentRound(null)
                return
            }
            if (!res.ok) {
                throw new Error('Unable to load current round')
            }
            const data = await res.json().catch(() => null)
            setCurrentRound(data)
        } catch (err) {
            console.error('Error fetching current round', err)
        }
    }

    const fetchArchivedRounds = async () => {
        if (!validatedCode) return
        try {
            const res = await fetch(`${apiBase}/${encodeURIComponent(validatedCode)}/archived`)
            if (res.status === 404 || res.status === 204) {
                setArchivedRounds([])
                return
            }
            if (!res.ok) {
                throw new Error('Unable to load archived rounds')
            }
            const data = await res.json().catch(() => null)
            if (Array.isArray(data)) {
                setArchivedRounds(data)
            } else {
                setArchivedRounds([])
            }
        } catch (err) {
            console.error('Error fetching archived rounds', err)
        }
    }

    const fetchAllData = async () => {
        setLoading(true)
        await Promise.all([
            fetchCurrentRound(),
            fetchArchivedRounds()
        ])
        setLoading(false)
    }

    const getCurrentRoundNumber = () => {
        if (!currentRound) return 0

        if (Array.isArray(currentRound)) {
            if (currentRound.length > 0) {
                return currentRound[0].round ?? currentRound[0].roundNumber ?? 0
            }
            return 0
        }

        return currentRound.round ?? currentRound.roundNumber ?? 0
    }

    const getParticipantIdFromGroups = (groupNumber, participantName, groups) => {
        const group = groups.find(g => (g.groupNumber ?? 0) === groupNumber)
        if (!group) return participantName

        const members = group.members ?? group.participants ?? []
        const member = members.find(m => (m.name ?? m.id) === participantName)

        return member?.id ?? participantName
    }

    const getParticipantId = (groupNumber, participantName) => {
        const groups = getCurrentGroups()
        return getParticipantIdFromGroups(groupNumber, participantName, groups)
    }

    const handleRoundAction = async (groupNumber, action, participantName = null, moveGroup = 0, roundNumber = null) => {
        if (!validatedCode || !validatedHostId) return

        const actionKey = `${roundNumber ?? 'current'}-${groupNumber}-${action}-${participantName || ''}-${moveGroup}`

        // Check rate limiting
        if (!roundActionRateLimiter.canAttempt(actionKey)) {
            setError('Too many actions. Please wait a moment.')
            return
        }

        setActionInProgress(prev => ({ ...prev, [actionKey]: true }))
        setError(null)
        setMessage(null)

        try {
            const url = `${apiBase}/${encodeURIComponent(validatedCode)}/handlegame`

            const payload = {
                result: action,
                hostId: validatedHostId,
                participantId: participantName ? getParticipantId(groupNumber, participantName) : '',
                groupNumber: groupNumber,
                roundNumber: roundNumber ?? getCurrentRoundNumber(),
                moveGroup: moveGroup
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const safeMessage = res.status === 400
                    ? 'Invalid round action'
                    : `Unable to ${action} for group ${groupNumber}`
                throw new Error(safeMessage)
            }

            const data = await res.json().catch(() => null)

            let successMessage = `Action "${action}" completed for Group ${groupNumber}`
            if (action === 'movegroup' && participantName) {
                successMessage = `Moved ${participantName} to Group ${moveGroup}`
            } else if (data && data.message) {
                successMessage = data.message
            }

            setMessage(successMessage)

            // Clear selected move group for this player
            if (action === 'movegroup' && participantName) {
                const key = `${roundNumber ?? 'current'}-${groupNumber}-${participantName}`
                setSelectedMoveGroups(prev => {
                    const newState = { ...prev }
                    delete newState[key]
                    return newState
                })
                setSelectedMoveGroupsArchived(prev => {
                    const newState = { ...prev }
                    delete newState[key]
                    return newState
                })
            }

            // SignalR will trigger updates automatically, but refresh immediately
            await fetchAllData()
        } catch (err) {
            console.error('Round action error', err)
            setError(err.message || 'Unable to process round action')
        } finally {
            setActionInProgress(prev => ({ ...prev, [actionKey]: false }))
        }
    }

    const handleMoveGroupChange = (groupNumber, memberName, targetGroup, roundNumber = null) => {
        const key = `${roundNumber ?? 'current'}-${groupNumber}-${memberName}`
        if (roundNumber === null) {
            setSelectedMoveGroups(prev => ({
                ...prev,
                [key]: targetGroup
            }))
        } else {
            setSelectedMoveGroupsArchived(prev => ({
                ...prev,
                [key]: targetGroup
            }))
        }
    }

    const handleMoveGroupAction = (groupNumber, memberName, roundNumber = null) => {
        const key = `${roundNumber ?? 'current'}-${groupNumber}-${memberName}`
        const targetGroup = roundNumber === null
            ? selectedMoveGroups[key]
            : selectedMoveGroupsArchived[key]

        if (!targetGroup) {
            setError('Please select a group to move to')
            return
        }

        handleRoundAction(groupNumber, 'movegroup', memberName, parseInt(targetGroup), roundNumber)
    }

    const getAvailableGroupsForRound = (currentGroupNumber, groups) => {
        return groups
            .map(g => g.groupNumber ?? 0)
            .filter(num => num !== currentGroupNumber)
    }

    // SignalR Connection Setup
    useEffect(() => {
        if (!validatedCode || !validatedHostId) {
            return
        }

        fetchAllData()

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
            fetchAllData()
        })

        connection.onclose(() => {
            console.log('SignalR connection closed')
            setConnectionStatus('disconnected')
        })

        connection.on('RoundGenerated', (data) => {
            console.log('RoundGenerated event received:', data)
            fetchCurrentRound()
            fetchArchivedRounds()
        })

        connection.on('RoundStarted', (data) => {
            console.log('RoundStarted event received:', data)
            fetchCurrentRound()
            fetchArchivedRounds()
        })

        connection.on('GroupEnded', (data) => {
            console.log('GroupEnded event received:', data)
            fetchCurrentRound()
        })

        connection.on('RoomExpired', (data) => {
            console.log('RoomExpired event received:', data)
            setError('This room has expired.')
            if (hubConnectionRef.current) {
                hubConnectionRef.current.stop()
            }
        })

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
                hubConnectionRef.current.stop()
                    .then(() => console.log('SignalR connection stopped'))
                    .catch(err => console.error('Error stopping SignalR:', err))
            }
        }
    }, [validatedCode, validatedHostId])

    const isRoundStarted = () => {
        if (!currentRound) return false
        if (Array.isArray(currentRound)) {
            return currentRound.length > 0 && currentRound[0].roundStarted
        }
        const groups = currentRound.groups ?? []
        return groups.length > 0 && (groups[0].roundStarted ?? currentRound.roundStarted ?? false)
    }

    const getCurrentGroups = () => {
        if (!currentRound) return []
        if (Array.isArray(currentRound)) {
            return currentRound
        }
        return currentRound.groups ?? []
    }

    const getAvailableGroups = (currentGroupNumber) => {
        const groups = getCurrentGroups()
        return groups
            .map(g => g.groupNumber ?? 0)
            .filter(num => num !== currentGroupNumber)
    }

    const roundStarted = isRoundStarted()
    const currentGroups = getCurrentGroups()

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Round Manager</h1>
                <div style={styles.headerActions}>
                    {connectionStatus === 'connected' && (
                        <span style={styles.liveIndicator}>● Live</span>
                    )}
                    <button
                        onClick={() => navigate(`/host/${encodeURIComponent(validatedCode)}/${encodeURIComponent(validatedHostId)}`)}
                        style={styles.backButton}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
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

            {/* Current Round Section */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    Current Round {roundStarted && <span style={styles.startedBadge}>● Started</span>}
                </h2>
                {currentGroups.length > 0 ? (
                    <div style={styles.groupsGrid}>
                        {currentGroups.map((group, idx) => {
                            const groupNumber = group.groupNumber ?? idx + 1
                            const members = group.members ?? group.participants ?? []
                            const winner = group.winner
                            const draw = group.draw

                            return (
                                <div key={idx} style={styles.groupCard}>
                                    <div style={styles.groupHeader}>
                                        <h3 style={styles.groupTitle}>Group {groupNumber}</h3>
                                        {winner && (
                                            <span style={styles.winnerBadge}>🏆 {winner}</span>
                                        )}
                                        {draw && !winner && (
                                            <span style={styles.drawBadge}>🤝 Draw</span>
                                        )}
                                    </div>

                                    <div style={styles.membersList}>
                                        {members.map((member, memberIdx) => {
                                            const memberName = member.name ?? member.id ?? 'Unknown'
                                            const moveGroupKey = `current-${groupNumber}-${memberName}`

                                            return (
                                                <div key={memberIdx} style={styles.memberRowExtended}>
                                                    <div style={styles.memberNameSection}>
                                                        <span style={styles.memberName}>
                                                            <span style={styles.memberDot}>●</span>
                                                            {memberName}
                                                        </span>
                                                        {roundStarted && !winner && (
                                                            <button
                                                                onClick={() => handleRoundAction(groupNumber, 'setwinner', memberName, 0)}
                                                                disabled={actionInProgress[`current-${groupNumber}-setwinner-${memberName}-0`]}
                                                                style={styles.inlineWinButton}
                                                            >
                                                                {actionInProgress[`current-${groupNumber}-setwinner-${memberName}-0`] ? '...' : '🏆 Win'}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div style={styles.moveGroupSection}>
                                                        <select
                                                            value={selectedMoveGroups[moveGroupKey] || ''}
                                                            onChange={(e) => handleMoveGroupChange(groupNumber, memberName, e.target.value)}
                                                            style={styles.moveGroupSelect}
                                                            disabled={actionInProgress[`current-${groupNumber}-movegroup-${memberName}-${selectedMoveGroups[moveGroupKey]}`]}
                                                        >
                                                            <option value="">Select Group...</option>
                                                            {getAvailableGroups(groupNumber).map(num => (
                                                                <option key={num} value={num}>Group {num}</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            onClick={() => handleMoveGroupAction(groupNumber, memberName)}
                                                            disabled={!selectedMoveGroups[moveGroupKey] || actionInProgress[`current-${groupNumber}-movegroup-${memberName}-${selectedMoveGroups[moveGroupKey]}`]}
                                                            style={styles.moveGroupButton}
                                                        >
                                                            {actionInProgress[`current-${groupNumber}-movegroup-${memberName}-${selectedMoveGroups[moveGroupKey]}`] ? '...' : 'Move Group'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {roundStarted && (
                                        <div style={styles.actionButtons}>
                                            {(winner || draw) && (
                                                <button
                                                    onClick={() => handleRoundAction(groupNumber, 'setnoresult', null, 0)}
                                                    disabled={actionInProgress[`current-${groupNumber}-setnoresult--0`]}
                                                    style={styles.resetButton}
                                                >
                                                    {actionInProgress[`current-${groupNumber}-setnoresult--0`] ? '...' : '🔄 Reset'}
                                                </button>
                                            )}
                                            {!draw && (
                                                <button
                                                    onClick={() => handleRoundAction(groupNumber, 'setdraw', null, 0)}
                                                    disabled={actionInProgress[`current-${groupNumber}-setdraw--0`]}
                                                    style={styles.drawButton}
                                                >
                                                    {actionInProgress[`current-${groupNumber}-setdraw--0`] ? '...' : '🤝 Mark Draw'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        No current round. Start a new round from the dashboard.
                    </div>
                )}
            </div>

            {/* Archived Rounds Section */}
            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Archived Rounds</h2>
                {archivedRounds.length > 0 ? (
                    <div style={styles.archivedRoundsContainer}>
                        {archivedRounds.map((round, roundIdx) => {
                            const groups = Array.isArray(round) ? round : round.groups ?? []
                            const roundNumber = roundIdx + 1
                            const roundStarted = groups.length > 0 && (groups[0].roundStarted ?? false)

                            return (
                                <div key={roundIdx} style={styles.archivedRoundCard}>
                                    <h3 style={styles.archivedRoundTitle}>
                                        Round {roundNumber}
                                        {roundStarted && <span style={styles.startedBadge}>● Started</span>}
                                    </h3>
                                    <div style={styles.groupsGrid}>
                                        {groups.map((group, groupIdx) => {
                                            const groupNumber = group.groupNumber ?? groupIdx + 1
                                            const members = group.members ?? group.participants ?? []
                                            const winner = group.winner
                                            const draw = group.draw

                                            return (
                                                <div key={groupIdx} style={styles.groupCard}>
                                                    <div style={styles.groupHeader}>
                                                        <h3 style={styles.groupTitle}>Group {groupNumber}</h3>
                                                        {winner && (
                                                            <span style={styles.winnerBadge}>🏆 {winner}</span>
                                                        )}
                                                        {draw && !winner && (
                                                            <span style={styles.drawBadge}>🤝 Draw</span>
                                                        )}
                                                    </div>

                                                    <div style={styles.membersList}>
                                                        {members.map((member, memberIdx) => {
                                                            const memberName = member.name ?? member.id ?? 'Unknown'
                                                            const moveGroupKey = `${roundNumber}-${groupNumber}-${memberName}`

                                                            return (
                                                                <div key={memberIdx} style={styles.memberRowExtended}>
                                                                    <div style={styles.memberNameSection}>
                                                                        <span style={styles.memberName}>
                                                                            <span style={styles.memberDot}>●</span>
                                                                            {memberName}
                                                                        </span>
                                                                        {!winner && (
                                                                            <button
                                                                                onClick={() => handleRoundAction(groupNumber, 'setwinner', memberName, 0, roundNumber)}
                                                                                disabled={actionInProgress[`${roundNumber}-${groupNumber}-setwinner-${memberName}-0`]}
                                                                                style={styles.inlineWinButton}
                                                                            >
                                                                                {actionInProgress[`${roundNumber}-${groupNumber}-setwinner-${memberName}-0`] ? '...' : '🏆 Win'}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div style={styles.moveGroupSection}>
                                                                        <select
                                                                            value={selectedMoveGroupsArchived[moveGroupKey] || ''}
                                                                            onChange={(e) => handleMoveGroupChange(groupNumber, memberName, e.target.value, roundNumber)}
                                                                            style={styles.moveGroupSelect}
                                                                            disabled={actionInProgress[`${roundNumber}-${groupNumber}-movegroup-${memberName}-${selectedMoveGroupsArchived[moveGroupKey]}`]}
                                                                        >
                                                                            <option value="">Select Group...</option>
                                                                            {getAvailableGroupsForRound(groupNumber, groups).map(num => (
                                                                                <option key={num} value={num}>Group {num}</option>
                                                                            ))}
                                                                        </select>
                                                                        <button
                                                                            onClick={() => handleMoveGroupAction(groupNumber, memberName, roundNumber)}
                                                                            disabled={!selectedMoveGroupsArchived[moveGroupKey] || actionInProgress[`${roundNumber}-${groupNumber}-movegroup-${memberName}-${selectedMoveGroupsArchived[moveGroupKey]}`]}
                                                                            style={styles.moveGroupButton}
                                                                        >
                                                                            {actionInProgress[`${roundNumber}-${groupNumber}-movegroup-${memberName}-${selectedMoveGroupsArchived[moveGroupKey]}`] ? '...' : 'Move Group'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>

                                            
                                                        <div style={styles.actionButtons}>
                                                            {(winner || draw) && (
                                                                <button
                                                                    onClick={() => handleRoundAction(groupNumber, 'setnoresult', null, 0, roundNumber)}
                                                                    disabled={actionInProgress[`${roundNumber}-${groupNumber}-setnoresult--0`]}
                                                                    style={styles.resetButton}
                                                                >
                                                                    {actionInProgress[`${roundNumber}-${groupNumber}-setnoresult--0`] ? '...' : '🔄 Reset'}
                                                                </button>
                                                            )}
                                                            {!draw && (
                                                                <button
                                                                    onClick={() => handleRoundAction(groupNumber, 'setdraw', null, 0, roundNumber)}
                                                                    disabled={actionInProgress[`${roundNumber}-${groupNumber}-setdraw--0`]}
                                                                    style={styles.drawButton}
                                                                >
                                                                    {actionInProgress[`${roundNumber}-${groupNumber}-setdraw--0`] ? '...' : '🤝 Mark Draw'}
                                                                </button>
                                                            )}
                                                        </div>
                                                  
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div style={styles.emptyState}>
                        No archived rounds yet.
                    </div>
                )}
            </div>
        </div>
    )
}