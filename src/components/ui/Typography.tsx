import type React from "react";
import { cn } from "@/lib/utils";

type TypographyProps = {
    variant: "big-heading" | "heading" | "subheading" | "body" | "tab" | "value" | "label" | "description" | "card-title";
    children: React.ReactNode;
    className?: string;
};

export function Typography({ variant, children, className }: TypographyProps) {
    const baseStyles = "text-foreground";

    const variantStyles = {
        "big-heading": "text-xl font-extrabold leading-tight sm:text-3xl md:text-4xl lg:text-4xl",
        heading: "text-xl font-semibold leading-snug sm:text-2xl md:text-3xl",
        subheading: "text-lg font-semibold leading-snug sm:text-xl md:text-2xl",
        body: "text-sm leading-normal sm:text-base md:text-lg",
        description: "text-xs text-gray-700 dark:text-gray-300 sm:text-sm md:text-base",
        tab: "text-xs font-medium leading-relaxed text-tabBg dark:text-gray-200 sm:text-sm md:text-[15px]",
        "card-title": "text-gray-900 dark:text-gray-100 font-semibold text-base sm:text-lg",
        label: "text-xs text-gray-600 dark:text-gray-400 sm:text-sm",
        value: "font-medium text-gray-900 dark:text-gray-200 text-sm sm:text-base",
    };

    const Element = variant === "body" || variant === "description" ? "p" : "h2";

    return <Element className={cn(baseStyles, variantStyles[variant], className)}>{children}</Element>;
}
