"use client";

import { useState, useRef, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { toggleFilter } from "@/store/slices/charts-filter-slice";
import { useRedux } from "@/hooks/use-redux";
import { ChartLegendItem } from "./custom-chart-legend";

interface VersionData {
  name: string
  date: string
  V24: {
    Suggested: number
    CarryForward: number
  }
  V28: {
    Suggested: number
    CarryForward: number
  }
}

interface VersionComparisonChartProps {
  data: VersionData[]
  isLoading?: boolean
  isExpanded?: boolean
  onExpand?: () => void
  type: "HCC" | "version"
}

const transformData = (data: VersionData[]) => {
  return data.map((item) => ({
    name: item.name,
    V24Total: item.V24.Suggested + item.V24.CarryForward,
    V24_Suggested: item.V24.Suggested,
    V24_CarryForward: item.V24.CarryForward,
    V28Total: item.V28.Suggested + item.V28.CarryForward,
    V28_Suggested: item.V28.Suggested,
    V28_CarryForward: item.V28.CarryForward,
  }));
};

export function HccVersionComparison({
  data,
  isLoading = false,
  isExpanded = false,
  type = "HCC",
}: VersionComparisonChartProps) {
  const targetKey = `HccVersion-${type}`;
  const { dispatch, selector } = useRedux();
  const activeKeys = selector((state) => state.chartsFilter.activeFilters[targetKey]) || [
    "V24_Suggested",
    "V24_CarryForward",
    "V28_Suggested",
    "V28_CarryForward",
  ];

  useEffect(() => {
    if (activeKeys.length === 0) {
      Object.keys(chartConfig).forEach((key) => {
        dispatch(toggleFilter({ chartId: `HccVersion-${type}`, filter: key }));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKeys, dispatch]);
  const flatData = transformData(data);
  const [chartWidth, setChartWidth] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  const isBarCount = true;

  const displayData = isExpanded ? flatData : flatData.slice(0, 15);

  useEffect(() => {
    if (chartRef.current) {
      const containerWidth = chartRef.current.offsetWidth;
      const minBarWidth = 40;
      const totalBarsWidth = displayData.length * minBarWidth * 2;

      setChartWidth(totalBarsWidth > containerWidth ? totalBarsWidth : 0);
    }
  }, [displayData.length]);

  const handleLegendClick = (dataKey: string) => {
    dispatch(toggleFilter({ chartId: targetKey, filter: dataKey }));
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[280px]" />;
  }

  const colorConfig = {
    V28: {
      Suggested: "hsl(210, 90%, 80%)",
      CarryForward: "hsl(210, 90%, 65%)",
    },
    V24: {
      Suggested: "hsl(150, 80%, 80%)",
      CarryForward: "hsl(150, 80%, 65%)",
    },
  };

  const chartConfig = {
    /* V24_Suggested: {
      label: "V24 Suggested",
      color: colorConfig.V24.Suggested,
    },
    V24_CarryForward: {
      label: "V24 Carry Forward",
      color: colorConfig.V24.CarryForward,
    }, */
    V28_Suggested: {
      label: "V28 Suggested",
      color: colorConfig.V28.Suggested,
    },
    V28_CarryForward: {
      label: "V28 Carry Forward",
      color: colorConfig.V28.CarryForward,
    },
  };

  return (
    <div className="px-1 relative pb-1">
      <div ref={chartRef} className="w-full overflow-x-auto relative">
        <ChartContainer config={chartConfig} className={`w-full ${isExpanded ? "h-[450px]" : "h-[320px]"}`}>
          <ResponsiveContainer width={chartWidth || "100%"} height="100%">
            <BarChart
              data={displayData}
              margin={{ top: 15, right: 15, left: 15, bottom: 20 }}
              barGap={3}
              barCategoryGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} interval={0} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />

              {/* {activeKeys.includes("V24_Suggested") && activeKeys.includes("V24_Suggested") && (
                <Bar
                  dataKey="V24_Suggested"
                  stackId="V24"
                  fill={colorConfig.V24.Suggested}
                  name="V24 Suggested"
                  radius={(!activeKeys.includes("V24_CarryForward")) ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                >
                  {isBarCount && (
                    <LabelList dataKey="V24_Suggested" position="center" fill="black" fontSize={10} fontWeight={700} />
                  )}
                </Bar>
              )} */}
              {/*  {activeKeys.includes("V24_CarryForward") && activeKeys.includes("V24_CarryForward") && (
                <Bar
                  dataKey="V24_CarryForward"
                  stackId="V24"
                  fill={colorConfig.V24.CarryForward}
                  name="V24 Carry Forward"
                  radius={[4, 4, 0, 0]}
                >
                  {isBarCount && (
                    <LabelList
                      dataKey="V24_CarryForward"
                      position="center"
                      fill="black"
                      fontSize={10}
                      fontWeight={700}
                    />
                  )}
                </Bar>
              )} */}

              {activeKeys.includes("V28_Suggested") && activeKeys.includes("V28_Suggested") && (
                <Bar
                  dataKey="V28_Suggested"
                  stackId="V28"
                  fill={colorConfig.V28.Suggested}
                  name="V28 Suggested"
                  radius={(!activeKeys.includes("V28_CarryForward")) ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                >
                  {isBarCount && (
                    <LabelList dataKey="V28_Suggested" position="center" fill="black" fontSize={10} fontWeight={700} />
                  )}
                </Bar>
              )}
              {activeKeys.includes("V28_CarryForward") && activeKeys.includes("V28_CarryForward") && (
                <Bar
                  dataKey="V28_CarryForward"
                  stackId="V28"
                  fill={colorConfig.V28.CarryForward}
                  name="V28 Carry Forward"
                  radius={[4, 4, 0, 0]}
                >
                  {isBarCount && (
                    <LabelList
                      dataKey="V28_CarryForward"
                      position="center"
                      fill="black"
                      fontSize={10}
                      fontWeight={700}
                    />
                  )}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      <div className="flex w-full flex-wrap gap-1.5 mt-3 justify-center">
        {Object.entries(chartConfig).map(([key, config]) => (
          <ChartLegendItem
            key={key}
            label={config.label}
            color={config.color}
            isActive={activeKeys.includes(key)}
            onClick={() => handleLegendClick(key)}
          />
        ))}
      </div>
    </div>
  );
}
