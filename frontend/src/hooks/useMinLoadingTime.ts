import { useState, useEffect } from 'react';

/**
 * Hook to ensure a minimum loading time to prevent UI flicker
 * @param isLoading The actual loading state
 * @param minLoadingTime Minimum loading time in milliseconds (default: 500)
 * @returns A loading state that respects the minimum loading time
 */
export function useMinLoadingTime(isLoading: boolean, minLoadingTime: number = 125): boolean {
    const [showLoader, setShowLoader] = useState(isLoading);

    useEffect(() => {
        if (isLoading) {
            setShowLoader(true);
        } else {
            const timeout = setTimeout(() => {
                setShowLoader(false);
            }, minLoadingTime);
            return () => clearTimeout(timeout);
        }
    }, [isLoading, minLoadingTime]);

    return showLoader;
} 