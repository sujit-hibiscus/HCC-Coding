"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/action/auth-actions";
import devtoolsDetect from "devtools-detect";

export function usePreventSave(): void {
    const router = useRouter();

    useEffect(() => {
        const handleDevToolsChange = async (isOpen: boolean) => {
            if (isOpen) {
                try {
                    await logoutAction();
                    router.push("/unauthorized");
                } catch (error) {
                    console.error("Logout failed:", error);
                }
            }
        };

        // Initial check
        if (devtoolsDetect.isOpen) {
            handleDevToolsChange(true);
        }

        // Listen for devtools changes
        window.addEventListener("devtoolschange", (e: any) => {
            handleDevToolsChange(e.detail.isOpen);
        });

        // Prevent context menu
        const handleContextMenu = (e: MouseEvent): void => {
            e.preventDefault();
            e.stopPropagation();
        };

        // Prevent keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent): void => {
            const key = e.key.toLowerCase();
            const isBlocked =
                (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) || // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
                key === "f12" || // F12
                (e.altKey && key === "f12"); // Alt+F12

            if (isBlocked) {
                e.preventDefault();
                e.stopPropagation();
                // handleDevToolsChange(true);
            }
        };

        // Add event listeners
        document.addEventListener("contextmenu", handleContextMenu, true);
        document.addEventListener("keydown", handleKeyDown, true);

        return () => {
            window.removeEventListener("devtoolschange", handleDevToolsChange as any);
            document.removeEventListener("contextmenu", handleContextMenu, true);
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [router]);
}
