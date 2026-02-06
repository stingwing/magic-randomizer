// Central API base used across the app.
// Uses environment variables in production, falls back to localhost in development

// For REST API calls
export const apiBase = import.meta.env.VITE_API_BASE || 'https://localhost:7086/api/Rooms'

// For SignalR hub (if needed separately)
export const signalRBase = import.meta.env.VITE_SIGNALR_BASE || 'https://localhost:7086'

// Temporary logging to debug environment variables
console.log('🔍 API Configuration Debug:')
console.log('  VITE_API_BASE env var:', import.meta.env.VITE_API_BASE)
console.log('  VITE_SIGNALR_BASE env var:', import.meta.env.VITE_SIGNALR_BASE)
console.log('  Final apiBase:', apiBase)
console.log('  Final signalRBase:', signalRBase)
console.log('  Environment mode:', import.meta.env.MODE)
console.log('  Is production:', import.meta.env.PROD)
