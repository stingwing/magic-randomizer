import { useState, useMemo } from 'react'
import { styles } from '../styles/GameStatistics.styles'

export default function GameStatistics({ archivedRounds, currentRound, totalSessions }) {
    const [activeTab, setActiveTab] = useState('commanders')
    const [sortColumn, setSortColumn] = useState(null)
    const [sortDirection, setSortDirection] = useState('desc') // 'asc' or 'desc'
    const [groupByName, setGroupByName] = useState(false)

    const handleSort = (column) => {
        if (sortColumn === column) {
            // Toggle direction if same column
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            // New column, default to descending
            setSortColumn(column)
            setSortDirection('desc')
        }
    }

    // Helper function to get the player grouping key
    const getPlayerKey = (member) => {
        if (groupByName) {
            return member.name || member.id || 'Unknown'
        } else {
            // Use userId if available, otherwise use id
            return member.userId || member.id || 'Unknown'
        }
    }

    const sortData = (data, column, direction) => {
        if (!column) return data

        return [...data].sort((a, b) => {
            let aVal = a[column]
            let bVal = b[column]

            // Convert percentage strings to numbers for proper sorting
            if (typeof aVal === 'string' && aVal.includes('%')) {
                aVal = parseFloat(aVal)
                bVal = parseFloat(bVal)
            }
            // Also handle numeric strings (like "25.00" for winRate/drawRate)
            else if (typeof aVal === 'string' && !isNaN(parseFloat(aVal)) && isFinite(aVal)) {
                const aNum = parseFloat(aVal)
                const bNum = parseFloat(bVal)
                // Only use numeric comparison if both are valid numbers
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    aVal = aNum
                    bVal = bNum
                }
            }

            // Handle numeric vs string comparison
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return direction === 'asc' ? aVal - bVal : bVal - aVal
            } else {
                // String comparison
                const comparison = String(aVal).localeCompare(String(bVal))
                return direction === 'asc' ? comparison : -comparison
            }
        })
    }

    // Calculate commander statistics
    const commanderStats = useMemo(() => {
        const stats = {}
        
        // Get all groups from archived rounds and current round
        const allGroups = []
        
        if (archivedRounds && Array.isArray(archivedRounds)) {
            archivedRounds.forEach(round => {
                const groups = Array.isArray(round) ? round : (round.groups || [])
                allGroups.push(...groups)
            })
        }
        
        if (currentRound) {
            const groups = Array.isArray(currentRound) ? currentRound : (currentRound.groups || [])
            allGroups.push(...groups)
        }

        // Process each group
        allGroups.forEach(group => {
            const members = group.members || group.participants || []
            const winner = group.winner
            const draw = group.draw

            // Count no result as a draw
            const isDraw = draw || (!winner)

            members.forEach(member => {
                let commander = member.commander
                const playerId = member.id || 'Unknown'
                const playerKey = getPlayerKey(member)
                const playerName = member.name || member.id || 'Unknown'

                // Skip if no commander
                if (!commander || commander.trim() === '') return

                // Initialize stats for this commander if not exists
                if (!stats[commander]) {
                    stats[commander] = {
                        commander: commander,
                        timesPlayed: 0,
                        wins: 0,
                        draws: 0,
                        players: new Set(),
                        playerNames: {}
                    }
                }

                stats[commander].timesPlayed++
                stats[commander].players.add(playerKey)
                // Track the frequency of player names for this key
                if (playerKey !== 'Unknown') {
                    if (!stats[commander].playerNames[playerKey]) {
                        stats[commander].playerNames[playerKey] = {}
                    }
                    stats[commander].playerNames[playerKey][playerName] = 
                        (stats[commander].playerNames[playerKey][playerName] || 0) + 1
                }

                // Check if this player won (winner is always stored as id)
                if (winner && (winner === playerId)) {
                    stats[commander].wins++
                }

                // Check if this was a draw (or no result)
                if (isDraw) {
                    stats[commander].draws++
                }
            })
        })

        // Convert to array and calculate rates
        return Object.values(stats).map(stat => {
            // Convert player keys to names for display - pick most frequent name for each player
            const playersList = Array.from(stat.players)
                .map(playerKey => {
                    if (groupByName) {
                        return playerKey
                    }
                    // Find most frequent name for this playerKey
                    const nameFrequencies = stat.playerNames[playerKey]
                    if (!nameFrequencies) {
                        return playerKey
                    }
                    let mostFrequentName = playerKey
                    let maxCount = 0
                    Object.entries(nameFrequencies).forEach(([name, count]) => {
                        if (count > maxCount) {
                            maxCount = count
                            mostFrequentName = name
                        }
                    })
                    return mostFrequentName
                })
                .join(', ')

            return {
                commander: stat.commander,
                timesPlayed: stat.timesPlayed,
                wins: stat.wins,
                draws: stat.draws,
                winRate: stat.timesPlayed > 0 ? ((stat.wins / stat.timesPlayed) * 100).toFixed(2) : '0.00',
                drawRate: stat.timesPlayed > 0 ? ((stat.draws / stat.timesPlayed) * 100).toFixed(2) : '0.00',
                playersList: playersList
            }
        }).sort((a, b) => b.timesPlayed - a.timesPlayed)
    }, [archivedRounds, currentRound, groupByName])

    // Calculate seat position statistics
    const seatStats = useMemo(() => {
        const stats = {
            1: { seat: 1, games: 0, wins: 0, draws: 0 },
            2: { seat: 2, games: 0, wins: 0, draws: 0 },
            3: { seat: 3, games: 0, wins: 0, draws: 0 },
            4: { seat: 4, games: 0, wins: 0, draws: 0 },
            5: { seat: 5, games: 0, wins: 0, draws: 0 },
            6: { seat: 6, games: 0, wins: 0, draws: 0 }
        }

        // Get all groups
        const allGroups = []

        if (archivedRounds && Array.isArray(archivedRounds)) {
            archivedRounds.forEach(round => {
                const groups = Array.isArray(round) ? round : (round.groups || [])
                allGroups.push(...groups)
            })
        }

        if (currentRound) {
            const groups = Array.isArray(currentRound) ? currentRound : (currentRound.groups || [])
            allGroups.push(...groups)
        }

        // Process each group
        allGroups.forEach(group => {
            const members = group.members || group.participants || []
            const winner = group.winner
            const draw = group.draw

            // Only process if we have members
            if (members.length > 0) {
                // Sort members by their order property, then filter out dropped players
                const activePlayers = members.filter(m => m.dropped !== true)
                const sortedPlayers = [...activePlayers].sort((a, b) => {
                    if (a.order !== undefined && b.order !== undefined) {
                        return a.order - b.order
                    }
                    return 0
                })

                const numPlayers = sortedPlayers.length

                // Count no result as a draw
                const isDraw = draw || (!winner)

                if (isDraw) {
                    // If it's a draw, increment draws for all seats
                    for (let i = 1; i <= numPlayers; i++) {
                        if (stats[i]) {
                            stats[i].draws++
                            stats[i].games++
                        }
                    }
                } else if (winner) {
                    // Find which position the winner is in based on sorted player order (winner is always stored as id)
                    const winnerPosition = sortedPlayers.findIndex(player => player.id === winner)

                    if (winnerPosition !== -1) {
                        const seatNumber = winnerPosition + 1 // Convert 0-indexed to 1-indexed

                        // Track this game for the seat
                        if (stats[seatNumber]) {
                            stats[seatNumber].wins++
                        }
                    }

                    // Count total games for each seat that exists
                    for (let i = 1; i <= numPlayers; i++) {
                        if (stats[i]) {
                            stats[i].games++
                        }
                    }
                }
            }
        })

        // Convert to array and calculate win rates and draw rates
        return Object.values(stats)
            .filter(stat => stat.games > 0) // Only show seats that have data
            .map(stat => ({
                ...stat,
                winRate: stat.games > 0 ? ((stat.wins / stat.games) * 100).toFixed(2) : '0.00',
                drawRate: stat.games > 0 ? ((stat.draws / stat.games) * 100).toFixed(2) : '0.00'
            }))
            .sort((a, b) => a.seat - b.seat)
    }, [archivedRounds, currentRound])

    // Calculate player count statistics
    const playerCountStats = useMemo(() => {
        const stats = {
            3: { playerCount: 3, games: 0, wins: 0, draws: 0 },
            4: { playerCount: 4, games: 0, wins: 0, draws: 0 },
            5: { playerCount: 5, games: 0, wins: 0, draws: 0 },
            6: { playerCount: 6, games: 0, wins: 0, draws: 0 }
        }

        // Get all groups
        const allGroups = []

        if (archivedRounds && Array.isArray(archivedRounds)) {
            archivedRounds.forEach(round => {
                const groups = Array.isArray(round) ? round : (round.groups || [])
                allGroups.push(...groups)
            })
        }

        if (currentRound) {
            const groups = Array.isArray(currentRound) ? currentRound : (currentRound.groups || [])
            allGroups.push(...groups)
        }

        // Process each group
        allGroups.forEach(group => {
            const members = group.members || group.participants || []
            const activePlayers = members.filter(m => m.dropped !== true)
            const playerCount = activePlayers.length
            const winner = group.winner
            const draw = group.draw

            // Count no result as a draw
            const isDraw = draw || (!winner)

            // Only track if we have a valid player count
            if (stats[playerCount]) {
                stats[playerCount].games++

                if (isDraw) {
                    stats[playerCount].draws++
                } else if (winner) {
                    stats[playerCount].wins++
                }
            }
        })

        // Convert to array and calculate percentages
        return Object.values(stats)
            .filter(stat => stat.games > 0) // Only show player counts that have data
            .map(stat => ({
                ...stat,
                percentage: stat.games > 0 ? ((stat.games / allGroups.length) * 100).toFixed(2) : '0.00',
                winRate: stat.games > 0 ? ((stat.wins / stat.games) * 100).toFixed(2) : '0.00',
                drawRate: stat.games > 0 ? ((stat.draws / stat.games) * 100).toFixed(2) : '0.00'
            }))
            .sort((a, b) => a.playerCount - b.playerCount)
    }, [archivedRounds, currentRound])

    // Calculate player statistics
    const playerStats = useMemo(() => {
        const stats = {}
        
        // Get all groups
        const allGroups = []
        
        if (archivedRounds && Array.isArray(archivedRounds)) {
            archivedRounds.forEach(round => {
                const groups = Array.isArray(round) ? round : (round.groups || [])
                allGroups.push(...groups)
            })
        }
        
        if (currentRound) {
            const groups = Array.isArray(currentRound) ? currentRound : (currentRound.groups || [])
            allGroups.push(...groups)
        }

        // Process each group
        allGroups.forEach(group => {
            const members = group.members || group.participants || []
            const winner = group.winner
            const draw = group.draw

            // Count no result as a draw
            const isDraw = draw || (!winner)

            members.forEach(member => {
                const playerId = member.id || 'Unknown'
                const playerKey = getPlayerKey(member)
                const playerName = member.name || member.id || 'Unknown'

                // Initialize stats for this player if not exists
                if (!stats[playerKey]) {
                    stats[playerKey] = {
                        playerId: playerKey,
                        player: playerName,
                        playerNames: { [playerName]: 1 }, // Track name frequencies
                        games: 0,
                        wins: 0,
                        draws: 0,
                        losses: 0,
                        commanders: new Set(),
                        commanderCount: {}
                    }
                } else if (!groupByName) {
                    // When grouping by userId, track name frequencies
                    stats[playerKey].playerNames[playerName] = 
                        (stats[playerKey].playerNames[playerName] || 0) + 1
                }

                stats[playerKey].games++

                // Track commander
                if (member.commander && member.commander.trim() !== '') {
                    stats[playerKey].commanders.add(member.commander)
                    stats[playerKey].commanderCount[member.commander] = 
                        (stats[playerKey].commanderCount[member.commander] || 0) + 1
                }

                // Check if this player won (winner is always stored as id)
                if (winner && (winner === playerId)) {
                    stats[playerKey].wins++
                } else if (isDraw) {
                    stats[playerKey].draws++
                } else if (winner) {
                    // Only count as loss if there was a winner and it wasn't this player
                    stats[playerKey].losses++
                }
            })
        })

        // Convert to array and calculate rates
        return Object.values(stats).map(stat => {
            // Find most used commander
            let mostUsedCommander = '-'
            let maxCount = 0
            Object.entries(stat.commanderCount).forEach(([commander, count]) => {
                if (count > maxCount) {
                    maxCount = count
                    mostUsedCommander = commander
                }
            })

            // Display most frequent name when grouping by userId
            const displayName = groupByName 
                ? stat.player 
                : (() => {
                    // Find most frequent name
                    let mostFrequentName = stat.player
                    let maxCount = 0
                    Object.entries(stat.playerNames).forEach(([name, count]) => {
                        if (count > maxCount) {
                            maxCount = count
                            mostFrequentName = name
                        }
                    })
                    return mostFrequentName
                })()

            return {
                ...stat,
                player: displayName,
                winRate: stat.games > 0 ? ((stat.wins / stat.games) * 100).toFixed(2) : '0.00',
                drawRate: stat.games > 0 ? ((stat.draws / stat.games) * 100).toFixed(2) : '0.00',
                commandersCount: stat.commanders.size,
                mostUsedCommander: mostUsedCommander
            }
        }).sort((a, b) => b.games - a.games)
    }, [archivedRounds, currentRound, groupByName])

    const renderCommanderStats = () => {
        if (commanderStats.length === 0) {
            return <div style={styles.emptyState}>No commander data available</div>
        }

        const sortedData = sortData(commanderStats, sortColumn, sortDirection)
        const getSortIndicator = (column) => {
            if (sortColumn !== column) return ' ↕️'
            return sortDirection === 'asc' ? ' ▲' : ' ▼'
        }

        return (
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('commander')}>
                                Commander{getSortIndicator('commander')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('timesPlayed')}>
                                Times Played{getSortIndicator('timesPlayed')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('wins')}>
                                Wins{getSortIndicator('wins')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('draws')}>
                                Draws{getSortIndicator('draws')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('winRate')}>
                                Win Rate{getSortIndicator('winRate')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('drawRate')}>
                                Draw Rate{getSortIndicator('drawRate')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('playersList')}>
                                Players{getSortIndicator('playersList')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((stat, idx) => (
                            <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                                <td style={styles.td}>{stat.commander}</td>
                                <td style={styles.tdCenter}>{stat.timesPlayed}</td>
                                <td style={styles.tdCenter}>{stat.wins}</td>
                                <td style={styles.tdCenter}>{stat.draws}</td>
                                <td style={styles.tdCenter}>{stat.winRate}%</td>
                                <td style={styles.tdCenter}>{stat.drawRate}%</td>
                                <td style={styles.td}>{stat.playersList}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    const renderPlayerStats = () => {
        if (playerStats.length === 0) {
            return <div style={styles.emptyState}>No player data available</div>
        }

        const sortedData = sortData(playerStats, sortColumn, sortDirection)
        const getSortIndicator = (column) => {
            if (sortColumn !== column) return ' ↕️'
            return sortDirection === 'asc' ? ' ▲' : ' ▼'
        }

        return (
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('player')}>
                                Player{getSortIndicator('player')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('games')}>
                                Games{getSortIndicator('games')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('wins')}>
                                Wins{getSortIndicator('wins')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('draws')}>
                                Draws{getSortIndicator('draws')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('winRate')}>
                                Win Rate{getSortIndicator('winRate')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('drawRate')}>
                                Draw Rate{getSortIndicator('drawRate')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('commandersCount')}>
                                Commanders{getSortIndicator('commandersCount')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('mostUsedCommander')}>
                                Most Used{getSortIndicator('mostUsedCommander')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((stat, idx) => (
                            <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                                <td style={styles.td}>{stat.player}</td>
                                <td style={styles.tdCenter}>{stat.games}</td>
                                <td style={styles.tdCenter}>{stat.wins}</td>
                                <td style={styles.tdCenter}>{stat.draws}</td>
                                <td style={styles.tdCenter}>{stat.winRate}%</td>
                                <td style={styles.tdCenter}>{stat.drawRate}%</td>
                                <td style={styles.tdCenter}>{stat.commandersCount}</td>
                                <td style={styles.td}>{stat.mostUsedCommander}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    const renderSeatStats = () => {
        if (seatStats.length === 0) {
            return <div style={styles.emptyState}>No seat position data available</div>
        }

        const sortedData = sortData(seatStats, sortColumn, sortDirection)
        const getSortIndicator = (column) => {
            if (sortColumn !== column) return ' ↕️'
            return sortDirection === 'asc' ? ' ▲' : ' ▼'
        }

        return (
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('seat')}>
                                Seat Position{getSortIndicator('seat')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('games')}>
                                Games{getSortIndicator('games')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('wins')}>
                                Wins{getSortIndicator('wins')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('draws')}>
                                Draws{getSortIndicator('draws')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('winRate')}>
                                Win Rate{getSortIndicator('winRate')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('drawRate')}>
                                Draw Rate{getSortIndicator('drawRate')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((stat, idx) => (
                            <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                                <td style={styles.td}>Seat {stat.seat}</td>
                                <td style={styles.tdCenter}>{stat.games}</td>
                                <td style={styles.tdCenter}>{stat.wins}</td>
                                <td style={styles.tdCenter}>{stat.draws}</td>
                                <td style={styles.tdCenter}>{stat.winRate}%</td>
                                <td style={styles.tdCenter}>{stat.drawRate}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    const renderPlayerCountStats = () => {
        if (playerCountStats.length === 0) {
            return <div style={styles.emptyState}>No player count data available</div>
        }

        const sortedData = sortData(playerCountStats, sortColumn, sortDirection)
        const getSortIndicator = (column) => {
            if (sortColumn !== column) return ' ↕️'
            return sortDirection === 'asc' ? ' ▲' : ' ▼'
        }

        return (
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('playerCount')}>
                                Player Count{getSortIndicator('playerCount')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('games')}>
                                Games{getSortIndicator('games')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('wins')}>
                                Wins{getSortIndicator('wins')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('draws')}>
                                Draws{getSortIndicator('draws')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('percentage')}>
                                % of Total{getSortIndicator('percentage')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('winRate')}>
                                Win Rate{getSortIndicator('winRate')}
                            </th>
                            <th style={{...styles.th, cursor: 'pointer'}} onClick={() => handleSort('drawRate')}>
                                Draw Rate{getSortIndicator('drawRate')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((stat, idx) => (
                            <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                                <td style={styles.td}>{stat.playerCount} Players</td>
                                <td style={styles.tdCenter}>{stat.games}</td>
                                <td style={styles.tdCenter}>{stat.wins}</td>
                                <td style={styles.tdCenter}>{stat.draws}</td>
                                <td style={styles.tdCenter}>{stat.percentage}%</td>
                                <td style={styles.tdCenter}>{stat.winRate}%</td>
                                <td style={styles.tdCenter}>{stat.drawRate}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    const renderSummaryCards = () => {
        // Calculate total games (count of all groups across all rounds)
        let totalGames = 0

        if (archivedRounds && Array.isArray(archivedRounds)) {
            archivedRounds.forEach(round => {
                const groups = Array.isArray(round) ? round : (round.groups || [])
                totalGames += groups.length
            })
        }

        if (currentRound) {
            const groups = Array.isArray(currentRound) ? currentRound : (currentRound.groups || [])
            totalGames += groups.length
        }

        // Total sessions = number of selected rooms (if provided), otherwise estimate
        const sessionsCount = totalSessions !== undefined 
            ? totalSessions 
            : Math.floor(commanderStats.reduce((sum, stat) => sum + stat.timesPlayed, 0) / 4)

        const totalPlayers = playerStats.length
        const totalCommanders = commanderStats.length

        return (
            <div style={styles.summaryCards}>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryCardTitle}>Total Sessions</div>
                    <div style={styles.summaryCardValue}>{sessionsCount}</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryCardTitle}>Total Games</div>
                    <div style={styles.summaryCardValue}>{totalGames}</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryCardTitle}>Total Players</div>
                    <div style={styles.summaryCardValue}>{totalPlayers}</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryCardTitle}>Unique Commanders</div>
                    <div style={styles.summaryCardValue}>{totalCommanders}</div>
                </div>
            </div>
        )
    }

    const exportToCSV = () => {
        let csv = ''

        if (activeTab === 'commanders') {
            csv = 'Commander,Times Played,Wins,Draws,Win Rate,Draw Rate,Players\n'
            commanderStats.forEach(stat => {
                csv += `"${stat.commander}",${stat.timesPlayed},${stat.wins},${stat.draws},${stat.winRate}%,${stat.drawRate}%,"${stat.playersList}"\n`
            })
        } else if (activeTab === 'players') {
            csv = 'Player,Games,Wins,Draws,Win Rate,Draw Rate,Commanders,Most Used Commander\n'
            playerStats.forEach(stat => {
                csv += `"${stat.player}",${stat.games},${stat.wins},${stat.draws},${stat.winRate}%,${stat.drawRate}%,${stat.commandersCount},"${stat.mostUsedCommander}"\n`
            })
        } else if (activeTab === 'seats') {
            csv = 'Seat Position,Games,Wins,Draws,Win Rate,Draw Rate\n'
            seatStats.forEach(stat => {
                csv += `Seat ${stat.seat},${stat.games},${stat.wins},${stat.draws},${stat.winRate}%,${stat.drawRate}%\n`
            })
        } else if (activeTab === 'playerCount') {
            csv = 'Player Count,Games,Wins,Draws,% of Total,Win Rate,Draw Rate\n'
            playerCountStats.forEach(stat => {
                csv += `${stat.playerCount} Players,${stat.games},${stat.wins},${stat.draws},${stat.percentage}%,${stat.winRate}%,${stat.drawRate}%\n`
            })
        }
        
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${activeTab}-statistics-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>📊 Game Statistics</h2>
                <p style={styles.subtitle}>Detailed statistics from all completed games</p>
            </div>

            {renderSummaryCards()}

            <div style={styles.tabContainer}>
                <button
                    onClick={() => setActiveTab('commanders')}
                    style={{
                        ...styles.tabButton,
                        ...(activeTab === 'commanders' ? styles.tabButtonActive : {})
                    }}
                >
                    🎴 Commanders
                </button>
                <button
                    onClick={() => setActiveTab('players')}
                    style={{
                        ...styles.tabButton,
                        ...(activeTab === 'players' ? styles.tabButtonActive : {})
                    }}
                >
                    👥 Players
                </button>
                <button
                    onClick={() => setActiveTab('seats')}
                    style={{
                        ...styles.tabButton,
                        ...(activeTab === 'seats' ? styles.tabButtonActive : {})
                    }}
                >
                    💺 Seat Position
                </button>
                <button
                    onClick={() => setActiveTab('playerCount')}
                    style={{
                        ...styles.tabButton,
                        ...(activeTab === 'playerCount' ? styles.tabButtonActive : {})
                    }}
                >
                    🔢 Player Count
                </button>
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button
                    onClick={exportToCSV}
                    style={styles.exportButton}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
                    }}
                >
                    📥 Export to CSV
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={groupByName}
                        onChange={(e) => setGroupByName(e.target.checked)}
                        style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Group players by name</span>
                </label>
            </div>

            <div style={styles.contentContainer}>
                {activeTab === 'commanders' && renderCommanderStats()}
                {activeTab === 'players' && renderPlayerStats()}
                {activeTab === 'seats' && renderSeatStats()}
                {activeTab === 'playerCount' && renderPlayerCountStats()}
            </div>
        </div>
    )
}
