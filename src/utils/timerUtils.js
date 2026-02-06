/**
 * Calculate remaining time for a round
 * @param {string} startedAtUtc - ISO timestamp when round started
 * @param {number} roundLength - Round duration in minutes
 * @returns {Object|null} Object with display text and isNegative flag, or null
 */
export const calculateTimeRemaining = (startedAtUtc, roundLength) => {
    if (!startedAtUtc || !roundLength) {
        return null
    }

    const startTime = new Date(startedAtUtc)
    const now = new Date()
    const roundDurationMs = roundLength * 60 * 1000
    const elapsedMs = now - startTime
    const remainingMs = roundDurationMs - elapsedMs

    const totalSeconds = Math.floor(Math.abs(remainingMs) / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const isNegative = remainingMs < 0

    let displayText = ''
    if (hours > 0) {
        displayText = `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
        displayText = `${minutes}m ${seconds}s`
    } else {
        displayText = `${seconds}s`
    }

    if (isNegative) {
        displayText = `-${displayText}`
    }

    return {
        display: displayText,
        isNegative: isNegative
    }
}