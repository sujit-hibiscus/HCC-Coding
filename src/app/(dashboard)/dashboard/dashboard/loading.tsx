"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function SkeletonDashboard() {
    return (
        <motion.div
            className="p-4 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Top Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
            </div>

            {/* Section Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))}
            </div>

            {/* Chart */}
            <div className="w-full h-64">
                <Skeleton className="h-full w-full rounded-xl" />
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-md" />
                    ))}
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-md" />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
