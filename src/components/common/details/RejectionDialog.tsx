import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

interface RejectionDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (reason: string) => void
    title?: string
}

export function RejectionDialog({ isOpen, onClose, onConfirm, title = "Confirm Rejection" }: RejectionDialogProps) {
    const [reason, setReason] = useState("");

    const handleConfirm = () => {
        onConfirm(reason);
        setReason("");
        onClose();
    };

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
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent dark:from-red-500/10" />

                    <div className="relative p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-center">{title}</DialogTitle>
                        </DialogHeader>

                        <div className="my-6">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <Textarea
                                    placeholder="Enter reason for rejection..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="min-h-[6.25rem] resize-none"
                                />
                            </motion.div>
                        </div>

                        <DialogFooter className="flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className={cn(
                                    "w-[7.5rem] font-medium",
                                    "border-2",
                                    "transition-all duration-200 ease-in-out",
                                    "hover:shadow-md",
                                    "active:scale-95",
                                )}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleConfirm}
                                disabled={!reason.trim()}
                                className={cn(
                                    "w-[7.5rem] font-medium",
                                    "transition-all duration-200 ease-in-out",
                                    "hover:shadow-md",
                                    "active:scale-95",
                                )}
                            >
                                Reject
                            </Button>
                        </DialogFooter>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}

