self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {}
    
    const options = {
        title: data.title || 'Game Update',
        body: data.body,
        icon: '/icon-512x512.png',
        badge: '/badge-72x72.png',
        
        // Lock screen display
        image: data.image, // Large image for rich notifications
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true, // Stays until dismissed
        
        // Group notifications
        tag: `room-${data.roomCode}-${data.type}`,
        renotify: true,
        
        // Data for opening app
        data: {
            roomCode: data.roomCode,
            participantId: data.participantId,
            round: data.round,
            groupNumber: data.groupNumber,
            timestamp: Date.now()
        },
        
        // Actions on notification
        actions: [
            { action: 'view', title: '👀 View Game', icon: '/icons/view.png' },
            { action: 'report', title: '📝 Report Result', icon: '/icons/report.png' }
        ]
    }
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    
    if (event.action === 'view') {
        const urlToOpen = event.notification.data.url || '/'
        event.waitUntil(
            clients.openWindow(urlToOpen)
        )
    }
})