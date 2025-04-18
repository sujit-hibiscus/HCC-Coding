import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ConfirmationDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
}

export function ConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Yes",
    cancelText = "No"
}: ConfirmationDialogProps) {
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
                            <DialogTitle className="text-lg text-center font-thin">
                                {title} <span className="font-bold">{description}</span>
                            </DialogTitle>

                        </DialogHeader>

                        <DialogFooter className="mt-4 flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className={cn(
                                    "w-[7.5rem] font-medium",
                                    "border-2",
                                    "transition-all duration-200 ease-in-out",
                                    "hover:shadow-md",
                                    "active:scale-95"
                                )}
                            >
                                {cancelText}
                            </Button>
                            <Button
                                variant={"destructive"}
                                onClick={onConfirm}
                                className={cn(
                                    "w-[7.5rem] font-medium",
                                    "transition-all duration-200 ease-in-out",
                                    "hover:shadow-md",
                                    "active:scale-95"
                                )}
                            >
                                {confirmText}
                            </Button>
                        </DialogFooter>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
