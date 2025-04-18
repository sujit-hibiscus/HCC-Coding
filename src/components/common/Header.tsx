"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "../layout/ThemeToggle";
import { SidebarTrigger } from "../ui/sidebar";

export function Header() {
    const isMobile = useIsMobile();
    return (
        isMobile && <header className="sticky top-0 z-50 bg-background flex h-16 items-center justify-between border-b px-4 shadow-sm">
            <div className="flex gap-3">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <ThemeToggle />
        </header>
    );
}
