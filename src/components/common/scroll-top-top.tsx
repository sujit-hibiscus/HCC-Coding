"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import useFullPath from "@/hooks/use-fullpath";

export default function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);
    const { fullPath } = useFullPath();

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 100);
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        fullPath !== "/dashboard" && <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-6 right-6 z-50"
        >
            <Button
                onClick={scrollToTop}
                variant="secondary" // Works with ShadCN themes
                className="rounded-full p-3 shadow-lg"
            >
                <ChevronUp className="w-5 h-5" />
            </Button>
        </motion.div>
    );
}
