"use client";

import { motion } from "framer-motion";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
    const { setTheme, resolvedTheme, theme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="flex-shrink-0 border-none shadow-none sm:border-input " variant="outline" size="icon">
                    {/* Animated Sun Icon */}
                    <motion.span
                        key="sun"
                        initial={{ rotate: resolvedTheme === "dark" ? -90 : 0, scale: resolvedTheme === "dark" ? 0 : 1 }}
                        animate={{ rotate: resolvedTheme === "dark" ? -90 : 0, scale: resolvedTheme === "dark" ? 0 : 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute"
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem]" />
                    </motion.span>

                    {/* Animated Moon Icon */}
                    <motion.span
                        key="moon"
                        initial={{ rotate: resolvedTheme === "dark" ? 0 : 90, scale: resolvedTheme === "dark" ? 1 : 0 }}
                        animate={{ rotate: resolvedTheme === "dark" ? 0 : 90, scale: resolvedTheme === "dark" ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute"
                    >
                        <Moon className="h-[1.2rem] w-[1.2rem]" />
                    </motion.span>

                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
                {/* Light Theme Option */}
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={`flex rounded-none items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === "light" ? "bg-gray-200 dark:bg-gray-600" : ""}`}
                >
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                </DropdownMenuItem>

                {/* Dark Theme Option */}
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={`flex rounded-none items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === "dark" ? "bg-gray-200 dark:bg-gray-600" : ""}`}
                >
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                </DropdownMenuItem>

                {/* System Theme Option */}
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={`flex rounded-none items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${theme === "system" ? "bg-gray-200 dark:bg-gray-600" : ""}`}
                >
                    <Laptop className="h-4 w-4" />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
