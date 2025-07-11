"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2, Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface FloatingSearchProps {
    isOpen: boolean
    searchTerm: string
    currentMatchIndex: number
    totalMatches: number
    isSearching: boolean
    onSearchChange: (term: string) => void
    onNext: () => void
    onPrevious: () => void
    onClose: () => void
}

export const FloatingSearch: React.FC<FloatingSearchProps> = ({
    isOpen,
    searchTerm,
    currentMatchIndex,
    totalMatches,
    isSearching,
    onSearchChange,
    onNext,
    onPrevious,
    onClose,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when search opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        duration: 0.2,
                    }}
                    className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-none shadow-2xl px-2 py-0.5 w-[320px]"
                >
                    <div className="flex items-center gap-2">
                        {/* Search Icon */}
                        <div className="flex-shrink-0">
                            {isSearching ? (
                                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4 text-gray-400" />
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="flex-1 min-w-0">
                            <Input
                                ref={inputRef}
                                type="text"
                                placeholder="Search in summary..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="h-8 text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        if (e.shiftKey) {
                                            onPrevious();
                                        } else {
                                            onNext();
                                        }
                                    }
                                }}
                            />
                        </div>

                        {/* Match Counter - Always show when there's a search term */}
                        {searchTerm && (
                            <div className="flex-shrink-0">
                                <div className="text-xs whitespace-nowrap text-gray-500 font-medium py-1 bg-gray-50 rounded">
                                    {totalMatches > 0 ? (
                                        <span className="text-blue-600 font-semibold">
                                            {currentMatchIndex + 1} of {totalMatches}
                                        </span>
                                    ) : searchTerm && !isSearching ? (
                                        <span className="text-blue-600 font-semibold">
                                            {currentMatchIndex + 1} of {totalMatches}
                                        </span>
                                    ) : (
                                        <span></span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons - Only show when there are matches */}
                        {totalMatches > 0 && (
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <Button
                                    variant="link"
                                    size="xs"
                                    onClick={onPrevious}
                                    disabled={totalMatches === 0 || isSearching}
                                    className="h-2 w-2 p-1 text-selectedText"
                                    title="Previous match (Shift+Enter)"
                                >
                                    <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="link"
                                    size="xs"
                                    onClick={onNext}
                                    disabled={totalMatches === 0 || isSearching}
                                    className="h-2 w-2 p-1 text-selectedText"
                                    title="Next match (Enter)"
                                >
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                            </div>
                        )}

                        {/* Close Button */}
                        <Button
                            variant="link"
                            size="sm"
                            onClick={onClose}
                            className="p-0 text-selectedText  flex-shrink-0"
                            title="Close search (Escape)"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
