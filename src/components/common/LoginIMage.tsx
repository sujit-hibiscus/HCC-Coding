"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DocumentSkeleton from "@/app/(dashboard)/dashboard/loading";
import { Typography } from "../ui/Typography";

const LoginIMage = () => {
    const { resolvedTheme } = useTheme();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    if (!(isClient)) {
        return <DocumentSkeleton />;
    }
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

            <motion.div
                className="font-poppins capitalize text-center leading-tight"
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <Typography variant="big-heading">
                    HCC Coding
                </Typography>
            </motion.div>

        </div>
    );
};

export default LoginIMage;