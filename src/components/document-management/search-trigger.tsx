"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface SearchTriggerProps {
    onClick: () => void
}

export const SearchTrigger: React.FC<SearchTriggerProps> = ({ onClick }) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="fixed bottom-6 right-6 z-40">
                        <Button
                            onClick={onClick}
                            size="sm"
                            className="h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white border-0"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">
                    <p>Search document (Ctrl+F)</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
