import { motion } from "framer-motion";
import React from "react";

interface NextImageProps {
    src: string | "";
    alt: string;
    height?: number;
    width?: number;
    className?: string;
}

const NextImage: React.FC<NextImageProps> = ({
    src,
    alt,
    height,
    width,
    className,
}) => {
    return (
        <div className={className}>
            <motion.img
                src={src}
                alt={alt}
                height={height}
                width={width}
            />
        </div>
    );
};

export default NextImage;