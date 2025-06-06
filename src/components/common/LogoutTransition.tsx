"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface LogoutTransitionProps {
    redirectPath?: string
    delay?: number
}

export default function LogoutTransition({
    redirectPath = "/login",
    delay = 2500
}: LogoutTransitionProps) {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push(redirectPath);
        }, delay);

        return () => clearTimeout(timer);
    }, [redirectPath, delay, router]);

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-900 flex flex-col items-center justify-center z-50">
            <div className="w-full max-w-md mx-auto flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-8"
                >
                    <motion.div
                        className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                        animate={{ boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 30px rgba(0,0,0,0.1)"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    >
                        <LogOut className="h-10 w-10 text-primary" />
                    </motion.div>
                    <motion.div
                        className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-2"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <Lock className="h-4 w-4" />
                    </motion.div>
                </motion.div>

                <motion.h2
                    className="text-2xl font-bold text-center mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    Logging Out
                </motion.h2>

                <motion.p
                    className="text-muted-foreground text-center mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    Securely signing you out of your account
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="flex items-center gap-2"
                >
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Redirecting to login...</span>
                </motion.div>
            </div>

            <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: delay / 1000, ease: "linear" }}
            />
        </div>
    );
}
