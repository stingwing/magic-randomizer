import ReactGA from 'react-ga4'

const MEASUREMENT_ID = 'G-DZXEXK0L1N'

let isInitialized = false

/**
 * Initialize Google Analytics
 */
export const initGA = () => {
    if (!isInitialized && typeof window !== 'undefined') {
        ReactGA.initialize(MEASUREMENT_ID, {
            gaOptions: {
                anonymizeIp: true, // Anonymize IP for privacy
            },
            gtagOptions: {
                send_page_view: false, // We'll send page views manually
            }
        })
        isInitialized = true
        console.log('📊 Google Analytics initialized')
    }
}

/**
 * Track page views
 * @param {string} path - The path to track
 * @param {string} title - Optional page title
 */
export const trackPageView = (path, title) => {
    if (isInitialized) {
        ReactGA.send({ 
            hitType: 'pageview', 
            page: path,
            title: title || document.title
        })
    }
}

/**
 * Track custom events
 * @param {string} category - Event category
 * @param {string} action - Event action
 * @param {string} label - Optional event label
 * @param {number} value - Optional numeric value
 */
export const trackEvent = (category, action, label, value) => {
    if (isInitialized) {
        ReactGA.event({
            category,
            action,
            label,
            value
        })
    }
}

/**
 * Track specific user actions for your app
 */
export const analytics = {
    // Room events
    joinRoom: (roomCode) => {
        trackEvent('Room', 'Join Room', roomCode)
    },
    createRoom: (roomCode) => {
        trackEvent('Room', 'Create Room', roomCode)
    },
    rejoinAsPlayer: (roomCode) => {
        trackEvent('Room', 'Rejoin as Player', roomCode)
    },
    rejoinAsHost: (roomCode) => {
        trackEvent('Room', 'Rejoin as Host', roomCode)
    },
    startGame: (roomCode) => {
        trackEvent('Game', 'Start Game', roomCode)
    },
    reportResult: (result) => {
        trackEvent('Game', 'Report Result', result)
    },
    
    // QR Code events
    showQRCode: () => {
        trackEvent('Sharing', 'Show QR Code')
    },
    copyRoomCode: () => {
        trackEvent('Sharing', 'Copy Room Code')
    },
    copyJoinURL: () => {
        trackEvent('Sharing', 'Copy Join URL')
    },
    copyViewLink: (roomCode) => {
        trackEvent('Sharing', 'Copy View Link', roomCode)
    },
    
    // Custom group events
    createCustomGroup: () => {
        trackEvent('Groups', 'Create Custom Group')
    },
    
    // Navigation events
    viewStatistics: () => {
        trackEvent('Navigation', 'View Statistics')
    },
    viewProfile: () => {
        trackEvent('Navigation', 'View Profile')
    },
    
    // View page events
    viewRoom: (roomCode) => {
        trackEvent('View', 'View Room', roomCode)
    },
    refreshViewData: () => {
        trackEvent('View', 'Refresh Data')
    },
    
    // Profile events
    changePassword: () => {
        trackEvent('Profile', 'Change Password')
    },
    resendVerificationEmail: () => {
        trackEvent('Profile', 'Resend Verification Email')
    },
    navigateToHostRoom: (roomCode) => {
        trackEvent('Profile', 'Navigate to Host Room', roomCode)
    },
    navigateToPlayerRoom: (roomCode) => {
        trackEvent('Profile', 'Navigate to Player Room', roomCode)
    }
}

export default { initGA, trackPageView, trackEvent, analytics }
