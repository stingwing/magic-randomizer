import { useEffect, useRef, useState } from 'react'
import { signalRBase } from '../api'

/**
 * Search for commanders by query string
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results (default: 20)
 * @returns {Promise<string[]>} Array of commander names
 */
export const searchCommanders = async (query, limit = 20) => {
    if (!query || query.trim().length < 2) {
        return []
    }

    try {
        const response = await fetch(
            `${signalRBase}/Api/Commanders/search?query=${encodeURIComponent(query)}&format=Commander&limit=${limit}`
        )

        if (!response.ok) {
            console.error('Commander search failed:', response.status)
            return []
        }

        const data = await response.json()
        return data.results ? data.results.map(result => result.name) : []
    } catch (err) {
        console.error('Commander search error:', err)
        return []
    }
}

/**
 * Custom hook for managing commander search with debouncing and dropdown state
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns {Object} Search state and handlers
 */
export const useCommanderSearch = (debounceMs = 300) => {
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef(null)
    const inputRef = useRef(null)
    const searchTimeoutRef = useRef(null)

    const performSearch = async (query) => {
        if (!query || query.trim().length < 2) {
            setResults([])
            setShowDropdown(false)
            return
        }

        setLoading(true)
        const commanderNames = await searchCommanders(query)
        setResults(commanderNames)
        setShowDropdown(commanderNames.length > 0)
        setLoading(false)
    }

    const debouncedSearch = (query) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        searchTimeoutRef.current = setTimeout(() => {
            performSearch(query)
        }, debounceMs)
    }

    const clearSearch = () => {
        setResults([])
        setShowDropdown(false)
        setLoading(false)
    }

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [])

    return {
        results,
        loading,
        showDropdown,
        setShowDropdown,
        dropdownRef,
        inputRef,
        debouncedSearch,
        clearSearch
    }
}