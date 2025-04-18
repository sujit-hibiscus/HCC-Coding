"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface RetryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    chartId: string;
    title?: string;
    description?: string;
}

export function RetryDialog({ isOpen, onClose, onConfirm, chartId, title = "Document Retrieval", description = "We've initiated the background retrieval process for" }: RetryDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[30rem] p-0 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10" />

                    <div className="relative p-6">
                        <DialogHeader>
                            <div className="flex justify-start gap-2 items-center">
                                <RefreshCw className="h-6 w-6 text-selectedText" />
                                <DialogTitle className="text-xl text-center font-semibold">
                                    {title}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-center mt-2 text-sm text-muted-foreground">
                                {description}
                                <span className="inline-flex items-center px-2.5 py-0.5 mx-2 rounded-full text-xs font-medium bg-primary/10 text-selectedText">
                                    Chart ID: {chartId}
                                </span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 text-center">
                            <div>
                                <Button
                                    variant="default"
                                    onClick={onConfirm}
                                    className={cn(
                                        "w-[7.5rem] font-medium",
                                        "transition-all duration-200 ease-in-out",
                                        "hover:shadow-md",
                                        "active:scale-95"
                                    )}
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}