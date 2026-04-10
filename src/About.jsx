import { useState, useEffect } from 'react'
import { sanitizeText } from './utils/validation'
import { signalRBase } from './api'
import { useAuth } from './contexts/AuthContext'

const FEEDBACK_CATEGORIES = ['Bug', 'Feature', 'General', 'Other']
const MAX_LENGTHS = {
    email: 100,
    subject: 200,
    message: 5000
}

export default function About() {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        subject: '',
        message: '',
        category: 'General'
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState(null)

    // Auto-populate email when user is logged in
    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({ ...prev, email: user.email }))
        }
    }, [user])

    const validateEmail = (email) => {
        if (!email) return true // Email is optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleInputChange = (field, value) => {
        // Apply max length constraints
        if (MAX_LENGTHS[field] && value.length > MAX_LENGTHS[field]) {
            return
        }
        setFormData(prev => ({ ...prev, [field]: value }))
        setSubmitStatus(null) // Clear status on new input
    }

    const handleSendFeedback = async () => {
        // Validation
        if (!formData.message.trim()) {
            setSubmitStatus({ type: 'error', message: 'Please enter your feedback message before sending.' })
            return
        }

        if (formData.message.trim().length < 10) {
            setSubmitStatus({ type: 'error', message: 'Feedback message must be at least 10 characters.' })
            return
        }

        if (!formData.subject.trim()) {
            setSubmitStatus({ type: 'error', message: 'Please enter a subject for your feedback.' })
            return
        }

        if (formData.email && !validateEmail(formData.email)) {
            setSubmitStatus({ type: 'error', message: 'Please enter a valid email address or leave it blank.' })
            return
        }

        setIsSubmitting(true)
        setSubmitStatus(null)

        try {
            // Sanitize inputs for security
            const sanitizedData = {
                email: formData.email ? sanitizeText(formData.email.trim()) : '',
                subject: sanitizeText(formData.subject.trim()),
                message: sanitizeText(formData.message.trim()),
                category: formData.category
            }

            // Build headers - include Authorization if user is logged in
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            }

            if (user?.token) {
                headers['Authorization'] = `Bearer ${user.token}`
            }

            const response = await fetch(`${signalRBase}/api/Feedback`, {
                method: 'POST',
                headers,
                body: JSON.stringify(sanitizedData)
            })

            if (response.status === 429) {
                setSubmitStatus({ 
                    type: 'error', 
                    message: 'Too many feedback submissions. Please wait a moment and try again.' 
                })
                return
            }

            if (response.status === 401) {
                setSubmitStatus({ 
                    type: 'error', 
                    message: 'Authentication expired. Please log in again and try submitting your feedback.' 
                })
                return
            }

            if (response.status === 400) {
                const errorData = await response.json().catch(() => ({}))
                setSubmitStatus({ 
                    type: 'error', 
                    message: errorData.detail || 'Invalid feedback data. Please check your input and try again.' 
                })
                return
            }

            if (!response.ok) {
                throw new Error('Failed to submit feedback')
            }

            setSubmitStatus({ 
                type: 'success', 
                message: '✓ Thank you! Your feedback has been submitted successfully.' 
            })

            // Reset form on success
            setFormData({
                email: '',
                subject: '',
                message: '',
                category: 'General'
            })

        } catch (error) {
            console.error('Error submitting feedback:', error)
            setSubmitStatus({ 
                type: 'error', 
                message: 'Failed to submit feedback. Please try again later or contact us directly at admin@commanderpodcreator.com.' 
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div style={{ textAlign: "left" }}>
            <h2>About Commander Pod Creator</h2>
           
            <p>I've been playing EDH at local game stores for a while, and if they run a structured event, it's normally two rounds with the pods being randomized manually then shouted out to the entire store.</p>
            <p>Commander Pod Creator is designed for both Casual and CEDH Friday Night Magic style events to help users quickly generate groups and direct them to tables.</p>

            <h3>Key Features</h3>
            <ul>
                <li>Once the Host Creates the game players can join via join code or QR code</li>
                <li>Automatically creates pods of 4 players (or 3 when the player count is not a multiple of 4)</li>
                <li>When generating subsequent rounds the algorithm will minimize the chances of a player being placed in a group of 3 multiple times</li>
                <li>(Optional) Winners Tracking: Winners will be matched up against other winners each new round</li>
                <li>Match History: View detailed statistics and matchup history for all players</li>
                <li>Statistics (New): Statistics such as Commander, Winrate, Draw Rate, Seat Position etc are now tracked and can be summarized from multiple sessions</li>
                <li>Accounts (New): Users can optionally create an account to keep track of all the games that they have participated in</li>
                <li>Anonymous Players: Players do not need to create an account to join/host a game</li>
                <li>Custom Groups (Optional): Host/Players can form groups of players into custom groups with up to 6 players that will always play together in each round</li>
            </ul>

            <h3>How It Works</h3>
            <ol>
                <li>The host creates a room and shares the room code/QR Code with players</li>
                <li>Enter player names and optionally their commander</li>
                <li>Between each round players/host can form custom groups</li>
                <li>The Host can dynamically add players to the game to keep track of users that can't/won't use the application</li>
                <li>The Host starts the game which updates each user's device with who they are playing with and a group number</li>
                <li>A live view of all groups can also be viewed on the History page - at a store this could be displayed on a TV for all players to see</li>
                <li>The host starts the game starting a configurable round timer. Once the game has started players can optionally submit the results and other additional statistics about the game</li>
                <li>Once the game is over the host can start a new round generating a new list of pods for the users</li>
                <li>If there are any issues, the host can move users between groups and regenerate the round</li>
            </ol>

            <h3>Pod Generation Algorithm</h3>
            <ul>
                <li>Maximum pods of 4 players; pods of 3 are created when necessary based on total player count</li>
                <li>Winners from previous rounds are placed together (up to 4 winners per pod)</li>
                <li>Players who were in pods of 3 are prioritized for pods of 4 in future rounds</li>
                <li>Non-winning players are randomly distributed with priority on avoiding repeated matchups</li>
                <li>The algorithm tracks all previous matchups to maximize variety across rounds</li>
            </ul>

            <h3>Feedback & Support</h3>
            <p>
                We'd love to hear from you! Whether you have suggestions for new features, 
                found a bug, or just want to share your experience using Commander Pod Creator, 
                please don't hesitate to reach out.
            </p>

            {user && (
                <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#d1ecf1',
                    border: '1px solid #bee5eb',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    color: '#0c5460'
                }}>
                    <strong>✓ Logged in as:</strong> {user.email || user.username}
                    {' - '}Your feedback will be associated with your account.
                </div>
            )}

            <div style={{ marginTop: '1rem', maxWidth: '600px' }}>
                {/* Category Selection */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Category *
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        style={{
                            width: '100%',
                            color: '#777777',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontFamily: 'inherit',       
                            cursor: 'pointer'
                        }}
                    >
                        {FEEDBACK_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Email Input (Optional) - Only show for non-logged-in users */}
                {!user && (
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Email (optional)
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="your.email@example.com"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                fontSize: '1rem',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box'
                            }}
                        />
                        <small style={{ color: '#666', fontSize: '0.85rem' }}>
                            Provide your email if you'd like a response
                        </small>
                    </div>
                )}

                {/* Subject Input */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Subject *
                    </label>
                    <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Brief description of your feedback"
                        maxLength={MAX_LENGTHS.subject}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box'
                        }}
                    />
                    <small style={{ color: '#666', fontSize: '0.85rem' }}>
                        {formData.subject.length}/{MAX_LENGTHS.subject} characters
                    </small>
                </div>

                {/* Message Textarea */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Message *
                    </label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Enter your detailed feedback here..."
                        maxLength={MAX_LENGTHS.message}
                        style={{
                            width: '100%',
                            minHeight: '150px',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box'
                        }}
                    />
                    <small style={{ color: '#666', fontSize: '0.85rem' }}>
                        {formData.message.length}/{MAX_LENGTHS.message} characters
                    </small>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSendFeedback}
                    disabled={isSubmitting}
                    style={{
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: isSubmitting ? '#6c757d' : '#007bff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s',
                        opacity: isSubmitting ? 0.7 : 1
                    }}
                    onMouseOver={(e) => !isSubmitting && (e.target.style.backgroundColor = '#0056b3')}
                    onMouseOut={(e) => !isSubmitting && (e.target.style.backgroundColor = '#007bff')}
                >
                    {isSubmitting ? '⏳ Sending...' : '📧 Send Feedback'}
                </button>

                {/* Status Message */}
                {submitStatus && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        borderRadius: '4px',
                        backgroundColor: submitStatus.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: submitStatus.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${submitStatus.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                        {submitStatus.message}
                    </div>
                )}       
            </div>
        </div>
    );
}