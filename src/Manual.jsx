import { useState } from 'react'

function shuffle(array) {
    let arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function groupByFlexible(array) {
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

function groupWinnersAsFours(winners, rest) {
    let winnerList = shuffle([...winners]);
    let restList = shuffle([...rest]);
    const groups = [];
    while (winnerList.length > 0) {
        let group = [];
        if (winnerList.length >= 4) {
            group = winnerList.splice(0, 4);
        } else {
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

function checkAllPlayersIncluded(originalNames, groupedNames) {
    const allPrevNames = new Set(originalNames);
    const allNextNames = new Set(groupedNames.flat());
    let missing = [];
    for (const name of allPrevNames) {
        if (!allNextNames.has(name)) {
            missing.push(name);
        }
    }
    if (missing.length > 0) {
        alert("Error: The following players are missing in the new round: " + missing.join(", "));
        return false;
    }
    return true;
}

function Manual() {
    const [input, setInput] = useState('');
    const [rounds, setRounds] = useState([]);
    const [currentWinners, setCurrentWinners] = useState({});
    const [dropped, setDropped] = useState({});

    const getCurrentNames = () => {
        if (rounds.length === 0) return [];
        return rounds[rounds.length - 1].groups.flat().filter(name => !dropped[name]);
    };

    const handleRandomize = () => {
        const names = input
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        const shuffled = shuffle(names);
        if (names.length === 1 || names.length === 2) {
            alert("Error: Invalid Number of players");
            return;
        }

        const groups = groupByFlexible(shuffled);
        checkAllPlayersIncluded(names, groups);

        setRounds([{ label: "Round 1", groups, winners: [] }]);
        setCurrentWinners({});
        setDropped({});
    };

    const handleWinnerSelect = (groupIdx, winner) => {
        setCurrentWinners(prev => ({
            ...prev,
            [groupIdx]: winner
        }));
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

    const handleDropToggle = (name) => {
        setDropped(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const handleNewRound = () => {
        if (rounds.length === 0) return;
        const prevRound = rounds[rounds.length - 1];
        const prevGroups = prevRound.groups;
        const prevPairs = getPairs(prevGroups);
        const prevGroup3Names = getNamesInGroupsOfThree(prevGroups);

        const winners = Object.values(currentWinners).filter(Boolean).filter(name => !dropped[name]);

        let names = getCurrentNames();
        let nextGroups = [];

        let rest = names;
        let winnerGroups = [];

        if (winners.length > 0) {
            let grouped = groupWinnersAsFours(winners, names.filter(name => !winners.includes(name)));
            let candidateWinnerGroups = grouped.winnerGroups;
            let usedInWinnerGroups = new Set(candidateWinnerGroups.flat());
            let restAfterWinners = names.filter(name => !usedInWinnerGroups.has(name));

            const testGroups = groupByFlexible(restAfterWinners);
            const flatTestGroups = testGroups.flat();
            const allNamesAccountedFor =
                flatTestGroups.length === restAfterWinners.length &&
                flatTestGroups.every(name => restAfterWinners.includes(name)) &&
                restAfterWinners.every(name => flatTestGroups.includes(name));

            const valid =
                allNamesAccountedFor &&
                testGroups.length > 0 &&
                testGroups.every(g => g.length === 3 || g.length === 4);

            if (valid || restAfterWinners.length === 0) {
                winnerGroups = candidateWinnerGroups;
                rest = restAfterWinners;
            } else {
                let winnerList = shuffle([...winners]);
                let restList = shuffle(names.filter(name => !winners.includes(name)));
                let fallbackWinnerGroups = [];
                while (winnerList.length > 0) {
                    let group = [];
                    if (winnerList.length >= 4) {
                        group = winnerList.splice(0, 4);
                    } else if (winnerList.length === 3) {
                        group = winnerList.splice(0, 3);
                    } else {
                        group = winnerList.splice(0, winnerList.length);
                        while (group.length < 3 && restList.length > 0) {
                            group.push(restList.shift());
                        }
                    }
                    fallbackWinnerGroups.push(group);
                }
                let usedFallback = new Set(fallbackWinnerGroups.flat());
                let restAfterFallback = names.filter(name => !usedFallback.has(name));
                winnerGroups = fallbackWinnerGroups;
                rest = restAfterFallback;
            }
        }

        let restGroups = [];
        if (rest.length > 0) {
            let bestGroups = null;
            let minRepeats = Infinity;
            let minGroup3Repeaters = Infinity;

            for (let t = 0; t < 1000; t++) {
                const shuffled = shuffle(rest);
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

                if (repeats < minRepeats || (repeats === minRepeats && group3Repeaters < minGroup3Repeaters)) {
                    minRepeats = repeats;
                    minGroup3Repeaters = group3Repeaters;
                    bestGroups = groups;
                    if (minRepeats === 0 && minGroup3Repeaters === 0) break;
                }
            }
            restGroups = bestGroups;
        }

        nextGroups = [...winnerGroups, ...(restGroups || [])];

        if (!checkAllPlayersIncluded(names, nextGroups)) {
            return;
        }

        const droppedNames = Object.keys(dropped).filter(name => dropped[name]);

        setRounds(prev => {
            const nextLabel = `Round ${prev.length + 1}`;
            const next = [
                ...prev.slice(-4),
                { label: nextLabel, groups: nextGroups, winners: [], dropped: droppedNames }
            ];
            return next;
        });
        setCurrentWinners({});
    };

    return (
        <>
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
                                            const showDrop = roundIdx === rounds.length - 1;
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
                                                                Win
                                                            </span>
                                                        </>
                                                    )}
                                                    {showDrop && (
                                                        <>
                                                            <input
                                                                type="checkbox"
                                                                checked={!!dropped[name]}
                                                                onChange={() => handleDropToggle(name)}
                                                                style={{ marginLeft: 12 }}
                                                            />
                                                            <span style={{ marginLeft: 4, fontSize: 12 }}>
                                                                Drop
                                                            </span>
                                                        </>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                            {round.dropped && round.dropped.length > 0 && (
                                <div style={{ marginBottom: "1rem" }}>
                                    <strong style={{ display: "block", textAlign: "left" }}>
                                        Dropped:
                                    </strong>
                                    <ul style={{ textAlign: "left", color: "#888" }}>
                                        {round.dropped.map((name, i) => (
                                            <li key={i} style={{ whiteSpace: "nowrap" }}>
                                                {name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

export default Manual