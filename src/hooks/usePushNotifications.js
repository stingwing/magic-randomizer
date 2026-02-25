import { useState, useEffect } from 'react'
import { apiBase } from '../api'

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')
    
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export const usePushNotifications = (roomCode, participantId) => {
    const [isSupported, setIsSupported] = useState(false)
    const [subscription, setSubscription] = useState(null)
    const [permission, setPermission] = useState('default')
    const [error, setError] = useState(null)

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            setPermission(Notification.permission)
        }
    }, [])

    const subscribe = async () => {
        if (!isSupported) {
            throw new Error('Push notifications not supported')
        }

        if (!roomCode || !participantId) {
            throw new Error('Room code and participant ID required')
        }

        try {
            setError(null)

            // Request notification permission
            const permission = await Notification.requestPermission()
            setPermission(permission)

            if (permission !== 'granted') {
                throw new Error('Permission not granted')
            }

            // Register service worker
            const registration = await navigator.serviceWorker.register('/service-worker.js')
            await navigator.serviceWorker.ready

            // Get VAPID public key from your backend
            // TODO: Replace with your actual VAPID public key or fetch from backend
            const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY_HERE'
            
            // Or fetch from backend:
            // const vapidResponse = await fetch(`${apiBase}/push/vapid-public-key`)
            // const { publicKey } = await vapidResponse.json()

            // Subscribe to push notifications
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            })

            // Convert subscription to JSON
            const subscriptionJson = sub.toJSON()

            // Send subscription to your backend in the format it expects
            const response = await fetch(`${apiBase}/${roomCode}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participantId: participantId,
                    endpoint: subscriptionJson.endpoint,
                    keys: {
                        p256dh: subscriptionJson.keys.p256dh,
                        auth: subscriptionJson.keys.auth
                    }
                })
            })

            if (!response.ok) {
                throw new Error(`Failed to save subscription: ${response.status}`)
            }

            const result = await response.json()
            console.log('Subscription saved:', result.message)

            setSubscription(sub)
            return sub
        } catch (error) {
            console.error('Error subscribing to push notifications:', error)
            setError(error.message)
            throw error
        }
    }

    const unsubscribe = async () => {
        try {
            if (subscription) {
                await subscription.unsubscribe()
                setSubscription(null)
                
                // Optionally notify backend
                if (roomCode && participantId) {
                    await fetch(`${apiBase}/${roomCode}/unsubscribe`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ participantId })
                    }).catch(err => console.warn('Failed to notify backend of unsubscribe:', err))
                }
            }
        } catch (error) {
            console.error('Error unsubscribing:', error)
            setError(error.message)
        }
    }

    return { 
        isSupported, 
        permission, 
        subscription, 
        subscribe, 
        unsubscribe,
        error 
    }
}