/**
 * Input validation and sanitization utilities
 * Protects against XSS, injection attacks, and malformed data
 */

// Maximum length constraints for security
export const INPUT_CONSTRAINTS = {
    NAME: { min: 1, max: 50 },
    ROOM_CODE: { min: 1, max: 20 },
    COMMANDER: { min: 0, max: 100 },
    WIN_CONDITION: { min: 0, max: 200 },
    PLAYER_ORDER: { min: 0, max: 50 },
    FIRST_PLAYER: { min: 0, max: 50 },
    TURN_COUNT: { min: 0, max: 999 },
    BRACKET: { min: 0, max: 10 }
}

/**
 * Sanitizes text input by removing potentially dangerous characters
 * Prevents XSS attacks by escaping HTML special characters
 */
export const sanitizeText = (input) => {
    if (typeof input !== 'string') return ''
    
    return input
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Escape special characters that could be used for XSS (but preserve spaces)
        .replace(/[<>'"&]/g, (char) => {
            const escapeMap = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            }
            return escapeMap[char] || char
        })
        // Remove null bytes and other control characters (but preserve spaces and newlines)
        .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Validates and sanitizes alphanumeric input (for room codes, IDs)
 */
export const sanitizeAlphanumeric = (input, allowSpaces = false) => {
    if (typeof input !== 'string') return ''
    
    const pattern = allowSpaces ? /[^a-zA-Z0-9\s-_]/g : /[^a-zA-Z0-9-_]/g
    return input.trim().replace(pattern, '')
}

/**
 * Validates and sanitizes numeric input
 */
export const sanitizeNumber = (input, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    const num = typeof input === 'string' ? parseFloat(input) : input
    
    if (isNaN(num)) return ''
    if (num < min) return min.toString()
    if (num > max) return max.toString()
    
    return Math.floor(num).toString()
}

/**
 * Validates name input (allows letters, numbers, spaces, common name characters)
 */
export const validateName = (name) => {
    const sanitized = sanitizeText(name)
    const trimmed = sanitized.trim()
    const { min, max } = INPUT_CONSTRAINTS.NAME
    
    // Use trimmed for validation but return sanitized for the input field
    if (trimmed.length < min && sanitized.length > 0) {
        return { valid: false, error: `Name must be at least ${min} character`, sanitized }
    }
    if (sanitized.length > max) {
        return { valid: false, error: `Name must be less than ${max} characters`, sanitized: sanitized.slice(0, max) }
    }
    
    // Check for valid name characters (letters, numbers, spaces, hyphens, apostrophes, periods)
    if (trimmed.length > 0 && !/^[a-zA-Z0-9\s\-'.]+$/.test(sanitized)) {
        return { valid: false, error: 'Name contains invalid characters', sanitized: sanitized.replace(/[^a-zA-Z0-9\s\-'.]/g, '') }
    }
    
    return { valid: true, error: null, sanitized }
}

/**
 * Validates Host ID input (disallows spaces for URL compatibility)
 */
export const validateHostId = (hostId) => {
    const sanitized = sanitizeAlphanumeric(hostId, false)
    const { min, max } = INPUT_CONSTRAINTS.NAME
    
    // Check if input contained spaces that were removed
    const hadSpaces = typeof hostId === 'string' && /\s/.test(hostId)
    
    if (sanitized.length < min) {
        return { valid: false, error: 'Host ID is required', sanitized }
    }
    if (sanitized.length > max) {
        return { valid: false, error: `Host ID must be less than ${max} characters`, sanitized: sanitized.slice(0, max) }
    }
    if (hadSpaces) {
        return { valid: false, error: 'Host ID cannot contain spaces', sanitized }
    }
    
    return { valid: true, error: null, sanitized }
}

/**
 * Validates room code input
 */
export const validateRoomCode = (code) => {
    const sanitized = sanitizeAlphanumeric(code)
    const { min, max } = INPUT_CONSTRAINTS.ROOM_CODE
    
    if (sanitized.length < min) {
        return { valid: false, error: 'Room code is required', sanitized }
    }
    if (sanitized.length > max) {
        return { valid: false, error: `Room code must be less than ${max} characters`, sanitized: sanitized.slice(0, max) }
    }
    
    return { valid: true, error: null, sanitized }
}

/**
 * Validates commander name input
 */
export const validateCommander = (commander) => {
    const sanitized = sanitizeText(commander)
    const { max } = INPUT_CONSTRAINTS.COMMANDER
    
    if (sanitized.length > max) {
        return { valid: false, error: `Commander name must be less than ${max} characters`, sanitized: sanitized.slice(0, max) }
    }
    
    return { valid: true, error: null, sanitized }
}

/**
 * Validates win condition input
 */
export const validateWinCondition = (condition) => {
    const sanitized = sanitizeText(condition)
    const { max } = INPUT_CONSTRAINTS.WIN_CONDITION
    
    if (sanitized.length > max) {
        return { valid: false, error: `Win condition must be less than ${max} characters`, sanitized: sanitized.slice(0, max) }
    }
    
    return { valid: true, error: null, sanitized }
}

/**
 * Validates player order input
 */
export const validatePlayerOrder = (order) => {
    const sanitized = sanitizeText(order)
    const { max } = INPUT_CONSTRAINTS.PLAYER_ORDER
    
    if (sanitized.length > max) {
        return { valid: false, error: `Player order must be less than ${max} characters`, sanitized: sanitized.slice(0, max) }
    }
    
    return { valid: true, error: null, sanitized }
}

/**
 * Validates first player input
 */
export const validateFirstPlayer = (player) => {
    const sanitized = sanitizeText(player)
    const { max } = INPUT_CONSTRAINTS.FIRST_PLAYER
    
    if (sanitized.length > max) {
        return { valid: false, error: `First player must be less than ${max} characters`, sanitized: sanitized.slice(0, max) }
    }
    
    return { valid: true, error: null, sanitized }
}

/**
 * Validates turn count input
 */
export const validateTurnCount = (count) => {
    const { max } = INPUT_CONSTRAINTS.TURN_COUNT
    const sanitized = sanitizeNumber(count, 0, max)
    
    return { valid: true, error: null, sanitized }
}

/**
 * Validates bracket input
 */
export const validateBracket = (bracket) => {
    const { max } = INPUT_CONSTRAINTS.BRACKET
    const sanitized = sanitizeNumber(bracket, 0, max)
    
    return { valid: true, error: null, sanitized }
}

/**
 * Validates URL parameters to prevent injection attacks
 */
export const validateUrlParam = (param) => {
    if (!param) return { valid: false, error: 'Parameter is required', sanitized: '' }
    
    const sanitized = sanitizeAlphanumeric(param)
    
    if (sanitized.length === 0) {
        return { valid: false, error: 'Invalid parameter format', sanitized }
    }
    
    return { valid: true, error: null, sanitized }
}

/**
 * Rate limiting helper - tracks and limits actions
 */
export class RateLimiter {
    constructor(maxAttempts = 5, windowMs = 60000) {
        this.maxAttempts = maxAttempts
        this.windowMs = windowMs
        this.attempts = new Map()
    }
    
    canAttempt(key) {
        const now = Date.now()
        const userAttempts = this.attempts.get(key) || []
        
        // Remove old attempts outside the time window
        const recentAttempts = userAttempts.filter(time => now - time < this.windowMs)
        
        if (recentAttempts.length >= this.maxAttempts) {
            return false
        }
        
        recentAttempts.push(now)
        this.attempts.set(key, recentAttempts)
        return true
    }
    
    reset(key) {
        this.attempts.delete(key)
    }
}