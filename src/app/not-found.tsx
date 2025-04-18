"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileQuestion, Home, MoveLeft } from "lucide-react";
import { redirect, useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center space-y-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                >
                    <FileQuestion className="h-32 w-32 text-selectedText" />
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-selectedText">404</h1>
                    <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                        Page Not Found
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                        We couldn&apos;t find the page you&apos;re looking for. The path{" "}
                        <span className="font-mono bg-secondary px-2 py-1 rounded">
                            {currentPath}
                        </span>{" "}
                        doesn&apos;t exist.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Button
                        variant="default"
                        size="lg"
                        onClick={() => {
                            redirect("/");
                        }}
                        className="w-full sm:w-auto"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Go to Homepage
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto"
                    >
                        <MoveLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}