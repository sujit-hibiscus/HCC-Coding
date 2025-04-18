"use client";

import * as React from "react";
import { Search, X, Keyboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRedux } from "@/hooks/use-redux";
import { setGlobalSearch } from "@/store/slices/DashboardSlice";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "./badge";

export function GlobalSearchBar() {
    const { dispatch, selector } = useRedux();
    const { search = "" } = selector((state) => state?.dashboard);
    const setSearch = (searchValue: string) => dispatch(setGlobalSearch(searchValue));
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [isHovering, setIsHovering] = React.useState(false);

    // Keybinding: Ctrl + K to toggle search
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === "k") {
                event.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    React.useEffect(() => {
        if (isHovering) {
            const timer = setTimeout(() => setIsOpen(true), 300);
            return () => clearTimeout(timer);
        }
    }, [isHovering]);

    // Click outside listener
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (!search) {
                    setIsOpen(false);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [search]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsOpen(false);
    };

    const handleClose = () => {
        setIsOpen(false);
        setIsHovering(false);
    };

    const searchBarVariants = {
        closed: { width: 0, opacity: 0 },
        open: { width: "clamp(300px, 60vw, 600px)", opacity: 1 },
    };

    const buttonVariants = {
        hover: { scale: 1.1, rotate: 5 },
        tap: { scale: 0.9 },
    };

    return (
        <div className="fixed top-14 right-6 z-50" ref={containerRef}>
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={searchBarVariants}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-background border border-gray-300 rounded-full shadow-2xl overflow-hidden"
                    >
                        <form onSubmit={handleSearch} className="flex items-center p-1 pr-3">
                            <Input
                                ref={inputRef}
                                type="search"
                                placeholder="Search Chart..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex-grow shadow-none active:ring-0 border-none focus:ring-0 !focus-visible:ring-0 text-lg"
                                autoFocus
                            />
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant="ghost" size="icon" onClick={handleClose} className="ml-2">
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Close (Ctrl + K)</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </form>
                    </motion.div>
                ) : (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    whileTap="tap"
                                    variants={buttonVariants}
                                >
                                    <Button
                                        onClick={() => setIsOpen(true)}
                                        size="lg"
                                        className="rounded-full shadow-lg relative h-10 w-10"
                                    >
                                        <Search className="h-6 w-6" />
                                        {search && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute top-0 left-0 w-3 h-3 bg-green-500 rounded-full"
                                            />
                                        )}
                                        <Badge className="absolute -top-2 -right-2 bg-primary text-xs text-primary-foreground rounded-full p-2">
                                            <Keyboard />
                                        </Badge>
                                    </Button>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Search (Ctrl + K)</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </AnimatePresence>
        </div>
    );
}

