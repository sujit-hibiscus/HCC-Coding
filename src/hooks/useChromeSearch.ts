import { useState, useCallback, useEffect } from "react"

interface SearchMatch {
    element: Element
    originalText: string
    matchIndex: number
    globalIndex: number
}

export const useChromeSearch = () => {
    // Chrome-like search state
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0)
    const [totalMatches, setTotalMatches] = useState<number>(0)
    const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false)
    const [isCaseSensitive, setIsCaseSensitive] = useState<boolean>(false)
    const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([])

    // Clear all highlights
    const clearHighlights = useCallback(() => {
        console.log("🚀 ~ useChromeSearch ~ searchMatches:", searchMatches)

        document.querySelectorAll(".chrome-search-highlight, .chrome-search-current").forEach((el) => {
            const parent = el.parentNode
            if (parent) {
                parent.replaceChild(document.createTextNode(el.textContent || ""), el)
                parent.normalize()
            }
        })
    }, [])

    // Chrome-like search implementation
    const performChromeSearch = useCallback(
        (term: string) => {
            const trimmedTerm = term.trim();
            clearHighlights()

            if (!trimmedTerm) {
                setTotalMatches(0)
                setCurrentMatchIndex(0)
                setSearchMatches([])
                return
            }

            // Get all text elements
            const textElements = document.querySelectorAll(".rpv-core__text-layer span")
            const matches: SearchMatch[] = []
            let globalMatchIndex = 0

            textElements.forEach((element) => {
                const originalText = element.textContent || ""
                if (!originalText.trim()) return

                const searchText = isCaseSensitive ? originalText : originalText.toLowerCase()
                const searchPattern = isCaseSensitive ? trimmedTerm : trimmedTerm.toLowerCase()

                let startIndex = 0
                let matchIndex = searchText.indexOf(searchPattern, startIndex)

                // Find all matches in this element
                while (matchIndex !== -1) {
                    matches.push({
                        element,
                        originalText,
                        matchIndex,
                        globalIndex: globalMatchIndex,
                    })
                    globalMatchIndex++
                    startIndex = matchIndex + 1
                    matchIndex = searchText.indexOf(searchPattern, startIndex)
                }
            })

            // Apply highlights
            matches.forEach((match, index) => {
                const { element, originalText, matchIndex: localMatchIndex } = match
                const searchPattern = isCaseSensitive ? trimmedTerm : trimmedTerm.toLowerCase()
                const searchText = isCaseSensitive ? originalText : originalText.toLowerCase()

                let highlightedHTML = ""
                let lastIndex = 0
                let currentIndex = searchText.indexOf(searchPattern, 0)

                while (currentIndex !== -1) {
                    // Add text before match
                    highlightedHTML += originalText.substring(lastIndex, currentIndex)

                    // Add highlighted match
                    const matchText = originalText.substring(currentIndex, currentIndex + trimmedTerm.length)
                    highlightedHTML += `<span class=\"chrome-search-highlight\">${matchText}</span>`

                    lastIndex = currentIndex + trimmedTerm.length
                    currentIndex = searchText.indexOf(searchPattern, lastIndex)
                }

                // Add remaining text
                highlightedHTML += originalText.substring(lastIndex)

                element.innerHTML = highlightedHTML
            })

            setSearchMatches(matches)
            setTotalMatches(matches.length)

            if (matches.length > 0) {
                setCurrentMatchIndex(1)
                highlightCurrentMatch(0)
            } else {
                setCurrentMatchIndex(0)
            }
        },
        [isCaseSensitive, clearHighlights],
    )

    // Highlight current match
    const highlightCurrentMatch = useCallback((matchIndex: number, options?: { scroll?: boolean }) => {
        // Remove current highlight
        document.querySelectorAll(".chrome-search-current").forEach((el) => {
            el.classList.remove("chrome-search-current")
        })

        // Add current highlight
        const allHighlights = document.querySelectorAll(".chrome-search-highlight")
        if (allHighlights[matchIndex]) {
            allHighlights[matchIndex].classList.add("chrome-search-current")
            if (options?.scroll !== false) {
                allHighlights[matchIndex].scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest",
                })
            }
        }
    }, [])

    // Handle search input change
    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchTerm(value)
            performChromeSearch(value.trim())
        },
        [performChromeSearch],
    )

    // Navigate to next match
    const handleNextMatch = useCallback(() => {
        if (totalMatches === 0) return

        const nextIndex = currentMatchIndex >= totalMatches ? 1 : currentMatchIndex + 1
        setCurrentMatchIndex(nextIndex)
        highlightCurrentMatch(nextIndex - 1)
    }, [currentMatchIndex, totalMatches, highlightCurrentMatch])

    // Navigate to previous match
    const handlePreviousMatch = useCallback(() => {
        if (totalMatches === 0) return

        const prevIndex = currentMatchIndex <= 1 ? totalMatches : currentMatchIndex - 1
        setCurrentMatchIndex(prevIndex)
        highlightCurrentMatch(prevIndex - 1)
    }, [currentMatchIndex, totalMatches, highlightCurrentMatch])

    // Re-search when case sensitivity changes
    useEffect(() => {
        if (searchTerm.trim()) {
            performChromeSearch(searchTerm)
        }
    }, [isCaseSensitive, performChromeSearch, searchTerm])

    // Apply highlights only (no scroll)
    const applyHighlightsOnly = useCallback(
        (term: string) => {
            const trimmedTerm = term.trim();
            clearHighlights()

            if (!trimmedTerm) {
                setTotalMatches(0)
                setCurrentMatchIndex(0)
                setSearchMatches([])
                return
            }

            // Get all text elements
            const textElements = document.querySelectorAll(".rpv-core__text-layer span")
            const matches: SearchMatch[] = []
            let globalMatchIndex = 0

            textElements.forEach((element) => {
                const originalText = element.textContent || ""
                if (!originalText.trim()) return

                const searchText = isCaseSensitive ? originalText : originalText.toLowerCase()
                const searchPattern = isCaseSensitive ? trimmedTerm : trimmedTerm.toLowerCase()

                let startIndex = 0
                let matchIndex = searchText.indexOf(searchPattern, startIndex)

                // Find all matches in this element
                while (matchIndex !== -1) {
                    matches.push({
                        element,
                        originalText,
                        matchIndex,
                        globalIndex: globalMatchIndex,
                    })
                    globalMatchIndex++
                    startIndex = matchIndex + 1
                    matchIndex = searchText.indexOf(searchPattern, startIndex)
                }
            })

            // Apply highlights
            matches.forEach((match, index) => {
                const { element, originalText, matchIndex: localMatchIndex } = match
                const searchPattern = isCaseSensitive ? trimmedTerm : trimmedTerm.toLowerCase()
                const searchText = isCaseSensitive ? originalText : originalText.toLowerCase()

                let highlightedHTML = ""
                let lastIndex = 0
                let currentIndex = searchText.indexOf(searchPattern, 0)

                while (currentIndex !== -1) {
                    // Add text before match
                    highlightedHTML += originalText.substring(lastIndex, currentIndex)

                    // Add highlighted match
                    const matchText = originalText.substring(currentIndex, currentIndex + trimmedTerm.length)
                    highlightedHTML += `<span class=\"chrome-search-highlight\">${matchText}</span>`

                    lastIndex = currentIndex + trimmedTerm.length
                    currentIndex = searchText.indexOf(searchPattern, lastIndex)
                }

                // Add remaining text
                highlightedHTML += originalText.substring(lastIndex)

                element.innerHTML = highlightedHTML
            })

            // setSearchMatches(matches)
            // setTotalMatches(matches.length)
            // Restore the current match highlight (but do not scroll)
            if (matches.length > 0 && currentMatchIndex > 0 && currentMatchIndex <= matches.length) {
                highlightCurrentMatch(currentMatchIndex - 1, { scroll: false })
            }
        },
        [isCaseSensitive, clearHighlights, currentMatchIndex, highlightCurrentMatch],
    )

    return {
        // State
        searchTerm,
        setSearchTerm,
        currentMatchIndex,
        setCurrentMatchIndex,
        totalMatches,
        setTotalMatches,
        isSearchVisible,
        setIsSearchVisible,
        isCaseSensitive,
        setIsCaseSensitive,
        searchMatches,
        setSearchMatches,

        // Actions
        handleSearchChange,
        handleNextMatch,
        handlePreviousMatch,
        clearHighlights,
        performChromeSearch,
        applyHighlightsOnly,
    }
} 