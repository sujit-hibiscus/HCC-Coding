"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Typography } from "../ui/Typography";

const StepStatus = {
    PENDING: "pending",
    FAILED: "failed",
    SUCCESS: "success",
};

const processSteps = [
    {
        id: 1,
        title: "Chart got created",
        date: "02/04/2024",
        status: StepStatus.SUCCESS,
    },
    {
        id: 2,
        title: "Document fetching failed",
        date: "02/04/2024",
        status: StepStatus.FAILED,
    },
    {
        id: 3,
        title: "Document fetching retry initiated",
        date: "02/04/2024",
        status: StepStatus.PENDING,
    },
    {
        id: 4,
        title: "Manual document process initiated",
        date: "02/04/2024",
        status: StepStatus.PENDING,
    },
    {
        id: 5,
        title: "Chart preparation initiated",
        date: "02/04/2024",
        status: StepStatus.PENDING,
    },
    {
        id: 6,
        title: "Chart created",
        date: "02/04/2024",
        status: StepStatus.SUCCESS,
    },
];

const statusColors = {
    [StepStatus.PENDING]: "bg-yellow-500 before:bg-yellow-500 text-yellow-600",
    [StepStatus.FAILED]: "bg-red-500 before:bg-red-500 text-red-600",
    [StepStatus.SUCCESS]: "bg-green-500 before:bg-green-500 text-green-600",
};

export default function ProcessTimeline() {
    return (
        <div className="w-full mx-auto">
            <div className="gap-y-3 gap-x-3 grid lg:grid-cols-4">
                {processSteps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: [0.21, 1.11, 0.81, 0.99],
                        }}
                    >
                        <Card
                            className={cn(
                                "relative p-1.5 transition-all hover:shadow-lg cursor-pointer",
                                "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-l rounded-none",
                            )}
                        >
                            <motion.div initial={{ scale: 0.95 }} className="flex items-start gap-4">
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Typography variant="tab" className="text-black font-semibold">
                                            {step.id}.
                                        </Typography>
                                        <Typography variant="body" className="text-foreground font-medium">
                                            {step.title}
                                        </Typography>
                                    </div>
                                    <Typography variant="tab" className="text-gray-600 dark:text-gray-400">
                                        {step.date}
                                    </Typography>
                                </div>
                                <motion.div
                                    className={cn("h-4 w-4 rounded-full", statusColors[step.status])}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20,
                                        delay: index * 0.1 + 0.2,
                                    }}
                                />
                            </motion.div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}