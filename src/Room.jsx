import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiBase } from './api'

function RoundResults({ data }) {
    if (!data) return <div style={styles.noResults}>No results returned.</div>

    const { roomCode, participantId, groupNumber, members, round, result, winner, draw } = data

    return (
        <div style={styles.resultsCard}>
            <div style={styles.resultsHeader}>
                <h3 style={styles.resultsTitle}>🎮 Your Group Assignment</h3>
            </div>

            <div style={styles.resultDetails}>
                <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Round:</span>
                    <span style={styles.detailValue}>{round ?? 'N/A'}</span>
                </div>
                <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Group Number:</span>
                    <span style={styles.detailValue}>{groupNumber ?? 'N/A'}</span>
                </div>
                <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Result Reported:</span>
                    <span style={styles.detailValue}>{result ? '✅ Yes' : '⏳ No'}</span>
                </div>
                {winner !== undefined && winner !== null && (
                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Winner:</span>
                        <span style={{...styles.detailValue, color: 'var(--success-color)', fontWeight: '600'}}>
                            🏆 {winner}
                        </span>
                    </div>
                )}
                {draw !== undefined && (
                    <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Draw:</span>
                        <span style={styles.detailValue}>{draw ? '✅ Yes' : '❌ No'}</span>
                    </div>
                )}
            </div>

            {members && Array.isArray(members) && members.length > 0 && (
                <div style={styles.membersSection}>
                    <h4 style={styles.membersTitle}>Group Members</h4>
                    <ul style={styles.membersList}>
                        {members.map((member, idx) => {
                            const isYou = member.id === participantId
                            return (
                                <li 
                                    key={idx} 
                                    style={{
                                        ...styles.memberItem,
                                        ...(isYou ? styles.memberItemYou : {})
                                    }}
                                >
                                    {member.name ?? member.id ?? 'Unknown'}
                                    {isYou && <span style={styles.youBadge}>YOU</span>}
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default function RoomPage() {
    const { code, participantId } = useParams()
    const navigate = useNavigate()
    const [roomData, setRoomData] = useState(null)
    const [roomError, setRoomError] = useState(null)
    const [roomLoading, setRoomLoading] = useState(false)
    const [started, setStarted] = useState(false)
    const [groupResult, setGroupResult] = useState(null)
    const [reportLoading, setReportLoading] = useState(false)
    const [reportMessage, setReportMessage] = useState(null)
    const pollRef = useRef(null)
    const lastUpdatedRef = useRef(null)

    const fetchGroupResult = async () => {
        if (!code || !participantId) return false
        const url = `${apiBase}/${encodeURIComponent(code)}/group/${encodeURIComponent(participantId)}`
        setRoomLoading(true)
        try {
            const res = await fetch(url)

            if (res.status === 404 || res.status === 204) {
                return false
            }

            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }

            const data = await res.json().catch(() => null)
            if (data) {
                setGroupResult(data)
                setStarted(true)
                if (pollRef.current) {
                    clearInterval(pollRef.current)
                    pollRef.current = null
                }
                return true
            }
            return false
        } catch (err) {
            console.error('Error fetching group result', err)
            setRoomError(err.message || 'Unknown error fetching results')
            return false
        } finally {
            setRoomLoading(false)
        }
    }

    const checkIfStarted = data => {
        if (!data) return false
        if (data.started === true || data.gameStarted === true || data.grouped === true) return true
        if (typeof data.status === 'string' && data.status.toLowerCase().includes('start')) return true
        if (data.groups || data.group || data.groupResult || data.grouping) return true
        return false
    }

    const fetchRoom = async () => {
        if (!code) return
        const roomUrl = `${apiBase}/${encodeURIComponent(code)}`
        setRoomLoading(true)
        setRoomError(null)
        try {
            const res = await fetch(roomUrl)
            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }
            const data = await res.json().catch(() => null)
            setRoomData(data)
            lastUpdatedRef.current = new Date()

            if (!started) {
                if (checkIfStarted(data)) {
                    await fetchGroupResult()
                } else {
                    await fetchGroupResult()
                }
            }
        } catch (err) {
            console.error('Error fetching room', err)
            setRoomError(err.message || 'Unknown error')
        } finally {
            setRoomLoading(false)
        }
    }

    const handleReportResult = async (result) => {
        if (!code || !participantId) return

        setReportLoading(true)
        setReportMessage(null)
        setRoomError(null)

        try {
            const url = `${apiBase}/${encodeURIComponent(code)}/report`
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participantId: participantId,
                    result: result
                })
            })

            if (!res.ok) {
                const txt = await res.text().catch(() => '')
                throw new Error(txt || `Server returned ${res.status}`)
            }

            const data = await res.json().catch(() => null)
            setReportMessage(
                data && data.message
                    ? data.message
                    : `${result} reported successfully`
            )
        } catch (err) {
            console.error('Report result error', err)
            setRoomError(err.message || 'Unknown error reporting result')
        } finally {
            setReportLoading(false)
        }
    }

    useEffect(() => {
        if (!code || !participantId) {
            navigate('/')
            return
        }

        localStorage.setItem('currentRoomCode', code)
        localStorage.setItem('currentParticipantId', participantId)

        fetchRoom()

        pollRef.current = setInterval(() => {
            fetchRoom()
        }, 60_000)

        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current)
                pollRef.current = null
            }
        }
    }, [code, participantId, started])

    useEffect(() => {
        const savedCode = localStorage.getItem('currentRoomCode')
        const savedParticipantId = localStorage.getItem('currentParticipantId')

        if (savedCode && savedParticipantId && window.location.pathname === '/') {
            navigate(`/room/${savedCode}/${savedParticipantId}`)
        }
    }, [])

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Game Room</h1>
                <div style={styles.codeDisplay}>
                    <span style={styles.codeLabel}>Room Code:</span>
                    <span style={styles.code}>{code}</span>
                </div>
            </div>

            {roomError && (
                <div style={styles.errorBanner}>
                    <span style={styles.errorIcon}>⚠️</span>
                    {roomError}
                </div>
            )}

            {!started && (
                <div style={styles.waitingCard}>
                    <div style={styles.waitingIcon}>⏳</div>
                    <h2 style={styles.waitingTitle}>Waiting for Host</h2>
                    <p style={styles.waitingText}>
                        The host hasn't started the game yet. You'll be automatically notified when groups are assigned.
                    </p>
                    {roomLoading && (
                        <div style={styles.loadingIndicator}>
                            <span style={styles.spinner}></span>
                            <span>Checking for updates...</span>
                        </div>
                    )}

                    {roomData && Array.isArray(roomData.participants) && (
                        <div style={styles.participantsCard}>
                            <h3 style={styles.participantsTitle}>
                                Players in Lobby ({roomData.participants.length})
                            </h3>
                            <ul style={styles.participantsList}>
                                {roomData.participants.map((p, i) => (
                                    <li key={p.id ?? i} style={styles.participantItem}>
                                        <span style={styles.participantDot}>●</span>
                                        {p.name ?? p.id ?? 'Unknown'}
                                    </li>
                                ))}
                            </ul>
                            <div style={styles.lastUpdated}>
                                Last updated: {lastUpdatedRef.current
                                    ? lastUpdatedRef.current.toLocaleTimeString()
                                    : '—'}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {started && (
                <div style={styles.startedContent}>
                    {roomLoading && <div style={styles.loadingText}>Loading results…</div>}
                    {!roomLoading && groupResult ? (
                        <RoundResults data={groupResult} />
                    ) : (
                        !roomLoading && <div style={styles.noResults}>No results returned.</div>
                    )}

                    <div style={styles.reportCard}>
                        <h3 style={styles.reportTitle}>Report Your Game Result</h3>
                        <p style={styles.reportDescription}>
                            Let the host know how your game went
                        </p>
                        <div style={styles.reportButtons}>
                            <button
                                onClick={() => handleReportResult('Win')}
                                disabled={reportLoading}
                                style={{...styles.reportButton, ...styles.winButton}}
                            >
                                {reportLoading ? <span style={styles.spinner}></span> : '🏆'} Win
                            </button>
                            <button
                                onClick={() => handleReportResult('Draw')}
                                disabled={reportLoading}
                                style={{...styles.reportButton, ...styles.drawButton}}
                            >
                                {reportLoading ? <span style={styles.spinner}></span> : '🤝'} Draw
                            </button>
                            <button
                                onClick={() => handleReportResult('Drop')}
                                disabled={reportLoading}
                                style={{...styles.reportButton, ...styles.dropButton}}
                            >
                                {reportLoading ? <span style={styles.spinner}></span> : '🚪'} Drop
                            </button>
                        </div>
                        {reportMessage && (
                            <div style={styles.successMessage}>
                                <span>✅</span> {reportMessage}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1rem'
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem'
    },
    title: {
        fontSize: '2rem',
        fontWeight: '700',
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, #646cff 0%, #535bf2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
    },
    codeDisplay: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1.5rem',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px var(--shadow-color)'
    },
    codeLabel: {
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        fontWeight: '500'
    },
    code: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: 'var(--accent-color)',
        letterSpacing: '0.1em'
    },
    errorBanner: {
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        background: 'var(--error-bg)',
        border: '1px solid var(--error-border)',
        color: 'var(--error-text)',
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        animation: 'slideIn 0.3s ease'
    },
    errorIcon: {
        fontSize: '1.25rem'
    },
    waitingCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '3rem 2rem',
        textAlign: 'center',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    waitingIcon: {
        fontSize: '4rem',
        marginBottom: '1rem',
        animation: 'pulse 2s ease-in-out infinite'
    },
    waitingTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: 'var(--text-primary)'
    },
    waitingText: {
        fontSize: '1rem',
        color: 'var(--text-secondary)',
        marginBottom: '1.5rem',
        lineHeight: '1.6'
    },
    loadingIndicator: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
    },
    participantsCard: {
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'var(--bg-secondary)',
        borderRadius: '12px'
    },
    participantsTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: 'var(--text-primary)'
    },
    participantsList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '0.5rem'
    },
    participantItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem',
        fontSize: '0.95rem',
        color: 'var(--text-primary)'
    },
    participantDot: {
        color: 'var(--success-color)',
        fontSize: '0.6rem'
    },
    lastUpdated: {
        marginTop: '1rem',
        fontSize: '0.85rem',
        color: 'var(--text-tertiary)',
        textAlign: 'center'
    },
    startedContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    loadingText: {
        textAlign: 'center',
        padding: '2rem',
        fontSize: '1.1rem',
        color: 'var(--text-secondary)'
    },
    noResults: {
        textAlign: 'center',
        padding: '2rem',
        background: 'var(--card-bg)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        color: 'var(--text-secondary)'
    },
    resultsCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    resultsHeader: {
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--border-color)'
    },
    resultsTitle: {
        fontSize: '1.3rem',
        fontWeight: '600',
        margin: 0,
        color: 'var(--text-primary)'
    },
    resultDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1.5rem'
    },
    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        background: 'var(--bg-secondary)',
        borderRadius: '8px'
    },
    detailLabel: {
        fontSize: '0.9rem',
        fontWeight: '500',
        color: 'var(--text-secondary)'
    },
    detailValue: {
        fontSize: '1rem',
        fontWeight: '600',
        color: 'var(--text-primary)'
    },
    membersSection: {
        marginTop: '1.5rem',
        paddingTop: '1.5rem',
        borderTop: '2px solid var(--border-color)'
    },
    membersTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        marginBottom: '1rem',
        color: 'var(--text-primary)'
    },
    membersList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    memberItem: {
        padding: '0.75rem 1rem',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        fontSize: '0.95rem',
        color: 'var(--text-primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    memberItemYou: {
        background: 'linear-gradient(135deg, rgba(100, 108, 255, 0.1) 0%, rgba(83, 91, 242, 0.1) 100%)',
        border: '1px solid var(--accent-color)',
        fontWeight: '600'
    },
    youBadge: {
        padding: '0.25rem 0.5rem',
        background: 'var(--accent-color)',
        color: 'white',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '700'
    },
    reportCard: {
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 12px var(--shadow-color)'
    },
    reportTitle: {
        fontSize: '1.3rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: 'var(--text-primary)'
    },
    reportDescription: {
        fontSize: '0.95rem',
        color: 'var(--text-secondary)',
        marginBottom: '1.5rem'
    },
    reportButtons: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '1rem'
    },
    reportButton: {
        padding: '1rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        boxShadow: '0 2px 8px var(--shadow-color)'
    },
    winButton: {
        background: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)',
        color: 'white'
    },
    drawButton: {
        background: 'linear-gradient(135deg, #ffd43b 0%, #fab005 100%)',
        color: '#333'
    },
    dropButton: {
        background: 'linear-gradient(135deg, #ff6b6b 0%, #fa5252 100%)',
        color: 'white'
    },
    successMessage: {
        marginTop: '1rem',
        padding: '0.75rem 1rem',
        background: 'var(--success-bg)',
        border: '1px solid var(--success-border)',
        borderRadius: '8px',
        color: 'var(--success-text)',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    spinner: {
        width: '16px',
        height: '16px',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        display: 'inline-block'
    }
}