"use client";
import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { toggleFilter } from "@/store/slices/charts-filter-slice";
import { useRedux } from "@/hooks/use-redux";
import { ChartLegendItem } from "./custom-chart-legend";

interface HCCIdentifiedProps {
  data: {
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
  }[]
  isLoading?: boolean
  isExpanded?: boolean
  onExpand?: () => void
}

const chartConfig = {
  V24Suggested: {
    label: "V24 Suggested",
    color: "hsl(210, 90%, 80%)", // Light blue
  },
  V24CarryForward: {
    label: "V24 Carry Forward",
    color: "hsl(210, 90%, 65%)", // Slightly darker blue
  },
  V28Suggested: {
    label: "V28 Suggested",
    color: "hsl(150, 80%, 80%)", // Light green
  },
  V28CarryForward: {
    label: "V28 Carry Forward",
    color: "hsl(150, 80%, 65%)", // Slightly darker green
  },
} satisfies ChartConfig;

// Function to transform data for the chart
const transformData = (data: HCCIdentifiedProps["data"]) => {
  return data.map((item) => ({
    name: item.name,
    date: item.date,
    V24Suggested: item.V24?.Suggested || 0,
    V24CarryForward: item.V24?.CarryForward || 0,
    V28Suggested: item.V28?.Suggested || 0,
    V28CarryForward: item.V28?.CarryForward || 0,
  }));
};

export function HCCIdentified({ data, isLoading = false, isExpanded = false }: HCCIdentifiedProps) {
  const { selector, dispatch } = useRedux();
  const activeKeys = selector((state) => state.chartsFilter.activeFilters.HCCIdentified);
  const isBarCount = true;

  const [chartWidth, setChartWidth] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  const displayData = isExpanded ? data : data.slice(0, 15);
  const transformedData = transformData(displayData);

  useEffect(() => {
    if (chartRef.current) {
      const containerWidth = chartRef.current.offsetWidth;
      const minBarWidth = 40;
      const totalBarsWidth = displayData.length * minBarWidth;

      if (totalBarsWidth > containerWidth) {
        setChartWidth(totalBarsWidth);
      } else {
        setChartWidth(0);
      }
    }
  }, [displayData, chartRef, isExpanded]);

  const handleLegendClick = (dataKey: string) => {
    dispatch(toggleFilter({ chartId: "HCCIdentified", filter: dataKey }));
  };

  // Initialize activeKeys if empty
  useEffect(() => {
    if (activeKeys.length === 0) {
      Object.keys(chartConfig).forEach((key) => {
        dispatch(toggleFilter({ chartId: "HCCIdentified", filter: key }));
      });
    }
  }, [activeKeys, dispatch]);

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  return (
    <div className="px-1 relative pb-1">
      <div ref={chartRef} className="w-full overflow-x-auto relative">
        <ChartContainer config={chartConfig} className={`w-full ${isExpanded ? "h-[450px]" : "h-[320px]"}`}>
          <ResponsiveContainer width={chartWidth || "100%"} height="100%">
            <BarChart
              data={transformedData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              barGap={2}
              accessibilityLayer
            >
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
              <ChartTooltip content={<ChartTooltipContent />} />

              {activeKeys.includes("V24Suggested") && (
                <Bar
                  dataKey="V24Suggested"
                  name="V24 Suggested"
                  stackId="a"
                  fill={chartConfig.V24Suggested.color}
                  radius={activeKeys.length === 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                >
                  {isBarCount && (
                    <LabelList dataKey="V24Suggested" position="center" fill="black" fontSize={10} fontWeight={700} />
                  )}
                </Bar>
              )}

              {activeKeys.includes("V24CarryForward") && (
                <Bar
                  dataKey="V24CarryForward"
                  name="V24 Carry Forward"
                  stackId="a"
                  fill={chartConfig.V24CarryForward.color}
                  radius={
                    !activeKeys.includes("V28Suggested") && !activeKeys.includes("V28CarryForward")
                      ? [4, 4, 0, 0]
                      : [0, 0, 0, 0]
                  }
                >
                  {isBarCount && (
                    <LabelList
                      dataKey="V24CarryForward"
                      position="center"
                      fill="black"
                      fontSize={10}
                      fontWeight={700}
                    />
                  )}
                </Bar>
              )}

              {activeKeys.includes("V28Suggested") && (
                <Bar
                  dataKey="V28Suggested"
                  name="V28 Suggested"
                  stackId="a"
                  fill={chartConfig.V28Suggested.color}
                  radius={!activeKeys.includes("V28CarryForward") ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                >
                  {isBarCount && (
                    <LabelList dataKey="V28Suggested" position="center" fill="black" fontSize={10} fontWeight={700} />
                  )}
                </Bar>
              )}

              {activeKeys.includes("V28CarryForward") && (
                <Bar
                  dataKey="V28CarryForward"
                  name="V28 Carry Forward"
                  stackId="a"
                  fill={chartConfig.V28CarryForward.color}
                  radius={[4, 4, 0, 0]}
                >
                  {isBarCount && (
                    <LabelList
                      dataKey="V28CarryForward"
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
