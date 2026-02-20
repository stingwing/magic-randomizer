import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiBase } from './api'
import {
    validateCommander,
    validateTurnCount,
    validatePlayerOrder,
    validateWinCondition,
    validateBracket,
    validateUrlParam,
    RateLimiter
} from './utils/validation'
import { useCommanderSearch } from './utils/commanderSearch'
import { isInCustomGroup, getCustomGroupColor } from './utils/customGroupColors'
import RoomNav from './components/RoomNav'
import { styles } from './styles/RoomStatistics.styles'

const reportRateLimiter = new RateLimiter(10, 60000)

function DraggablePlayerOrder({ members, participantId, onOrderChange }) {
    const [orderedPlayers, setOrderedPlayers] = useState([])
    const [draggedIndex, setDraggedIndex] = useState(null)

    useEffect(() => {
        if (members && Array.isArray(members) && members.length > 0) {
            const activePlayers = members.filter(m => m.dropped !== true)
            const sorted = [...activePlayers].sort((a, b) => {
                if (a.order !== undefined && b.order !== undefined) {
                    return a.order - b.order
                }
                if (a.id === participantId) return -1
                if (b.id === participantId) return 1
                return 0
            })
            setOrderedPlayers(sorted)
        }
    }, [members, participantId])

    useEffect(() => {
        if (orderedPlayers.length > 0) {
            const orderString = orderedPlayers
                .map(player => player.name ?? player.id ?? 'Unknown')
                .join(', ')
            onOrderChange(orderString)
        }
    }, [orderedPlayers, onOrderChange])

    const handleDragStart = (e, index) => {
        setDraggedIndex(index)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === index) return

        const newOrder = [...orderedPlayers]
        const draggedItem = newOrder[draggedIndex]
        newOrder.splice(draggedIndex, 1)
        newOrder.splice(index, 0, draggedItem)
        setOrderedPlayers(newOrder)
        setDraggedIndex(index)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
    }

    const handleTouchStart = (e, index) => {
        setTimeout(() => {
            setDraggedIndex(index)
        }, 50)
    }

    const handleTouchMove = (e, index) => {
        if (draggedIndex === null) return
        e.preventDefault()
        
        const touch = e.touches[0]
        const element = document.elementFromPoint(touch.clientX, touch.clientY)
        const playerItem = element?.closest('[data-player-index]')
        
        if (playerItem) {
            const targetIndex = parseInt(playerItem.getAttribute('data-player-index'), 10)
            if (targetIndex !== draggedIndex && targetIndex >= 0 && targetIndex < orderedPlayers.length) {
                const newOrder = [...orderedPlayers]
                const draggedItem = newOrder[draggedIndex]
                newOrder.splice(draggedIndex, 1)
                newOrder.splice(targetIndex, 0, draggedItem)
                setOrderedPlayers(newOrder)
                setDraggedIndex(targetIndex)
            }
        }
    }

    const handleTouchEnd = () => {
        setDraggedIndex(null)
    }

    const movePlayerUp = (index) => {
        if (index === 0) return
        const newOrder = [...orderedPlayers]
        ;[newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]]
        setOrderedPlayers(newOrder)
    }

    const movePlayerDown = (index) => {
        if (index === orderedPlayers.length - 1) return
        const newOrder = [...orderedPlayers]
        ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
        setOrderedPlayers(newOrder)
    }

    if (!orderedPlayers || orderedPlayers.length === 0) {
        return <div style={styles.playerOrderEmpty}>No players available to order</div>
    }

    return (
        <div style={styles.playerOrderContainer}>
            {orderedPlayers.map((player, index) => {
                const isYou = player.id === participantId
                const inCustom = isInCustomGroup(player.inCustomGroup)
                const customGroupColor = inCustom ? getCustomGroupColor(player.inCustomGroup) : null
                
                return (
                    <div
                        key={player.id}
                        data-player-index={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => handleTouchStart(e, index)}
                        onTouchMove={(e) => handleTouchMove(e, index)}
                        onTouchEnd={handleTouchEnd}
                        style={{
                            ...styles.playerOrderItem,
                            ...(draggedIndex === index ? styles.playerOrderItemDragging : {}),
                            ...(isYou ? styles.playerOrderItemYou : {})
                        }}
                    >
                        <div style={styles.playerOrderDragHandle}>☰</div>
                        <div style={styles.playerOrderInfo}>
                            <span style={styles.playerOrderNumber}>{index + 1}</span>
                            <span style={styles.playerOrderName}>
                                {player.name ?? player.id ?? 'Unknown'}
                                {isYou && <span style={styles.youBadge}>YOU</span>}
                                {inCustom && <span style={{ ...styles.youBadge, backgroundColor: customGroupColor }}>CUSTOM</span>}
                            </span>
                        </div>
                        <div style={styles.playerOrderButtons}>
                            <button
                                type="button"
                                onClick={() => movePlayerUp(index)}
                                disabled={index === 0}
                                style={{
                                    ...styles.orderButton,
                                    ...(index === 0 ? styles.orderButtonDisabled : {})
                                }}
                            >▲</button>
                            <button
                                type="button"
                                onClick={() => movePlayerDown(index)}
                                disabled={index === orderedPlayers.length - 1}
                                style={{
                                    ...styles.orderButton,
                                    ...(index === orderedPlayers.length - 1 ? styles.orderButtonDisabled : {})
                                }}
                            >▼</button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default function RoomStatistics() {
    const { code, participantId } = useParams()
    const navigate = useNavigate()
    
    const [validatedCode, setValidatedCode] = useState('')
    const [validatedParticipantId, setValidatedParticipantId] = useState('')
    const [groupResult, setGroupResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    
    const [commander, setCommander] = useState('')
    const [partner, setPartner] = useState('')
    const [showPartner, setShowPartner] = useState(false)
    const [turnCount, setTurnCount] = useState('')
    const [playerOrder, setPlayerOrder] = useState('')
    const [winCondition, setWinCondition] = useState('')
    const [bracket, setBracket] = useState('')
    const [validationErrors, setValidationErrors] = useState({})
    
    const commanderSearch = useCommanderSearch(300)
    const partnerSearch = useCommanderSearch(300)

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

    const fetchGroupResult = useCallback(async () => {
        if (!validatedCode || !validatedParticipantId) return
        
        const url = `${apiBase}/${encodeURIComponent(validatedCode)}/group/${encodeURIComponent(validatedParticipantId)}`
        setLoading(true)
        
        try {
            const res = await fetch(url)
            if (res.status === 404 || res.status === 204) {
                setError('Group not found. Game may not have started yet.')
                return
            }
            if (!res.ok) throw new Error('Unable to fetch group information')
            
            const data = await res.json()
            setGroupResult(data)
            
            // Populate fields from API
            if (data.members && Array.isArray(data.members)) {
                const currentMember = data.members.find(m => m.id === validatedParticipantId)
                if (currentMember?.commander) {
                    const commanderValue = currentMember.commander.trim()
                    if (commanderValue.includes(' : ')) {
                        const [cmd, prt] = commanderValue.split(' : ')
                        setCommander(cmd.trim())
                        setPartner(prt.trim())
                        setShowPartner(true)
                    } else {
                        setCommander(commanderValue)
                    }
                }
            }
            
            if (data.statistics) {
                if (data.statistics.Bracket) {
                    const validated = validateBracket(data.statistics.Bracket)
                    if (validated.valid) setBracket(validated.sanitized)
                }
                if (data.statistics.TurnCount) {
                    const validated = validateTurnCount(data.statistics.TurnCount)
                    if (validated.valid) setTurnCount(validated.sanitized)
                }
                if (data.statistics.PlayerOrder) {
                    const validated = validatePlayerOrder(data.statistics.PlayerOrder)
                    if (validated.valid) setPlayerOrder(validated.sanitized)
                }
                if (data.statistics.WinCondition) {
                    const validated = validateWinCondition(data.statistics.WinCondition)
                    if (validated.valid) setWinCondition(validated.sanitized)
                }
            }
        } catch (err) {
            console.error('Error fetching group result', err)
            setError('Unable to load group information')
        } finally {
            setLoading(false)
        }
    }, [validatedCode, validatedParticipantId])

    useEffect(() => {
        if (validatedCode && validatedParticipantId) {
            fetchGroupResult()
        }
    }, [validatedCode, validatedParticipantId, fetchGroupResult])

    const handleCommanderChange = (e) => {
        const value = e.target.value
        const validated = validateCommander(value)
        setCommander(validated.sanitized)
        
        if (validated.error) {
            setValidationErrors(prev => ({ ...prev, commander: validated.error }))
        } else {
            setValidationErrors(prev => {
                const { commander, ...rest } = prev
                return rest
            })
        }
        commanderSearch.debouncedSearch(validated.sanitized)
    }

    const handleCommanderSelect = (commanderName) => {
        const validated = validateCommander(commanderName)
        setCommander(validated.sanitized)
        commanderSearch.setShowDropdown(false)
        commanderSearch.clearSearch()
        setValidationErrors(prev => {
            const { commander, ...rest } = prev
            return rest
        })
    }

    const handlePartnerChange = (e) => {
        const value = e.target.value
        const validated = validateCommander(value)
        setPartner(validated.sanitized)
        
        if (validated.error) {
            setValidationErrors(prev => ({ ...prev, partner: validated.error }))
        } else {
            setValidationErrors(prev => {
                const { partner, ...rest } = prev
                return rest
            })
        }
        partnerSearch.debouncedSearch(validated.sanitized)
    }

    const handlePartnerSelect = (partnerName) => {
        const validated = validateCommander(partnerName)
        setPartner(validated.sanitized)
        partnerSearch.setShowDropdown(false)
        partnerSearch.clearSearch()
        setValidationErrors(prev => {
            const { partner, ...rest } = prev
            return rest
        })
    }

    const handlePlayerOrderChange = useCallback((orderString) => {
        const validated = validatePlayerOrder(orderString)
        setPlayerOrder(validated.sanitized)
        
        if (validated.error) {
            setValidationErrors(prev => ({ ...prev, playerOrder: validated.error }))
        } else {
            setValidationErrors(prev => {
                const { playerOrder, ...rest } = prev
                return rest
            })
        }
    }, [])

    const buildStatistics = () => {
        const statistics = {}
        
        const commanderVal = validateCommander(commander)
        const partnerVal = validateCommander(partner)
        const turnCountVal = validateTurnCount(turnCount)
        const playerOrderVal = validatePlayerOrder(playerOrder)
        const winConditionVal = validateWinCondition(winCondition)
        const bracketVal = validateBracket(bracket)
        
        if (commanderVal.sanitized && commanderVal.valid) {
            let commanderValue = commanderVal.sanitized
            if (partnerVal.sanitized && partnerVal.valid) {
                commanderValue = `${commanderVal.sanitized} : ${partnerVal.sanitized}`
            }
            statistics[`${validatedParticipantId}_Commander`] = commanderValue
        }
        
        if (turnCountVal.sanitized && turnCountVal.valid) {
            statistics['TurnCount'] = turnCountVal.sanitized
        }
        if (playerOrderVal.sanitized && playerOrderVal.valid) {
            statistics['PlayerOrder'] = playerOrderVal.sanitized
        }
        if (bracketVal.sanitized && bracketVal.valid) {
            statistics['Bracket'] = bracketVal.sanitized
        }
        if (winConditionVal.sanitized && winConditionVal.valid) {
            statistics['WinCondition'] = winConditionVal.sanitized
        }

        return statistics
    }

    const handleSave = async () => {
        if (!validatedCode || !validatedParticipantId) return

        if (Object.keys(validationErrors).length > 0) {
            setError('Please fix validation errors before saving')
            return
        }

        if (!reportRateLimiter.canAttempt(validatedParticipantId)) {
            setError('Too many attempts. Please wait a moment.')
            return
        }

        setLoading(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const url = `${apiBase}/${encodeURIComponent(validatedCode)}/report`
            const statistics = buildStatistics()

            const commanderVal = validateCommander(commander)
            const partnerVal = validateCommander(partner)
            let commanderValue = ''

            if (commanderVal.sanitized && commanderVal.valid) {
                commanderValue = commanderVal.sanitized
                if (partnerVal.sanitized && partnerVal.valid) {
                    commanderValue = `${commanderVal.sanitized} : ${partnerVal.sanitized}`
                }
            }

            const body = {
                participantId: validatedParticipantId,
                result: 'data',
                commander: commanderValue,
                statistics: statistics
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (!res.ok) {
                throw new Error(res.status === 400 ? 'Invalid request' : 'Unable to save statistics')
            }

            const data = await res.json()
            
            if (data && groupResult) {
                setGroupResult(prev => ({
                    ...prev,
                    members: data.members || prev.members,
                    statistics: data.statistics || prev.statistics
                }))
            }

            setSuccessMessage('Statistics saved successfully!')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            console.error('Save error', err)
            setError(err.message || 'Unable to save statistics')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            <RoomNav 
                roomCode={validatedCode} 
                participantId={validatedParticipantId}
                currentPage="statistics"
                allowCustomGroups={groupResult?.settings?.allowPlayersToCreateCustomGroups}
            />
            
            <div style={styles.content}>
                <div style={styles.pageHeader}>
                    <h1 style={styles.title}>Game Statistics</h1>
                    <p style={styles.subtitle}>Update your commander and game details</p>
                </div>

                {error && (
                    <div style={styles.errorBanner}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                {successMessage && (
                    <div style={styles.successBanner}>
                        <span>✅</span> {successMessage}
                    </div>
                )}

                {/* Commander Section */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Your Commander</h2>
                    <p style={styles.cardDescription}>Select your Commander for this game</p>
                    
                    <label style={styles.inputLabel}>
                        Commander
                        <div style={{ position: 'relative' }}>
                            <input
                                ref={commanderSearch.inputRef}
                                type="text"
                                value={commander}
                                onChange={handleCommanderChange}
                                placeholder="Start typing to search..."
                                style={{
                                    ...styles.textInput,
                                    ...(validationErrors.commander ? styles.inputError : {})
                                }}
                                disabled={loading}
                                maxLength={100}
                            />
                            {commanderSearch.showDropdown && commanderSearch.results.length > 0 && (
                                <div ref={commanderSearch.dropdownRef} style={styles.dropdown}>
                                    {commanderSearch.results.map((result, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleCommanderSelect(result)}
                                            style={styles.dropdownItem}
                                        >
                                            {result}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {validationErrors.commander && (
                            <span style={styles.validationError}>{validationErrors.commander}</span>
                        )}
                    </label>

                    <label style={styles.inputLabel}>
                        Partner (Optional)
                        <div style={{ position: 'relative' }}>
                            <input
                                ref={partnerSearch.inputRef}
                                type="text"
                                value={partner}
                                onChange={handlePartnerChange}
                                placeholder="Start typing to search..."
                                style={{
                                    ...styles.textInput,
                                    ...(validationErrors.partner ? styles.inputError : {})
                                }}
                                disabled={loading}
                                maxLength={100}
                            />
                            {partnerSearch.showDropdown && partnerSearch.results.length > 0 && (
                                <div ref={partnerSearch.dropdownRef} style={styles.dropdown}>
                                    {partnerSearch.results.map((result, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handlePartnerSelect(result)}
                                            style={styles.dropdownItem}
                                        >
                                            {result}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {validationErrors.partner && (
                            <span style={styles.validationError}>{validationErrors.partner}</span>
                        )}
                    </label>
                </div>

                {/* Game Statistics Section */}
                {groupResult?.roundStarted && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Game Details</h2>
                        <p style={styles.cardDescription}>Track details about your game (optional)</p>
                        
                        <label style={styles.inputLabel}>
                            Bracket
                            <input
                                type="number"
                                value={bracket}
                                onChange={(e) => {
                                    const validated = validateBracket(e.target.value)
                                    setBracket(validated.sanitized)
                                }}
                                placeholder="Average Bracket (1-5)"
                                style={styles.textInput}
                                disabled={loading}
                                min="1"
                                max="5"
                            />
                        </label>

                        <label style={styles.inputLabel}>
                            Turn Count
                            <input
                                type="number"
                                value={turnCount}
                                onChange={(e) => {
                                    const validated = validateTurnCount(e.target.value)
                                    setTurnCount(validated.sanitized)
                                }}
                                placeholder="Number of turns"
                                style={styles.textInput}
                                disabled={loading}
                                min="0"
                                max="999"
                            />
                        </label>

                        <label style={styles.inputLabel}>
                            Win Condition
                            <textarea
                                value={winCondition}
                                onChange={(e) => {
                                    const validated = validateWinCondition(e.target.value)
                                    setWinCondition(validated.sanitized)
                                    if (validated.error) {
                                        setValidationErrors(prev => ({ ...prev, winCondition: validated.error }))
                                    } else {
                                        setValidationErrors(prev => {
                                            const { winCondition, ...rest } = prev
                                            return rest
                                        })
                                    }
                                }}
                                placeholder="How the game was won"
                                style={{
                                    ...styles.textInput,
                                    ...(validationErrors.winCondition ? styles.inputError : {}),
                                    minHeight: '80px',
                                    resize: 'vertical'
                                }}
                                disabled={loading}
                                maxLength={200}
                                rows={3}
                            />
                            {validationErrors.winCondition && (
                                <span style={styles.validationError}>{validationErrors.winCondition}</span>
                            )}
                        </label>

                        <label style={styles.inputLabel}>
                            Player Order
                            <DraggablePlayerOrder 
                                members={groupResult.members}
                                participantId={validatedParticipantId}
                                onOrderChange={handlePlayerOrderChange}
                            />
                            {validationErrors.playerOrder && (
                                <span style={styles.validationError}>{validationErrors.playerOrder}</span>
                            )}
                        </label>
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={loading || Object.keys(validationErrors).length > 0}
                    style={{
                        ...styles.saveButton,
                        ...(Object.keys(validationErrors).length > 0 || loading ? styles.saveButtonDisabled : {})
                    }}
                >
                    {loading ? 'Saving...' : 'Save Statistics'}
                </button>
            </div>
        </div>
    )
}