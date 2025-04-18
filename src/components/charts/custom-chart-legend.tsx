"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChartLegendItemProps {
    label: string
    color: string
    isActive: boolean
    onClick: () => void
}

export function ChartLegendItem({ label, color, isActive, onClick }: ChartLegendItemProps) {
    return (
        <motion.div
            onClick={onClick}
            initial={{ scale: 0.95 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "relative overflow-hidden cursor-pointer  px-3 py-1.5 transition-all duration-200",
                "border border-transparent shadow-sm",
                isActive
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "bg-gray-300/80 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400",
            )}
        >
            {/* Background color indicator */}
            <motion.div
                className="absolute inset-0 opacity-20"
                initial={{ opacity: isActive ? 0.2 : 0 }}
                animate={{ opacity: isActive ? 0.2 : 0 }}
                style={{ backgroundColor: color }}
            />

            {/* Left border indicator */}
            <motion.div
                className="absolute left-0 top-0 bottom-0 w-1"
                initial={{ opacity: isActive ? 1 : 0 }}
                animate={{ opacity: isActive ? 1 : 0 }}
                style={{ backgroundColor: color }}
            />

            <div className="flex items-center gap-2">
                <motion.div
                    className="w-3 h-3 flex-shrink-0"
                    style={{ backgroundColor: color }}
                    animate={{
                        scale: isActive ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                />
                <span className="text-xs font-medium whitespace-nowrap">{label}</span>
            </div>
        </motion.div>
    );
}
