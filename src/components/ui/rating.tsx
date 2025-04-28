"use client";

import type React from "react";

import { useState } from "react";
import { Star, StarHalf, CircleSlash } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
    value: number
    onChange: (value: number) => void
    max?: number
    allowHalf?: boolean
    className?: string
}

export function Rating({ value, onChange, max = 5, allowHalf = true, className }: RatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        if (!allowHalf) {
            setHoverValue(index);
            return;
        }

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const halfPoint = rect.left + rect.width / 2;

        if (event.clientX < halfPoint) {
            setHoverValue(index - 0.5);
        } else {
            setHoverValue(index);
        }
    };

    const handleMouseLeave = () => {
        setHoverValue(null);
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
        // If clicking on the same star that's already selected, don't do anything
        if (value === index) {
            return;
        }

        if (!allowHalf) {
            onChange(index);
            return;
        }

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const halfPoint = rect.left + rect.width / 2;

        if (event.clientX < halfPoint) {
            onChange(index - 0.5);
        } else {
            onChange(index);
        }
    };

    const handleZeroClick = () => {
        onChange(0);
    };

    const displayValue = hoverValue !== null ? hoverValue : value;

    return (
        <div className={cn("flex items-center gap-1", className)} onMouseLeave={handleMouseLeave}>
            <button
                type="button"
                className={cn("focus:outline-none p-1 rounded-full", displayValue === 0 ? "bg-gray-100" : "hover:bg-gray-50")}
                onClick={handleZeroClick}
                onMouseEnter={() => setHoverValue(0)}
                aria-label="No rating"
            >
                <CircleSlash className={cn("h-5 w-5", displayValue === 0 ? "text-gray-700" : "text-gray-300")} />
            </button>

            {Array.from({ length: max }).map((_, i) => {
                const starValue = i + 1;
                const isHalfStar = displayValue + 0.5 === starValue;
                const isFullStar = displayValue >= starValue;

                return (
                    <button
                        key={i}
                        type="button"
                        className="focus:outline-none p-1"
                        onMouseMove={(e) => handleMouseMove(e, starValue)}
                        onClick={(e) => handleClick(e, starValue)}
                        aria-label={`Rate ${starValue} out of ${max}`}
                    >
                        {isFullStar ? (
                            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        ) : isHalfStar ? (
                            <StarHalf className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        ) : (
                            <Star className="h-6 w-6 text-gray-300" />
                        )}
                    </button>
                );
            })}

            <span className="ml-2 text-sm font-semibold text-gray-700">
                {displayValue > 0 ? displayValue.toFixed(1).replace(/\.0$/, "") : "Not rated"}
            </span>
        </div>
    );
}
