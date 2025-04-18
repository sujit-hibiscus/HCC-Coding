"use client";

import { motion } from "framer-motion";
import { Loader2, LoaderCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoaderVariant = "spinner" | "dots" | "pulse" | "skeleton" | "table"
type LoaderSize = "sm" | "md" | "lg"
type LoaderProps = {
    variant?: LoaderVariant
    size?: LoaderSize
    text?: string
    className?: string
    fullScreen?: boolean
    rowCount?: number
}

export function Loader({
    variant = "spinner",
    size = "md",
    text,
    rowCount = 9,
    className,
    fullScreen = false,
}: LoaderProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
    };

    const containerClasses = cn(
        "flex items-center justify-center gap-3",
        fullScreen && "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
        className
    );

    const renderLoader = () => {
        switch (variant) {
            case "spinner":
                return (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className={cn(sizeClasses[size])}
                    >
                        <Loader2 className="h-full w-full text-primary" />
                    </motion.div>
                );
            case "dots":
                return (
                    <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    delay: i * 0.15,
                                }}
                                className={cn(
                                    "rounded-full bg-primary",
                                    size === "sm" && "h-1.5 w-1.5",
                                    size === "md" && "h-2 w-2",
                                    size === "lg" && "h-3 w-3"
                                )}
                            />
                        ))}
                    </div>
                );
            case "pulse":
                return (
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className={cn(
                            "rounded-full bg-primary/20 flex items-center justify-center",
                            size === "sm" && "h-8 w-8",
                            size === "md" && "h-12 w-12",
                            size === "lg" && "h-16 w-16"
                        )}
                    >
                        <LoaderCircle className={cn(
                            "text-primary",
                            size === "sm" && "h-4 w-4",
                            size === "md" && "h-6 w-6",
                            size === "lg" && "h-8 w-8"
                        )} />
                    </motion.div>
                );
            case "table":
                return (
                    <div className="w-full  h-full space-y-4">
                        <div className="flex items-center w-full border-b pb-2">
                            {["11.25rem", "11.25rem", "12.5rem", "7.5rem", "10rem", "11.25rem", "11.25rem", "11.875rem", "9.375rem", "12.5rem"].map((width, i) => (
                                <div key={i} className="flex-shrink-0" style={{ width }}>
                                    <Skeleton className="h-4 w-4/5" />
                                </div>
                            ))}
                        </div>
                        {[...Array(rowCount)].map((_, row) => (
                            <div key={row} className="flex items-center w-full py-4">
                                {["11.25rem", "11.25rem", "12.5rem", "7.5rem", "10rem", "11.25rem", "11.25rem", "11.875rem", "9.375rem", "12.5rem"].map((width, i) => (
                                    <div key={i} className="flex-shrink-0" style={{ width }}>
                                        <Skeleton className="h-4 w-4/5" />
                                    </div>
                                ))}
                            </div>
                        ))}
                        <div className="flex items-center justify-between mt-4">
                            <Skeleton className="h-8 w-24" />
                            <div className="flex space-x-2">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-8 w-8" />
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={containerClasses}>
            {renderLoader()}
            {text && <p className="text-sm font-medium">{text}</p>}
        </div>
    );
}