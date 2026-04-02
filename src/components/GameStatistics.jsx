import { useState, useMemo } from 'react'
import { styles } from '../styles/GameStatistics.styles'

export default function GameStatistics({ archivedRounds, currentRound, totalSessions }) {
    const [activeTab, setActiveTab] = useState('commanders')

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

                // Skip if no commander
                if (!commander || commander.trim() === '') return

                // Initialize stats for this commander if not exists
                if (!stats[commander]) {
                    stats[commander] = {
                        commander: commander,
                        timesPlayed: 0,
                        wins: 0,
                        draws: 0,
                        players: new Set()
                    }
                }

                stats[commander].timesPlayed++
                stats[commander].players.add(member.name || member.id || 'Unknown')

                // Check if this player won
                if (winner && (winner === member.name || winner === member.id)) {
                    stats[commander].wins++
                }

                // Check if this was a draw (or no result)
                if (isDraw) {
                    stats[commander].draws++
                }
            })
        })

        // Convert to array and calculate rates
        return Object.values(stats).map(stat => ({
            ...stat,
            winRate: stat.timesPlayed > 0 ? ((stat.wins / stat.timesPlayed) * 100).toFixed(2) : '0.00',
            drawRate: stat.timesPlayed > 0 ? ((stat.draws / stat.timesPlayed) * 100).toFixed(2) : '0.00',
            playersList: Array.from(stat.players).join(', ')
        })).sort((a, b) => b.timesPlayed - a.timesPlayed)
    }, [archivedRounds, currentRound])

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
            const statistics = group.statistics || {}
            const playerOrder = statistics.PlayerOrder
            const winner = group.winner
            const draw = group.draw

            // Only process if we have player order
            if (playerOrder) {
                // Parse player order - it's a comma-separated string like "Alice, Bob, Charlie, Dave"
                const playerNames = playerOrder.split(',').map(name => name.trim())
                const numPlayers = playerNames.length

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
                    // Find which position the winner is in
                    const winnerPosition = playerNames.findIndex(name => name === winner)

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
                const playerName = member.name || member.id || 'Unknown'

                // Initialize stats for this player if not exists
                if (!stats[playerName]) {
                    stats[playerName] = {
                        player: playerName,
                        games: 0,
                        wins: 0,
                        draws: 0,
                        losses: 0,
                        commanders: new Set(),
                        commanderCount: {}
                    }
                }

                stats[playerName].games++

                // Track commander
                if (member.commander && member.commander.trim() !== '') {
                    stats[playerName].commanders.add(member.commander)
                    stats[playerName].commanderCount[member.commander] = 
                        (stats[playerName].commanderCount[member.commander] || 0) + 1
                }

                // Check if this player won
                if (winner && (winner === playerName)) {
                    stats[playerName].wins++
                } else if (isDraw) {
                    stats[playerName].draws++
                } else if (winner) {
                    // Only count as loss if there was a winner and it wasn't this player
                    stats[playerName].losses++
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

            return {
                ...stat,
                winRate: stat.games > 0 ? ((stat.wins / stat.games) * 100).toFixed(2) : '0.00',
                drawRate: stat.games > 0 ? ((stat.draws / stat.games) * 100).toFixed(2) : '0.00',
                commandersCount: stat.commanders.size,
                mostUsedCommander: mostUsedCommander
            }
        }).sort((a, b) => b.games - a.games)
    }, [archivedRounds, currentRound])

    const renderCommanderStats = () => {
        if (commanderStats.length === 0) {
            return <div style={styles.emptyState}>No commander data available</div>
        }

        return (
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Commander</th>
                            <th style={styles.th}>Times Played</th>
                            <th style={styles.th}>Wins</th>
                            <th style={styles.th}>Draws</th>
                            <th style={styles.th}>Win Rate</th>
                            <th style={styles.th}>Draw Rate</th>
                            <th style={styles.th}>Players</th>
                        </tr>
                    </thead>
                    <tbody>
                        {commanderStats.map((stat, idx) => (
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

        return (
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Player</th>
                            <th style={styles.th}>Games</th>
                            <th style={styles.th}>Wins</th>
                            <th style={styles.th}>Draws</th>
                            <th style={styles.th}>Losses</th>
                            <th style={styles.th}>Win Rate</th>
                            <th style={styles.th}>Draw Rate</th>
                            <th style={styles.th}>Commanders</th>
                            <th style={styles.th}>Most Used</th>
                        </tr>
                    </thead>
                    <tbody>
                        {playerStats.map((stat, idx) => (
                            <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                                <td style={styles.td}>{stat.player}</td>
                                <td style={styles.tdCenter}>{stat.games}</td>
                                <td style={styles.tdCenter}>{stat.wins}</td>
                                <td style={styles.tdCenter}>{stat.draws}</td>
                                <td style={styles.tdCenter}>{stat.losses}</td>
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

        return (
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Seat Position</th>
                            <th style={styles.th}>Games</th>
                            <th style={styles.th}>Wins</th>
                            <th style={styles.th}>Draws</th>
                            <th style={styles.th}>Win Rate</th>
                            <th style={styles.th}>Draw Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seatStats.map((stat, idx) => (
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

        return (
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Player Count</th>
                            <th style={styles.th}>Games</th>
                            <th style={styles.th}>Wins</th>
                            <th style={styles.th}>Draws</th>
                            <th style={styles.th}>% of Total</th>
                            <th style={styles.th}>Win Rate</th>
                            <th style={styles.th}>Draw Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {playerCountStats.map((stat, idx) => (
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
            csv = 'Player,Games,Wins,Draws,Losses,Win Rate,Draw Rate,Commanders,Most Used Commander\n'
            playerStats.forEach(stat => {
                csv += `"${stat.player}",${stat.games},${stat.wins},${stat.draws},${stat.losses},${stat.winRate}%,${stat.drawRate}%,${stat.commandersCount},"${stat.mostUsedCommander}"\n`
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

            <div style={{ marginBottom: '16px' }}>
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
