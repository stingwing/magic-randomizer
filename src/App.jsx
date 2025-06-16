import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import NewPage from './About' // Import your new page

function shuffle(array) {
    let arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function groupByFlexible(array) {
    // Only allow groups of 3 or 4, never 1 or 2
    const n = array.length;
    const groups = [];
    let i = 0;

    if (n % 4 === 1 && n >= 9) {
        for (; i < n - 9; i += 4) {
            groups.push(array.slice(i, i + 4));
        }
        groups.push(array.slice(i, i + 3));
        groups.push(array.slice(i + 3, i + 6));
        groups.push(array.slice(i + 6, i + 9));
    } else if (n % 4 === 2 && n >= 6) {
        for (; i < n - 6; i += 4) {
            groups.push(array.slice(i, i + 4));
        }
        groups.push(array.slice(i, i + 3));
        groups.push(array.slice(i + 3, i + 6));
    } else {
        while (n - i > 4) {
            groups.push(array.slice(i, i + 4));
            i += 4;
        }
        if (n - i === 4) {
            groups.push(array.slice(i, i + 4));
        } else if (n - i === 3) {
            groups.push(array.slice(i, i + 3));
        }
    }
    return groups;
}

// Helper: Always make groups of 4 from winners, filling with non-winners if needed
function groupWinnersAsFours(winners, rest) {
    let winnerList = shuffle([...winners]);
    let restList = shuffle([...rest]);
    const groups = [];
    while (winnerList.length > 0) {
        let group = [];
        if (winnerList.length >= 4) {
            group = winnerList.splice(0, 4);
        } else {
            // Fewer than 4 winners left, fill with rest
            group = winnerList.splice(0, winnerList.length);
            while (group.length < 4 && restList.length > 0) {
                group.push(restList.shift());
            }
        }
        groups.push(group);
    }
    return { winnerGroups: groups, rest: restList };
}

function getPairs(groups) {
    const pairs = new Set();
    for (const group of groups) {
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                const pair = [group[i], group[j]].sort().join('|');
                pairs.add(pair);
            }
        }
    }
    return pairs;
}

function getNamesInGroupsOfThree(groups) {
    const names = new Set();
    for (const group of groups) {
        if (group.length === 3) {
            group.forEach(name => names.add(name));
        }
    }
    return names;
}

