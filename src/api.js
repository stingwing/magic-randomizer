// Central API base used across the app.
// Uses environment variables in production, falls back to localhost in development

// For REST API calls
export const apiBase = import.meta.env.VITE_API_BASE || 'https://localhost:7086/api/Rooms'

// For SignalR hub (if needed separately)
export const signalRBase = import.meta.env.VITE_SIGNALR_BASE || 'https://localhost:7086'
