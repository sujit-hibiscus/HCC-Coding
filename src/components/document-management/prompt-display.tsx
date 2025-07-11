"use client";
import type { ReactNode } from "react";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { Typography } from "@/components/ui/Typography";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSearch } from "@/hooks/use-search";
import { FloatingSearch } from "./floating-search";

interface PromptDisplayProps {
    content: string
}

export interface PromptDisplayRef {
    openSearch: () => void
}

const PromptDisplay = forwardRef<PromptDisplayRef, PromptDisplayProps>(({ content }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const {
        searchTerm,
        isSearchOpen,
        currentMatchIndex,
        totalMatches,
        isSearching,
        handleSearchChange,
        nextMatch,
        previousMatch,
        openSearch,
        closeSearch,
    } = useSearch(containerRef);

    // Expose openSearch function to parent component via ref
    useImperativeHandle(ref, () => ({
        openSearch,
    }));

    const renderFormattedText = (text: string, key: number) => {
        console.info("🚀 ~ renderFormattedText ~ key:", key);
        const parts = text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return (
                    <strong key={i} className={"font-semibold text-gray-800"}>
                        {part.substring(2, part.length - 2)}
                    </strong>
                );
            }
            return part;
        });
        return <>{parts}</>;
    };

    const lines = content.split("\n");
    const elements: ReactNode[] = [];
    let listItems: ReactNode[] = [];
    let tableRows: { code: string; description: string }[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`list-${elements.length}`} className="mt-2 space-y-1 pl-5">
                    {listItems}
                </ul>,
            );
            listItems = [];
        }
    };

    const flushTable = () => {
        if (tableRows.length > 0) {
            elements.push(
                <div key={`table-${elements.length}`} className="my-4 overflow-x-auto">
                    <table className="w-full border min-w-[400px] text-left">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-2 border-r text-xs font-semibold uppercase tracking-wider text-gray-600">Code</th>
                                <th className="p-2 text-xs font-semibold uppercase tracking-wider text-gray-600">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, i) => (
                                <tr key={i} className="border-b last:border-b-0">
                                    <td className="p-2 border-r font-mono text-xs text-blue-700 align-top">{row.code}</td>
                                    <td className="p-2 text-xs text-gray-800 align-top">{row.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>,
            );
            tableRows = [];
        }
    };

    lines.forEach((line, index) => {
        // Check for titles first, they break lists and tables
        if (line.startsWith("# ")) {
            flushList();
            flushTable();
            elements.push(
                <Typography key={index} variant="heading" className="font-bold text-black">
                    {line.substring(2)}
                </Typography>,
            );
            return;
        }

        if (line.startsWith("## ")) {
            flushList();
            flushTable();
            elements.push(
                <div key={index}>
                    <Separator className="my-1" />
                    <Typography variant="subheading" className="pt-2 font-semibold text-gray-800">
                        {line.substring(3)?.replace(/^PASS \d+:\s*/, "")}
                    </Typography>
                </div>,
            );
            return;
        }

        if (line.startsWith("### ")) {
            flushList();
            flushTable();
            elements.push(
                <Typography key={index} variant="card-title" className="mb-2 mt-2 text-lg font-semibold text-gray-800">
                    {line.substring(4)}
                </Typography>,
            );
            return;
        }

        // Numbered list for the code set (table)
        const codeMatch = line.match(/^\d+\.\s+([A-Z0-9.]+)\s+-\s+(.*)/);
        if (codeMatch) {
            flushList(); // A table starts, so any existing list should be rendered.
            const [, code, description] = codeMatch;
            tableRows.push({ code, description });
            return;
        }

        // Unordered list
        if (line.trim().startsWith("- ")) {
            flushTable(); // A list starts, flush table
            listItems.push(
                <li key={index} className="list-disc text-xs text-gray-700">
                    {renderFormattedText(line.trim().substring(2), index)}
                </li>,
            );
            return;
        }

        flushList();
        flushTable();

        if (line.trim() === "") {
            elements.push(<div key={index} className="h-2" />); // Represents a line break
        } else {
            elements.push(
                <Typography key={index} variant="label" className="my-2 leading-relaxed text-xs text-gray-800">
                    {renderFormattedText(line, index)}
                </Typography>,
            );
        }
    });

    // Flush any remaining items
    flushList();
    flushTable();

    return (
        <TooltipProvider>
            <div className="relative h-full">
                <Card className="h-full p-0 border-0 shadow-none !bg-white">
                    <CardContent ref={containerRef} className="font-sans p-0 pb-1 h-full overflow-y-auto">
                        {elements}
                    </CardContent>
                </Card>

                {/* Search Components */}
                <FloatingSearch
                    isOpen={isSearchOpen}
                    searchTerm={searchTerm}
                    currentMatchIndex={currentMatchIndex}
                    totalMatches={totalMatches}
                    isSearching={isSearching}
                    onSearchChange={handleSearchChange}
                    onNext={nextMatch}
                    onPrevious={previousMatch}
                    onClose={closeSearch}
                />
            </div>
        </TooltipProvider>
    );
});

PromptDisplay.displayName = "PromptDisplay";

export default PromptDisplay;
