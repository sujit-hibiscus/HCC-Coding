"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const VARIANT_COLORS: Record<string, string> = {
    primary: "bg-primary",
    secondary: "bg-green-700",
};

interface LegendProps {
    items: { title?: string; variant: keyof typeof VARIANT_COLORS }[];
}

const Legend: React.FC<LegendProps> = ({ items }) => {
    return (
        <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {items.map(({ title, variant }, index) => (
                <div key={index} className="flex items-center gap-2">
                    <span
                        className={cn(
                            "w-4 h-4 rounded-full border border-muted",
                            VARIANT_COLORS[variant] || "bg-gray-500"
                        )}
                    />
                    <span className="text-sm font-medium text-foreground">{title}</span>
                </div>
            ))}
        </motion.div>
    );
};

export default Legend;
