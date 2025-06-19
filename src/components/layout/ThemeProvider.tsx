"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

/**
 * Prevents hydration mismatch by ensuring that the ThemeProvider
 * is only rendered after the component has mounted on the client.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    const [isMounted, setIsMounted] = React.useState(false);

    // Delay rendering until after client-side mount to avoid hydration mismatch.
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        // Optional fallback to prevent flash of no content
        return <div className="h-screen bg-white" />;
    }

    return (
        <NextThemesProvider {...props}>{children}</NextThemesProvider>

    );
}