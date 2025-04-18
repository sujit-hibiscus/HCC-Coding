import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface PerformanceCircleProps {
    value?: number;
    size?: number;
}

export default function PerformanceCircle({ value = 75, size = 60 }: PerformanceCircleProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setTimeout(() => setProgress(value), 300);
    }, [value]);

    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2.1;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = ((100 - progress) / 100) * circumference;

    // Gradient color based on percentage
    const getGradient = () => {
        if (progress <= 25) return ["#dc2626", "#ef4444"]; // Red Shades
        if (progress <= 50) return ["#ea580c", "#f97316"]; // Orange Shades
        if (progress <= 75) return ["#ca8a04", "#facc15"]; // Yellow Shades
        return ["#16a34a", "#22c55e"]; // Green Shades
    };

    const [startColor, endColor] = getGradient();

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg className="absolute" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    className="stroke-gray-300 fill-none"
                />
            </svg>

            {/* Gradient Progress Circle */}
            <svg className="absolute rotate-[-90deg]" width={size} height={size}>
                <defs>
                    <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={startColor} />
                        <stop offset="100%" stopColor={endColor} />
                    </linearGradient>
                </defs>
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    className="fill-none"
                    stroke="url(#gradientStroke)"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                />
            </svg>

            {/* Animated Percentage Text */}
            <motion.span
                className="absolute font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(to right, ${startColor}, ${endColor})` }}
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {progress}%
            </motion.span>
        </div>
    );
}
