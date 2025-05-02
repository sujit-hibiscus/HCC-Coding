"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function usePreventSave(): void {
    const router = useRouter();

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
                router.push("/unauthorized");
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
