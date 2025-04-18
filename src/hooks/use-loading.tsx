"use client";

import { useState, useCallback } from "react";

type LoadingState = {
    [key: string]: boolean
}

export function useLoading(initialState: LoadingState = {}) {
    const [loadingState, setLoadingState] = useState<LoadingState>(initialState);

    const startLoading = useCallback((key: string) => {
        setLoadingState((prev) => ({ ...prev, [key]: true }));
    }, []);

    const stopLoading = useCallback((key: string) => {
        setLoadingState((prev) => ({ ...prev, [key]: false }));
    }, []);

    const isLoading = useCallback(
        (key: string) => {
            return !!loadingState[key];
        },
        [loadingState],
    );

    const withLoading = useCallback(
        async <T,>(key: string, fn: () => Promise<T>): Promise<T> => {
            try {
                startLoading(key);
                return await fn();
            } finally {
                stopLoading(key);
            }
        },
        [startLoading, stopLoading],
    );

    return {
        startLoading,
        stopLoading,
        isLoading,
        withLoading,
        loadingState,
    };
}

