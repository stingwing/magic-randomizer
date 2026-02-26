import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { validateUrlParam, validateHostCredentials } from '../utils/validation'
import { apiBase } from '../api'

/**
 * Custom hook to validate host credentials on mount
 * @param {string} code - Room code from URL params
 * @param {string} hostId - Host ID from URL params
 * @returns {Object} - Validation state and validated values
 */
export function useHostValidation(code, hostId) {
    const navigate = useNavigate()
    const [validatedCode, setValidatedCode] = useState('')
    const [validatedHostId, setValidatedHostId] = useState('')
    const [hostValidated, setHostValidated] = useState(false)
    const [validating, setValidating] = useState(true)
    const [validationError, setValidationError] = useState(null)

    useEffect(() => {
        const validateAndSetup = async () => {
            setValidating(true)
            
            // Validate URL parameter format
            const codeValidation = validateUrlParam(code)
            const hostIdValidation = validateUrlParam(hostId)

            if (!codeValidation.valid || !hostIdValidation.valid) {
                navigate('/')
                return
            }

            setValidatedCode(codeValidation.sanitized)
            setValidatedHostId(hostIdValidation.sanitized)

            // Validate host credentials with API
            const hostValidation = await validateHostCredentials(
                codeValidation.sanitized,
                hostIdValidation.sanitized,
                apiBase
            )

            if (!hostValidation.valid) {
                // Redirect to rejoin page with error message
                navigate('/rejoin/', {
                    state: {
                        error: hostValidation.error || 'Invalid host credentials. Please rejoin with a valid host ID.',
                        fromHostValidation: true
                    }
                })
                return
            }

            setHostValidated(true)
            setValidating(false)
        }

        validateAndSetup()
    }, [code, hostId, navigate])

    return {
        validatedCode,
        validatedHostId,
        hostValidated,
        validating,
        validationError
    }
}