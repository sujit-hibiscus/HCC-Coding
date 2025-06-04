"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/action/auth-actions";

export function usePreventSave(): void {
    const router = useRouter();

    const [isDevToolOpen, setIsDevToolOpen] = useState(false);

    useEffect(() => {
        const detectDevTools = () => {
            const threshold = 100;

            const start = performance.now();
            const duration = performance.now() - start;

            if (duration > threshold) {
                setIsDevToolOpen(true);
            } else {
                setIsDevToolOpen(false);
            }
        };

        const interval = setInterval(detectDevTools, 2000);
        return () => clearInterval(interval);
    }, []);

    const logOutAndRedirect = async () => {
        logoutAction().then(() => {
            router.push("/unauthorized");
        });
    }
    if (isDevToolOpen) {
        logOutAndRedirect()
    }


    useEffect(() => {
        const handleContextMenu = (e: MouseEvent): void => {
            e.preventDefault();
        };


        const handleKeyDown = (e: KeyboardEvent): void => {
            const key = e.key.toLowerCase();

            const isBlocked =
                (e.ctrlKey && !e.shiftKey && ["s", "u", "p"].includes(key)) ||
                (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) ||
                key === "f12";

            if (isBlocked) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        const detectDevTools = (): boolean => {
            const widthThreshold = 160;
            const heightThreshold = 100;

            const { outerWidth, innerWidth, outerHeight, innerHeight } = window;

            return (
                outerWidth - innerWidth > widthThreshold ||
                outerHeight - innerHeight > heightThreshold
            );
        };
        const interval = setInterval(() => {
            if (detectDevTools()) {
                logOutAndRedirect();
            }
        }, 1000);

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            clearInterval(interval);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [router]);
}
