"use client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import React, { useCallback, useEffect, useRef } from "react";

interface SearchMatch {
  element: Element
  originalText: string
  matchIndex: number
  globalIndex: number
}

interface ChromeSearchBarProps {
  isSearchVisible: boolean
  setIsSearchVisible: (visible: boolean) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  currentMatchIndex: number
  setCurrentMatchIndex: (index: number) => void
  totalMatches: number
  setTotalMatches: (count: number) => void
  isCaseSensitive: boolean
  setIsCaseSensitive: (sensitive: boolean) => void
  searchMatches: SearchMatch[]
  setSearchMatches: (matches: SearchMatch[]) => void
  isDarkTheme: boolean
  onSearchChange: (value: string) => void
  onNextMatch: () => void
  onPreviousMatch: () => void
  onClearHighlights: () => void
}

const ChromeSearchBar: React.FC<ChromeSearchBarProps> = ({
  isSearchVisible,
  setIsSearchVisible,
  searchTerm,
  setSearchTerm,
  currentMatchIndex,
  totalMatches,
  isCaseSensitive,
  setIsCaseSensitive,
  isDarkTheme,
  onSearchChange,
  onNextMatch,
  onPreviousMatch,
  onClearHighlights,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          onPreviousMatch();
        } else {
          onNextMatch();
        }
      } else if (e.key === "Escape") {
        setIsSearchVisible(false);
        setSearchTerm("");
        onClearHighlights();
      }
    },
    [onNextMatch, onPreviousMatch, onClearHighlights, setIsSearchVisible, setSearchTerm],
  );

  // Focus search input when visible
  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setIsSearchVisible(true);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [setIsSearchVisible]);

  // Chrome-like search styles
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      /* Chrome-like search highlights */
      .chrome-search-highlight {
        background-color: #ffff00 !important;
        color: #000000 !important;
        border-radius: 1px;
        padding: 0;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
      }

      .chrome-search-current {
        background-color: #ff9632 !important;
        color: #000000 !important;
        outline: 2px solid #ff6600;
        outline-offset: 0px;
      }
      
      /* Chrome-like search bar */
      .chrome-search-bar {
        position: absolute;
        top: 60px;
        right: 20px;
        z-index: 1000;
        background: white;
        border: 1px solid #dadce0;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        padding: 8px;
        min-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: slideDown 0.15s ease-out;
      }
      
      .chrome-search-bar.dark {
        background: #2d2d2d;
        border-color: #5f6368;
        color: #e8eaed;
      }
      
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .chrome-search-input {
        border: none;
        outline: none;
        background: transparent;
        width: 100%;
        padding: 4px 8px;
        font-size: 14px;
        font-family: inherit;
      }
      
      .chrome-search-input.dark {
        color: #e8eaed;
      }
      
      .chrome-search-input::placeholder {
        color: #80868b;
      }
      
      .chrome-search-controls {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 4px;
        padding-top: 4px;
        border-top: 1px solid #dadce0;
      }
      
      .chrome-search-controls.dark {
        border-top-color: #5f6368;
      }
      
      .chrome-search-info {
        font-size: 12px;
        color: #5f6368;
        flex: 1;
        padding: 0 4px;
      }
      
      .chrome-search-info.dark {
        color: #9aa0a6;
      }
      
      .chrome-nav-btn {
        width: 24px;
        height: 24px;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #5f6368;
        transition: background-color 0.1s ease;
      }
      
      .chrome-nav-btn:hover:not(:disabled) {
        background-color: #f1f3f4;
      }
      
      .chrome-nav-btn:disabled {
        opacity: 0.4;
        cursor: default;
      }
      
      .chrome-nav-btn.dark {
        color: #9aa0a6;
      }
      
      .chrome-nav-btn.dark:hover:not(:disabled) {
        background-color: #3c4043;
      }
      
      .chrome-close-btn {
        width: 20px;
        height: 20px;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #5f6368;
        margin-left: 4px;
      }
      
      .chrome-close-btn:hover {
        background-color: #f1f3f4;
      }
      
      .chrome-close-btn.dark {
        color: #9aa0a6;
      }
      
      .chrome-close-btn.dark:hover {
        background-color: #3c4043;
      }
      
      .chrome-case-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: #5f6368;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 2px;
        user-select: none;
      }
      
      .chrome-case-toggle:hover {
        background-color: #f1f3f4;
      }
      
      .chrome-case-toggle.active {
        color: #1a73e8;
        background-color: #e8f0fe;
      }
      
      .chrome-case-toggle.dark {
        color: #9aa0a6;
      }
      
      .chrome-case-toggle.dark:hover {
        background-color: #3c4043;
      }
      
      .chrome-case-toggle.dark.active {
        color: #8ab4f8;
        background-color: #1a73e8;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const handleCloseSearch = () => {
    setIsSearchVisible(false);
    setSearchTerm("");
    onClearHighlights();
  };

  return (
    <>
      {/* Search Button in Toolbar */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className={`p-2 h-8 w-8 ${isSearchVisible ? "bg-blue-100 text-blue-600" : ""}`}
          >
            <Search className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" align="center">
          Search in PDF (Ctrl+F)
        </TooltipContent>
      </Tooltip>

      {/* Chrome-like Search Bar */}
      {isSearchVisible && (
        <div className={`chrome-search-bar ${isDarkTheme ? "dark" : ""}`}>
          <div className="flex items-center">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`chrome-search-input ${isDarkTheme ? "dark" : ""}`}
            />
            <button
              onClick={handleCloseSearch}
              className={`chrome-close-btn ${isDarkTheme ? "dark" : ""}`}
              title="Close"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className={`chrome-search-controls ${isDarkTheme ? "dark" : ""}`}>
            <div className={`chrome-search-info ${isDarkTheme ? "dark" : ""}`}>
              {searchTerm.trim() ? (totalMatches > 0 ? `${currentMatchIndex} of ${totalMatches}` : "No results") : ""}
            </div>

            <button
              onClick={onPreviousMatch}
              disabled={totalMatches === 0}
              className={`chrome-nav-btn ${isDarkTheme ? "dark" : ""}`}
              title="Previous"
            >
              <ChevronUp className="h-3 w-3" />
            </button>

            <button
              onClick={onNextMatch}
              disabled={totalMatches === 0}
              className={`chrome-nav-btn ${isDarkTheme ? "dark" : ""}`}
              title="Next"
            >
              <ChevronDown className="h-3 w-3" />
            </button>

            <div
              onClick={() => setIsCaseSensitive(!isCaseSensitive)}
              className={`chrome-case-toggle ${isCaseSensitive ? "active" : ""} ${isDarkTheme ? "dark" : ""}`}
              title="Match case"
            >
              Aa
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChromeSearchBar; 