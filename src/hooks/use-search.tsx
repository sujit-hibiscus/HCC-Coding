"use client";

import type React from "react";

import { useCallback, useEffect, useRef, useState } from "react";

interface SearchMatch {
    index: number
    element: HTMLElement
    text: string
}

export const useSearch = (containerRef: React.RefObject<HTMLDivElement | null>) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [matches, setMatches] = useState<SearchMatch[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const highlightedElementsRef = useRef<HTMLElement[]>([]);

    // Clear previous highlights
    const clearHighlights = useCallback(() => {
        highlightedElementsRef.current.forEach((element) => {
            const parent = element.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(element.textContent || ""), element);
                parent.normalize();
            }
        });
        highlightedElementsRef.current = [];
    }, []);

    // Highlight text matches
    const highlightMatches = useCallback(
        (term: string) => {
            if (!containerRef.current || !term.trim()) {
                clearHighlights();
                return [];
            }

            clearHighlights();
            const container = containerRef.current;
            const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);

            const textNodes: Text[] = [];
            let node: Text | null;

            while ((node = walker.nextNode() as Text)) {
                textNodes.push(node);
            }

            const foundMatches: SearchMatch[] = [];
            // Trim the search term and create case-insensitive regex
            const trimmedTerm = term.trim();
            const regex = new RegExp(trimmedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");

            textNodes.forEach((textNode) => {
                const text = textNode.textContent || "";
                const matches = Array.from(text.matchAll(regex));

                if (matches.length > 0) {
                    const parent = textNode.parentNode;
                    if (!parent) return;

                    let lastIndex = 0;
                    const fragment = document.createDocumentFragment();

                    matches.forEach((match) => {
                        const matchIndex = match.index!;

                        // Add text before match
                        if (matchIndex > lastIndex) {
                            fragment.appendChild(document.createTextNode(text.slice(lastIndex, matchIndex)));
                        }

                        // Create highlighted element
                        const highlightElement = document.createElement("mark");
                        highlightElement.className = "bg-yellow-300 text-black search-highlight";
                        highlightElement.style.backgroundColor = "#fde047"; // Ensure yellow background
                        highlightElement.style.color = "#000000"; // Ensure black text
                        highlightElement.textContent = match[0];
                        highlightedElementsRef.current.push(highlightElement);
                        fragment.appendChild(highlightElement);

                        foundMatches.push({
                            index: foundMatches.length,
                            element: highlightElement,
                            text: match[0],
                        });

                        lastIndex = matchIndex + match[0].length;
                    });

                    // Add remaining text
                    if (lastIndex < text.length) {
                        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
                    }

                    parent.replaceChild(fragment, textNode);
                }
            });

            return foundMatches;
        },
        [containerRef, clearHighlights],
    );

    // Search function
    const performSearch = useCallback(
        async (term: string) => {
            // Trim the search term before processing
            const trimmedTerm = term.trim();

            if (!trimmedTerm) {
                setMatches([]);
                setCurrentMatchIndex(0);
                clearHighlights();
                return;
            }

            setIsSearching(true);

            // Small delay to show loading state
            await new Promise((resolve) => setTimeout(resolve, 100));

            const foundMatches = highlightMatches(trimmedTerm);
            setMatches(foundMatches);
            setCurrentMatchIndex(foundMatches.length > 0 ? 0 : -1);
            setIsSearching(false);
        },
        [highlightMatches, clearHighlights],
    );

    // Navigate to specific match
    const goToMatch = useCallback(
        (index: number) => {
            if (index < 0 || index >= matches.length) return;

            const match = matches[index];
            if (match.element) {
                // Remove current highlight from all matches
                matches.forEach((m) => {
                    if (m.element) {
                        // Reset to default yellow highlight
                        m.element.style.backgroundColor = "#fde047"; // yellow-300
                        m.element.style.color = "#000000"; // black
                        m.element.classList.remove("bg-orange-500", "text-white");
                        m.element.classList.add("bg-yellow-300", "text-black");
                    }
                });

                // Highlight current match with distinct orange styling
                match.element.style.backgroundColor = "#f97316"; // orange-500
                match.element.style.color = "#ffffff"; // white
                match.element.classList.remove("bg-yellow-300", "text-black");
                match.element.classList.add("bg-orange-500", "text-white");

                // Scroll to match with smooth behavior
                match.element.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest",
                });

                setCurrentMatchIndex(index);
            }
        },
        [matches],
    );

    // Navigate to next match
    const nextMatch = useCallback(() => {
        if (matches.length === 0) return;
        const nextIndex = (currentMatchIndex + 1) % matches.length;
        goToMatch(nextIndex);
    }, [matches.length, currentMatchIndex, goToMatch]);

    // Navigate to previous match
    const previousMatch = useCallback(() => {
        if (matches.length === 0) return;
        const prevIndex = currentMatchIndex <= 0 ? matches.length - 1 : currentMatchIndex - 1;
        goToMatch(prevIndex);
    }, [matches.length, currentMatchIndex, goToMatch]);

    // Handle search term change
    const handleSearchChange = useCallback(
        (term: string) => {
            setSearchTerm(term);
            performSearch(term);
        },
        [performSearch],
    );

    // Open search
    const openSearch = useCallback(() => {
        setIsSearchOpen(true);
    }, []);

    // Close search
    const closeSearch = useCallback(() => {
        setIsSearchOpen(false);
        setSearchTerm("");
        setMatches([]);
        setCurrentMatchIndex(0);
        clearHighlights();
    }, [clearHighlights]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + F to open search
            if ((e.ctrlKey || e.metaKey) && e.key === "f") {
                e.preventDefault();
                openSearch();
                return;
            }

            // Escape to close search
            if (e.key === "Escape" && isSearchOpen) {
                closeSearch();
                return;
            }

            // Enter to go to next match
            if (e.key === "Enter" && isSearchOpen && matches.length > 0) {
                e.preventDefault();
                if (e.shiftKey) {
                    previousMatch();
                } else {
                    nextMatch();
                }
                return;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isSearchOpen, matches.length, nextMatch, previousMatch, openSearch, closeSearch]);

    // Auto-navigate to first match when search results change
    useEffect(() => {
        if (matches.length > 0 && currentMatchIndex === 0) {
            goToMatch(0);
        }
    }, [matches.length, currentMatchIndex, goToMatch]);

    return {
        searchTerm,
        isSearchOpen,
        currentMatchIndex,
        matches,
        isSearching,
        totalMatches: matches.length,
        handleSearchChange,
        nextMatch,
        previousMatch,
        openSearch,
        closeSearch,
        goToMatch,
    };
};
