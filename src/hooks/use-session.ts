"use client";

import { useEffect, useState } from "react";
import { getSessionId, resetSessionId } from "@/lib/session";

/**
 * Hook for managing the chat session
 * @returns Object containing the session ID and functions to manage it
 */
export function useSession() {
    const [sessionId, setSessionId] = useState<string>("");

    useEffect(() => {
        // Initialize the session ID when the component mounts
        setSessionId(getSessionId());
    }, []);

    // Function to reset the session ID
    const resetSession = () => {
        const newSessionId = resetSessionId();
        setSessionId(newSessionId);
        return newSessionId;
    };

    return {
        sessionId,
        resetSession,
    };
}
