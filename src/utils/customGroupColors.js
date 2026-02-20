/**
 * Generates a consistent, visually distinct color for a custom group based on its GUID
 * Supports up to 100+ unique custom groups with good visual distinction
 * @param {string} guid - The custom group GUID
 * @returns {string} - A hex color string
 */
export const getCustomGroupColor = (guid) => {
    if (!guid || guid === '00000000-0000-0000-0000-000000000000' || guid === '') {
        return '#9333ea' // Default purple
    }

    // First, try to use predefined high-quality colors for the most common cases
    const premiumColors = [
        '#9333ea', // Purple
        '#dc2626', // Red
        '#ea580c', // Orange
        '#ca8a04', // Yellow/Gold
        '#16a34a', // Green
        '#0891b2', // Cyan
        '#2563eb', // Blue
        '#7c3aed', // Violet
        '#db2777', // Pink
        '#059669', // Emerald
        '#0d9488', // Teal
        '#4f46e5', // Indigo
        '#be123c', // Rose
        '#c026d3', // Fuchsia
        '#0284c7', // Sky
        '#65a30d', // Lime
        '#d97706', // Amber
        '#7c2d12', // Brown
        '#be185d', // Pink Red
        '#4338ca', // Indigo Blue
    ]

    // Simple hash function to convert GUID to a number
    let hash = 0
    for (let i = 0; i < guid.length; i++) {
        const char = guid.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
    }

    // Use absolute value
    hash = Math.abs(hash)

    // For the first 20 groups, use premium colors
    if (hash % 100 < premiumColors.length) {
        return premiumColors[hash % premiumColors.length]
    }

    // For additional groups, generate colors using HSL for better distribution
    // Use golden ratio for good distribution of hues
    const goldenRatioConjugate = 0.618033988749895
    const hue = ((hash * goldenRatioConjugate) % 1.0) * 360

    // Vary saturation and lightness for more variety
    // Use different ranges to ensure good visibility and contrast
    const saturationVariants = [65, 70, 75, 80, 85]
    const lightnessVariants = [45, 50, 55, 40, 60]
    
    const saturationIndex = hash % saturationVariants.length
    const lightnessIndex = Math.floor(hash / saturationVariants.length) % lightnessVariants.length
    
    const saturation = saturationVariants[saturationIndex]
    const lightness = lightnessVariants[lightnessIndex]

    return hslToHex(hue, saturation, lightness)
}

/**
 * Converts HSL color values to hex
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} - Hex color string
 */
function hslToHex(h, s, l) {
    s /= 100
    l /= 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = l - c / 2

    let r = 0, g = 0, b = 0

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x
    }

    // Convert to 0-255 range and then to hex
    const toHex = (value) => {
        const hex = Math.round((value + m) * 255).toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Checks if a member is in a custom group
 * @param {string} inCustomGroup - The inCustomGroup GUID value
 * @returns {boolean}
 */
export const isInCustomGroup = (inCustomGroup) => {
    return inCustomGroup && 
           inCustomGroup !== '00000000-0000-0000-0000-000000000000' &&
           inCustomGroup !== ''
}

/**
 * Gets a label for a custom group (optional, for future use)
 * @param {string} guid - The custom group GUID
 * @param {number} index - Optional index for fallback labeling
 * @returns {string}
 */
export const getCustomGroupLabel = (guid, index = 0) => {
    if (!isInCustomGroup(guid)) {
        return ''
    }
    
    // You could maintain a mapping of GUIDs to custom names here
    // For now, just return a simple label
    return `Custom Group ${index + 1}`
}