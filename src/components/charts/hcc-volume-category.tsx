"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

// Update the interface to include onExpand
interface HccVolumeCategoryProps {
  data: {
    name: string
    date: string
    Opportunities: number
    "Carry Forward": number
  }[]
  isLoading: boolean
  isExpanded: boolean
  onExpand: () => void
}

export function HccVolumeCategory({ data, isLoading, isExpanded }: HccVolumeCategoryProps) {
  const [activeKeys, setActiveKeys] = useState<string[]>(["Opportunities", "Carry Forward"]);
  const [chartWidth, setChartWidth] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  // Limit data to 15 items when not expanded
  const displayData = isExpanded ? data : data.slice(0, 15);

  // Adjust chart width based on data length and container width
  useEffect(() => {
    if (chartRef.current) {
      const containerWidth = chartRef.current.offsetWidth;
      const minBarWidth = 40; // Minimum width per bar
      const totalBarsWidth = displayData.length * minBarWidth * 2; // 2 bars per data point

      if (totalBarsWidth > containerWidth) {
        setChartWidth(totalBarsWidth);
      } else {
        setChartWidth(0); // Let ResponsiveContainer handle it
      }
    }
  }, [displayData, chartRef, isExpanded]);

  const handleLegendClick = (dataKey: string) => {
    setActiveKeys((prevKeys) => {
      if (prevKeys.includes(dataKey)) {
        return prevKeys.filter((key) => key !== dataKey);
      } else {
        return [...prevKeys, dataKey];
      }
    });
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  // Color configuration
  const colorConfig = {
    Opportunities: "hsl(215, 100%, 40%)",
    "Carry Forward": "hsl(30, 100%, 50%)",
  };

  return (
    <div className="px-2 pb-2">
      <motion.div
        ref={chartRef}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full overflow-x-auto relative"
      >
        <ChartContainer
          config={{
            Opportunities: {
              label: "Opportunities",
              color: colorConfig.Opportunities,
            },
            "Carry Forward": {
              label: "Carry Forward",
              color: colorConfig["Carry Forward"],
            },
          }}
          className={`w-full ${isExpanded ? "h-[450px]" : "h-[280px]"}`}
        >
          <ResponsiveContainer width={chartWidth || "100%"} height="100%">
            <BarChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                interval={0}
                angle={displayData.length > 7 ? -45 : 0}
                textAnchor={displayData.length > 7 ? "end" : "middle"}
                height={displayData.length > 7 ? 60 : 30}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
              <motion.g variants={itemVariants}>
                {activeKeys.includes("Opportunities") && (
                  <Bar
                    dataKey="Opportunities"
                    fill={colorConfig.Opportunities}
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                )}
              </motion.g>
              <motion.g variants={itemVariants}>
                {activeKeys.includes("Carry Forward") && (
                  <Bar
                    dataKey="Carry Forward"
                    fill={colorConfig["Carry Forward"]}
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                )}
              </motion.g>
            </BarChart>
          </ResponsiveContainer>

          {/*   {hasMoreData && (
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/80 p-1 rounded-l-md flex items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
              onClick={onExpand}
            >
              <span className="text-xs font-medium mr-1">...</span>
              <ChevronRight className="h-4 w-4 animate-pulse" />
            </div>
          )} */}
        </ChartContainer>
      </motion.div>

      {/* Filterable Legend */}
      <div className="flex flex-wrap gap-1 mt-2 justify-center">
        {Object.entries(colorConfig).map(([key, color]) => (
          <Badge
            key={key}
            variant={activeKeys.includes(key) ? "default" : "outline"}
            className="cursor-pointer transition-all hover:scale-105"
            style={{
              backgroundColor: activeKeys.includes(key) ? color : "transparent",
              borderColor: color,
              color: activeKeys.includes(key) ? "white" : "inherit",
            }}
            onClick={() => handleLegendClick(key)}
          >
            {key}
          </Badge>
        ))}
      </div>
    </div>
  );
}