function App() {
    const [input, setInput] = useState('');
    // rounds: [{ label: string, groups: array, winners: array }]
    const [rounds, setRounds] = useState([]);
    // winners for the current round (index by group)
    const [currentWinners, setCurrentWinners] = useState({});

    // Helper to get all names in the current round
    const getCurrentNames = () => {
        if (rounds.length === 0) return [];
        return rounds[rounds.length - 1].groups.flat();
    };

    const handleRandomize = () => {
        const names = input
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        const shuffled = shuffle(names);
        const groups = groupByFlexible(shuffled);
        setRounds([{ label: "Round 1", groups, winners: [] }]);
        setCurrentWinners({});
    };

    const handleWinnerSelect = (groupIdx, winner) => {
        setCurrentWinners(prev => ({
            ...prev,
            [groupIdx]: winner
        }));
        // Update winners in the current round for display
        setRounds(prevRounds => {
            if (prevRounds.length === 0) return prevRounds;
            const lastRound = prevRounds[prevRounds.length - 1];
            const newWinners = [...(lastRound.winners || [])];
            newWinners[groupIdx] = winner;
            const updatedRounds = [
                ...prevRounds.slice(0, -1),
                { ...lastRound, winners: newWinners }
            ];
            return updatedRounds;
        });
    };

    const handleNewRound = () => {
        if (rounds.length === 0) return;
        const prevRound = rounds[rounds.length - 1];
        const prevGroups = prevRound.groups;
        const prevPairs = getPairs(prevGroups);
        const prevGroup3Names = getNamesInGroupsOfThree(prevGroups);

        // Collect winners from the current round
        const winners = Object.values(currentWinners).filter(Boolean);

        let names = getCurrentNames();
        let nextGroups = [];

        if (winners.length > 0) {
            // Remove winners from the rest
            const rest = names.filter(name => !winners.includes(name));
            // Always make groups of 4 from winners, filling with rest if needed
            const { winnerGroups, rest: restLeft } = groupWinnersAsFours(winners, rest);
            nextGroups = [...winnerGroups];
            // Group the remaining rest as usual
            if (restLeft.length > 0) {
                const restGroups = groupByFlexible(restLeft);
                nextGroups = [...nextGroups, ...restGroups];
            }
        } else {
            // If no winners, just randomize as before
            let bestGroups = null;
            let minRepeats = Infinity;
            let minGroup3Repeaters = Infinity;

            for (let t = 0; t < 1000; t++) {
                const shuffled = shuffle(names);
                const groups = groupByFlexible(shuffled);
                const pairs = getPairs(groups);

                let repeats = 0;
                for (const pair of pairs) {
                    if (prevPairs.has(pair)) repeats++;
                }

                const group3Names = getNamesInGroupsOfThree(groups);
                let group3Repeaters = 0;
                for (const name of group3Names) {
                    if (prevGroup3Names.has(name)) group3Repeaters++;
                }

                if (
                    repeats < minRepeats ||
                    (repeats === minRepeats && group3Repeaters < minGroup3Repeaters)
                ) {
                    minRepeats = repeats;
                    minGroup3Repeaters = group3Repeaters;
                    bestGroups = groups;
                    if (minRepeats === 0 && minGroup3Repeaters === 0) break;
                }
            }
            nextGroups = bestGroups;
        }

        setRounds(prev => {
            const nextLabel = `Round ${prev.length + 1}`;
            const next = [
                ...prev.slice(-4),
                { label: nextLabel, groups: nextGroups, winners: [] }
            ];
            return next;
        });
        setCurrentWinners({});
    };

    return (
        <Router>
            <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "sans-serif" }}>
                {/* Navigation */}
                <nav style={{ marginBottom: "2rem" }}>
                    <Link to="/" style={{ marginRight: 16 }}>Home</Link>
                    <Link to="/new" style={{ marginRight: 16 }}>About</Link>
                </nav>
                <Routes>
                    <Route path="/" element={
                        <>
                            {/* Your existing App content */}
                            <h2>Commander Pod Creator</h2>
                            <textarea
                                rows={16}
                                style={{ width: "100%", minHeight: "220px", marginTop: 0 }}
                                placeholder="Enter one name per line"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                            />
                            <div style={{ marginTop: "1rem" }}>
                                <button onClick={handleRandomize} style={{ marginRight: "1rem" }}>
                                    Randomize List
                                </button>
                                <button onClick={handleNewRound}>
                                    New Round
                                </button>
                            </div>
                            {rounds.length > 0 && (
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "1rem",
                                        marginTop: "2rem",
                                        overflowX: "auto",
                                        paddingBottom: "1rem"
                                    }}
                                >
                                    {rounds.map((round, roundIdx) => (
                                        <div key={roundIdx} style={{ flex: "0 0 300px", minWidth: 300 }}>
                                            <h3>{round.label}</h3>
                                            {round.groups.map((group, idx) => (
                                                <div key={idx} style={{ marginBottom: "1rem" }}>
                                                    <strong style={{ display: "block", textAlign: "left" }}>
                                                        Group {idx + 1}:
                                                    </strong>
                                                    <ul style={{ textAlign: "left" }}>
                                                        {group.map((name, i) => {
                                                            const winnerName =
                                                                round.winners && round.winners[idx]
                                                                    ? round.winners[idx]
                                                                    : null;
                                                            const isWinner = winnerName === name;
                                                            return (
                                                                <li key={i} style={{ whiteSpace: "nowrap" }}>
                                                                    {name}
                                                                    {isWinner && (
                                                                        <span style={{ marginLeft: 6 }} role="img" aria-label="winner">
                                                                            🏆
                                                                        </span>
                                                                    )}
                                                                    {roundIdx === rounds.length - 1 && (
                                                                        <>
                                                                            <input
                                                                                type="radio"
                                                                                name={`winner-group-${idx}`}
                                                                                value={name}
                                                                                checked={currentWinners[idx] === name}
                                                                                onChange={() => handleWinnerSelect(idx, name)}
                                                                                style={{ marginLeft: 8 }}
                                                                            />
                                                                            <span style={{ marginLeft: 4, fontSize: 12 }}>
                                                                                Winner
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    } />
                    <Route path="/new" element={<NewPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App
