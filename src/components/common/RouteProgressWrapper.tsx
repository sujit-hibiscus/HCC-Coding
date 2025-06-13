"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ProgressBar from "./ProgressBar";

export default function RouteProgressWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        setLoading(true);
        // Use requestAnimationFrame for smoother transitions
        requestAnimationFrame(() => {
            // Simulate minimum loading time for better UX
            setTimeout(() => {
                requestAnimationFrame(() => {
                    setLoading(false);
                });
            }, 300);
        });
    }, [pathname, mounted]);

    if (!mounted) {
        return <div className="h-full">{children}</div>;
    }

    return (
        <>
            <ProgressBar loading={loading} />
            <div className={`opacity-100 h-full transition-opacity duration-300 ${loading ? "max-h-screen" : ""}`}>
                {children}
            </div>
        </>
    );
} 