"use client";
import { logoutAction } from "@/app/action/auth-actions";
import devtoolsDetector from "devtools-detector";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useFullPath from "./use-fullpath";

export function usePreventSave(): void {
    const router = useRouter();
    const { fullPath } = useFullPath()
    useEffect(() => {
        console.log(fullPath, "fullPathfullPath");

    }, [fullPath])


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

        devtoolsDetector.addListener(handleDevToolsChange);
        devtoolsDetector.launch();

        // Strict: Check DevTools on visibility change and focus
        const checkDevToolsAndRedirect = async () => {
            if (devtoolsDetector.isOpen) {
                try {
                    await logoutAction();
                    router.push("/unauthorized");
                } catch (error) {
                    console.error("Logout failed:", error);
                }
            }
        };

        function handleVisibilityChange() {
            if (document.visibilityState === "visible") {
                checkDevToolsAndRedirect();
            }
        }
        function handleFocus() {
            checkDevToolsAndRedirect();
        }
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleFocus);

        const handleContextMenu = (e: MouseEvent): void => {
            e.preventDefault();
            e.stopPropagation();
        };
        const handleKeyDown = (e: KeyboardEvent): void => {
            const key = e.key.toLowerCase();
            const isBlocked =
                (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) || key === "f12" ||
                (e.altKey && key === "f12");

            if (isBlocked) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        document.addEventListener("contextmenu", handleContextMenu, true);
        document.addEventListener("keydown", handleKeyDown, true);

        return () => {
            devtoolsDetector.removeListener(handleDevToolsChange);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("contextmenu", handleContextMenu, true);
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [router]);
}
