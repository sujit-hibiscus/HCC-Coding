// Session management utilities

/**
 * Gets the current session ID or creates a new one if it doesn't exist
 * @returns The session ID
 */
export function getSessionId(): string {
    // Check if we're in a browser environment
    if (typeof window === "undefined") {
        return generateSessionId();
    }

    // Try to get the session ID from localStorage
    let sessionId = localStorage.getItem("vidura_session_id");

    // If no session ID exists, create a new one
    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem("vidura_session_id", sessionId);
    }

    return sessionId;
}

/**
 * Sets a specific session ID
 * @param sessionId The session ID to set
 */
export function setSessionId(sessionId: string): void {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
        localStorage.setItem("vidura_session_id", sessionId);
    }
}

/**
 * Generates a new random session ID
 * @returns A new session ID
 */
export function generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Resets the session ID (creates a new one)
 * @returns The new session ID
 */
export function resetSessionId(): string {
    const newSessionId = generateSessionId();
    if (typeof window !== "undefined") {
        localStorage.setItem("vidura_session_id", newSessionId);
    }
    return newSessionId;
}
