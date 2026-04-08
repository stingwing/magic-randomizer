import { useState } from 'react'

export default function About() {
    const [feedback, setFeedback] = useState('')

    const handleSendFeedback = () => {
        if (!feedback.trim()) {
            alert('Please enter your feedback before sending.')
            return
        }

        const subject = encodeURIComponent('Magic Randomizer Feedback')
        const body = encodeURIComponent(feedback)
        window.location.href = `mailto:admin@commanderpodcreator.com?subject=${subject}&body=${body}`
    }

    return (
        <div style={{ textAlign: "left" }}>
            <h2>About Magic Randomizer - This page needs a rewrite</h2>
            
            <h3>What is this?</h3>
            <p>
                Magic Randomizer is a web application designed to help organize and manage 
                Commander (EDH) games. It creates balanced pods, tracks game history, 
                and helps coordinate multiple rounds of play for groups of any size.
            </p>

            <h3>Key Features</h3>
            <ul>
                <li><strong>Smart Pod Generation:</strong> Automatically creates balanced pods of 4 players (or 3/5 when necessary)</li>
                <li><strong>Optional Winner Tracking:</strong> Track winners and prioritize them for competitive pods in subsequent rounds</li>
                <li><strong>Match History:</strong> View detailed statistics and matchup history for all players</li>
                <li><strong>Room System:</strong> Create or join rooms to coordinate games with your playgroup</li>
                <li><strong>Multi-Device Support:</strong> Join the same room from multiple devices to stay synchronized</li>
            </ul>

            <h3>How It Works</h3>
            <ol>
                <li><strong>Create or Join a Room:</strong> The host creates a room and shares the room code with players</li>
                <li><strong>Add Players:</strong> Enter player names and optionally their commander decks</li>
                <li><strong>Generate Pods:</strong> The app creates randomized pods while avoiding repeat matchups</li>
                <li><strong>Track Results:</strong> Mark winners after each game to inform future pod assignments</li>
                <li><strong>Start New Rounds:</strong> Generate fresh pods that prioritize variety and fairness</li>
            </ol>

            <h3>Pod Generation Rules</h3>
            <ul>
                <li>Maximum pods of 4 players; pods of 3 are created when necessary based on total player count</li>
                <li>Winners from previous rounds are placed together (up to 4 winners per pod)</li>
                <li>Non-winning players are randomly distributed with priority on avoiding repeated matchups</li>
                <li>Players who were in pods of 3 are prioritized for pods of 4 in future rounds</li>
                <li>The algorithm tracks all previous matchups to maximize variety across rounds</li>
            </ul>

            <h3>Feedback & Support</h3>
            <p>
                We'd love to hear from you! Whether you have suggestions for new features, 
                found a bug, or just want to share your experience using Magic Randomizer, 
                please don't hesitate to reach out.
            </p>
            <div style={{ marginTop: '1rem' }}>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter your feedback here..."
                    style={{
                        width: '100%',
                        minHeight: '120px',
                        padding: '0.75rem',
                        fontSize: '1rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                    }}
                />
                <button
                    onClick={handleSendFeedback}
                    style={{
                        marginTop: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: '#007bff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                >
                    📧 Send Feedback via Email
                </button>
            </div>
        </div>
    );
}