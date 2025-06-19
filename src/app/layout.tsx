"use client";

import ScrollToTopButton from "@/components/common/scroll-top-top";
import ToastProvider from "@/components/common/ToastProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import ReduxProvider from "@/store/ReduxProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense, useEffect, useState } from "react";
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

    if (!mounted) {
        return (
            <html lang="en" suppressHydrationWarning>
                <head>
                    <title>HCC Coding</title>
                </head>
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
