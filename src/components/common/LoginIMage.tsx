"use client";
import DocumentSkeleton from "@/app/(dashboard)/dashboard/loading";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Typography } from "../ui/Typography";

const LoginIMage = () => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    if (!(isClient)) {
        return <DocumentSkeleton />;
    }
    return (
        <div className='w-full flex flex-col gap-1'>
            <motion.div
                className="font-poppins capitalize text-center leading-tight"
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <Typography variant="big-heading" className="">
                    HCC Coding Portal
                </Typography>
            </motion.div>

        </div>
    );
};

export default LoginIMage;