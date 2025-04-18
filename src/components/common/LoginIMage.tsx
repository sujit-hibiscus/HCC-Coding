"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import { motion } from "framer-motion";

const LoginIMage = () => {
    const { resolvedTheme } = useTheme();
    return (
        <div className='w-full flex flex-col gap-1'>
            <div className='flex justify-center'>
                <Image
                    src={resolvedTheme === "dark" ? "/images/ADI-cropped.svg" : "/images/ADI-cropped.svg"}
                    alt="Brand Logo"
                    width={80}
                    height={10}
                    quality={100}
                    className="w-auto select-none rounded-md"
                    priority
                />
            </div>
            <motion.h1
                className="text-2xl font-poppins capitalize md:text-[40px] font-bold text-center leading-tight"
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                AI Assisted Document Improvement
            </motion.h1>

        </div>
    );
};

export default LoginIMage;