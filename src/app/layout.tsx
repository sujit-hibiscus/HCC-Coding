"use client";

import ScrollToTopButton from "@/components/common/scroll-top-top";
import ToastProvider from "@/components/common/ToastProvider";
import { resetReduxStore } from "@/store";
import ReduxProvider from "@/store/ReduxProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense, useEffect, useRef, useState } from "react";
import { logoutAction } from "./action/auth-actions";
import "./globals.css";
import Loading from "./loading";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Hybrid: Poll buildId cookie every 1s and check on tab focus/visibilitychange
    const lastBuildIdRef = useRef<string | undefined>(undefined);
    function getBuildIdCookie() {
        return document.cookie
            .split("; ")
            .find((row) => row.startsWith("buildId="))
            ?.split("=")[1];
    }
    function resetAndRedirect() {
        logoutAction();
        setTimeout(() => {
            resetReduxStore();
        }, 1000);
        window.location.href = "/";
    }
    useEffect(() => {
        lastBuildIdRef.current = getBuildIdCookie();
        const checkBuildId = () => {
            const currentBuildId = getBuildIdCookie();
            if (
                lastBuildIdRef.current &&
                currentBuildId &&
                lastBuildIdRef.current !== currentBuildId
            ) {
                resetAndRedirect();
            }
            lastBuildIdRef.current = currentBuildId;
        };
        const interval = setInterval(checkBuildId, 1000);
        window.addEventListener("visibilitychange", checkBuildId);
        window.addEventListener("focus", checkBuildId);
        return () => {
            clearInterval(interval);
            window.removeEventListener("visibilitychange", checkBuildId);
            window.removeEventListener("focus", checkBuildId);
        };
    }, []);

    if (!mounted) {
        return (
            <html lang="en" suppressHydrationWarning>
                <body className="custom-scroll" suppressHydrationWarning>
                    <Loading />
                </body>
            </html>
        );
    }
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>HCC Coding</title>
            </head>
            <body className="custom-scroll" suppressHydrationWarning>
                <ReduxProvider>
                    <Suspense
                        fallback={<Loading />}
                        unstable_expectedLoadTime={100}
                    >
                        <div
                            className="page-transition min-h-screen"
                            style={{
                                contain: "layout style paint",
                                willChange: "transform"
                            }}
                        >
                            {children}
                        </div>
                    </Suspense>
                    <ScrollToTopButton />
                    <SpeedInsights />
                    <ToastProvider />
                </ReduxProvider>
            </body>
        </html>
    );
}