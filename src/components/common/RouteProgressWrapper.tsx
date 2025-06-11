"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ProgressBar from "./ProgressBar";
import ProgressiveLoader from "./ProgressiveLoader";

export default function RouteProgressWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();


    const [loading, setLoading] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        setLoading(true);
        setShowLoader(true);

        // Use requestAnimationFrame for smoother transitions
        requestAnimationFrame(() => {
            // Simulate minimum loading time for better UX
            setTimeout(() => {
                requestAnimationFrame(() => {
                    setLoading(false);
                    // Keep the loader visible for a bit longer for smooth transition
                    setTimeout(() => {
                        setShowLoader(false);
                    }, 300);
                });
            }, 300);
        });
    }, [pathname]);

    return (
        <>
            <ProgressBar loading={loading} />
            {(showLoader && !(pathname?.includes("dashboard/charts"))) && <div className={`absolute z-[111111] 
            ${pathname === "/dashboard" ? "right-0 " : "bottom-0 right-0"}
            `}
                style={{
                    height: "100%",
                    width: "100%",
                    "--header-height": "0.4rem",
                    "--tab-bar-height": "2.5rem"
                } as React.CSSProperties}
            >
                {<ProgressiveLoader />}
            </div>}
            <div className={`opacity-100  h-full transition-opacity duration-300
            ${showLoader ? "max-h-screen" : ""}
            `}>
                {children}
            </div>
        </>
    );
} 