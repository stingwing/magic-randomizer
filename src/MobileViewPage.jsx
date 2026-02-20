import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiBase } from './api'
import { validateUrlParam } from './utils/validation'
import { calculateTimeRemaining } from './utils/timerUtils'
import { isInCustomGroup, getCustomGroupColor } from './utils/customGroupColors'
import RoomNav from './components/RoomNav'
import { styles } from './styles/MobileViewPage.styles'

function RoundCountdownTimer({ startedAtUtc, roundLength, roundStarted }) {
    const [timeRemaining, setTimeRemaining] = useState(null)

    useEffect(() => {
        if (!roundStarted || !startedAtUtc || !roundLength) {
            setTimeRemaining(null)
            return
        }

        const updateTimer = () => {
            const timerData = calculateTimeRemaining(startedAtUtc, roundLength)
            setTimeRemaining(timerData)
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [startedAtUtc, roundLength, roundStarted])

    if (!roundStarted || !timeRemaining) return null

    return (
        <div style={styles.timer}>
            <span style={styles.timerIcon}>⏱️</span>
            <span style={{
                ...styles.timerValue,
                color: timeRemaining.isNegative ? '#ff4444' : '#86efac'
            }}>
                {timeRemaining.display}
            </span>
        </div>
    )
}

export default function MobileViewPage() {
    const { code, participantId } = useParams()
    const navigate = useNavigate()
    
    const [validatedCode, setValidatedCode] = useState('')
    const [validatedParticipantId, setValidatedParticipantId] = useState('')
    const [viewData, setViewData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [selectedRound, setSelectedRound] = useState('current')

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

    const fetchViewData = async () => {
        if (!validatedCode) return
        
        const url = `${apiBase}/${encodeURIComponent(validatedCode)}/summary`
        setLoading(true)
        setError(null)
        
        try {
            const res = await fetch(url)
            if (res.status === 404) {
                setError('Room not found')
                return
            }
            if (!res.ok) {
                throw new Error('Unable to load room data')
            }
            
            const data = await res.json()
            
            // Transform summary data to match expected view structure
            setViewData({
                eventName: data.eventName,
                currentRound: data.currentRound,
                groups: data.currentGroups ?? [],
                archivedRounds: data.archivedRounds ?? [],
                settings: data.settings
            })
        } catch (err) {
            console.error('Error fetching view data', err)
            setError('Unable to load room data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (validatedCode) {
            fetchViewData()
            const interval = setInterval(fetchViewData, 10000)
            return () => clearInterval(interval)
        }
    }, [validatedCode])

    const { eventName, currentRound, groups, archivedRounds, settings } = viewData || {}
    const showPoints = settings?.usePoints === true

    // Determine which groups to display based on selected round
    const getDisplayGroups = () => {
        if (selectedRound === 'current') {
            return groups ?? []
        }
        
        const roundIndex = parseInt(selectedRound)
        if (archivedRounds && archivedRounds[roundIndex]) {
            const archived = archivedRounds[roundIndex]
            return Array.isArray(archived) ? archived : (archived.groups ?? [])
        }
        
        return []
    }

    const displayGroups = getDisplayGroups()
    const hasArchivedRounds = archivedRounds && archivedRounds.length > 0
    const hasCurrentRound = groups && groups.length > 0

    return (
        <div style={styles.container}>
            <RoomNav 
                roomCode={validatedCode} 
                participantId={validatedParticipantId}
                currentPage="view"
                allowCustomGroups={viewData?.settings?.allowPlayersToCreateCustomGroups}
            />
            
            {loading && !viewData ? (
                <div style={styles.loading}>Loading...</div>
            ) : error ? (
                <div style={styles.error}>
                    <span>⚠️</span> {error}
                </div>
            ) : !viewData ? (
                <div style={styles.noData}>No data available</div>
            ) : (
                <>
                    <div style={styles.header}>
                        <h1 style={styles.title}>{eventName || 'Room View'}</h1>
                        <div style={styles.codeDisplay}>
                            Room Code: <span style={styles.code}>{validatedCode}</span>
                        </div>
                        {currentRound !== undefined && (
                            <div style={styles.roundDisplay}>
                                Current Round: <span style={styles.roundNumber}>{currentRound}</span>
                            </div>
                        )}
                    </div>

                    {/* Round Tabs */}
                    {(hasArchivedRounds || hasCurrentRound) && (
                        <div style={styles.roundTabs}>
                            <div style={styles.tabsContainer}>
                                {archivedRounds?.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedRound(String(index))}
                                        style={{
                                            ...styles.tab,
                                            ...(selectedRound === String(index) ? styles.tabActive : {})
                                        }}
                                    >
                                        Round {index + 1}
                                    </button>
                                ))}
                                {hasCurrentRound && (
                                    <button
                                        onClick={() => setSelectedRound('current')}
                                        style={{
                                            ...styles.tab,
                                            ...(selectedRound === 'current' ? styles.tabActive : {})
                                        }}
                                    >
                                        Current Round
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={styles.content}>
                        {(!displayGroups || displayGroups.length === 0) ? (
                            <div style={styles.noGroups}>
                                <div style={styles.noGroupsIcon}>👥</div>
                                <p>No groups in this round.</p>
                                {selectedRound === 'current' && (
                                    <p style={styles.noGroupsSubtext}>Waiting for host to start the game...</p>
                                )}
                            </div>
                        ) : (
                            displayGroups.map((group, groupIndex) => (
                                <div key={groupIndex} style={styles.groupCard}>
                                    <div style={styles.groupHeader}>
                                        <h2 style={styles.groupTitle}>
                                            Group {group.groupNumber ?? groupIndex + 1}
                                        </h2>
                                        {selectedRound === 'current' && group.roundStarted && (
                                            <RoundCountdownTimer 
                                                startedAtUtc={group.startedAtUtc}
                                                roundLength={group.roundLength ?? settings?.roundLength}
                                                roundStarted={group.roundStarted}
                                            />
                                        )}
                                    </div>

                                    {group.result && (
                                        <div style={styles.resultBadge}>
                                            {group.winner ? (
                                                <span style={styles.resultWinner}>
                                                    🏆 Winner: {group.winner}
                                                </span>
                                            ) : group.draw ? (
                                                <span style={styles.resultDraw}>🤝 Draw</span>
                                            ) : (
                                                <span style={styles.resultComplete}>✅ Complete</span>
                                            )}
                                        </div>
                                    )}

                                    {group.members && group.members.length > 0 && (
                                        <ul style={styles.membersList}>
                                            {group.members
                                                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                                .map((member, idx) => {
                                                    const isYou = member.id === validatedParticipantId
                                                    const isDropped = member.dropped === true
                                                    const inCustom = isInCustomGroup(member.inCustomGroup)
                                                    const customGroupColor = inCustom ? getCustomGroupColor(member.inCustomGroup) : null
                                                    
                                                    return (
                                                        <li 
                                                            key={member.id ?? idx}
                                                            style={{
                                                                ...styles.memberItem,
                                                                ...(isYou ? styles.memberItemYou : {}),
                                                                ...(isDropped ? styles.memberItemDropped : {})
                                                            }}
                                                        >
                                                            <div style={styles.memberInfo}>
                                                                <span style={styles.memberName}>
                                                                    {member.name ?? member.id ?? 'Unknown'}
                                                                    {isYou && <span style={styles.badge}>YOU</span>}
                                                                    {isDropped && <span style={{...styles.badge, backgroundColor: '#ef4444'}}>DROPPED</span>}
                                                                    {inCustom && <span style={{...styles.badge, backgroundColor: customGroupColor}}>CUSTOM</span>}
                                                                </span>
                                                                {showPoints && (
                                                                    <span style={styles.memberPoints}>
                                                                        {member.points ?? 0} pts
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {member.commander && (
                                                                <div style={styles.memberCommander}>
                                                                    {member.commander}
                                                                </div>
                                                            )}
                                                        </li>
                                                    )
                                                })}
                                        </ul>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    )
}