import ScrollToTopButton from "@/components/common/scroll-top-top";
import ToastProvider from "@/components/common/ToastProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import ReduxProvider from "@/store/ReduxProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import "./globals.css";
import Loading from "./loading";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <title>HCC Coding Platform</title>
            <body className="custom-scroll">
                <ReduxProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Suspense
                            fallback={<Loading />}
                            unstable_expectedLoadTime={100}
                        >
                            <div
                                className="page-transition  min-h-screen"
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
                    </ThemeProvider>
                </ReduxProvider>
                <ToastProvider />
            </body>
        </html>
    );
}
