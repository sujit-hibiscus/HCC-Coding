"use client";
import { useEffect, useRef, useState } from "react";
import { CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { toggleFilter } from "@/store/slices/charts-filter-slice";
import { useRedux } from "@/hooks/use-redux";
import { ChartLegendItem } from "./custom-chart-legend";

interface ChartsVolumeProps {
  data: {
    name: string
    date: string
    Draft: number
    Pending: number
    "Provider Review": number
    Closed: number
  }[]
  isLoading?: boolean
  isExpanded?: boolean
  onExpand?: () => void
}

const chartConfig = {
  Pending: {
    label: "Pending",
    color: "hsl(40, 90%, 65%)", // Orange/Yellow
  },
  Draft: {
    label: "Draft",
    color: "hsl(210, 90%, 65%)", // Blue
  },
  Closed: {
    label: "Review",
    color: "hsl(270, 80%, 65%)", // Purple
  },
  "Provider Review": {
    label: "Provider Review",
    color: "hsl(150, 80%, 65%)", // Green
  },
} satisfies ChartConfig;

// Function to transform data for the chart
const transformData = (data: ChartsVolumeProps["data"]) => {
  return data.map((item) => ({
    name: item.name,
    date: item.date,
    Draft: item.Draft,
    Pending: item.Pending,
    "Provider Review": item["Provider Review"],
    Closed: item.Closed,
  }));
};

export function ChartsVolume({ data, isLoading = false, isExpanded = false }: ChartsVolumeProps) {
  const { selector, dispatch } = useRedux();
  const activeKeys = selector((state) => state.chartsFilter.activeFilters.chartsVolume);
  const [chartWidth, setChartWidth] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const isBarCount = false;

  const displayData = isExpanded ? data : data.slice(0, 15);
  const transformedData = transformData(displayData);

  useEffect(() => {
    if (chartRef.current) {
      const containerWidth = chartRef.current.offsetWidth;
      const minPointWidth = 40;
      const totalPointsWidth = displayData.length * minPointWidth;

      if (totalPointsWidth > containerWidth) {
        setChartWidth(totalPointsWidth);
      } else {
        setChartWidth(0);
      }
    }
  }, [displayData, chartRef, isExpanded]);

  const handleLegendClick = (dataKey: string) => {
    dispatch(toggleFilter({ chartId: "chartsVolume", filter: dataKey }));
  };

  // Initialize activeKeys if empty
  useEffect(() => {
    if (activeKeys.length === 0) {
      Object.keys(chartConfig).forEach((key) => {
        dispatch(toggleFilter({ chartId: "chartsVolume", filter: key }));
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
            <LineChart data={transformedData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }} accessibilityLayer>
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

              {activeKeys.includes("Pending") && (
                <Line
                  type="monotone"
                  dataKey="Pending"
                  stroke={chartConfig?.Pending?.color}
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                >
                  {isBarCount && <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />}
                </Line>
              )}
              {activeKeys.includes("Draft") && (
                <Line
                  type="monotone"
                  dataKey="Draft"
                  stroke={chartConfig?.Draft?.color}
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                >
                  {isBarCount && <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />}
                </Line>
              )}

              {activeKeys.includes("Closed") && (
                <Line
                  type="monotone"
                  dataKey="Closed"
                  stroke={chartConfig?.Closed?.color}
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                >
                  {isBarCount && <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />}
                </Line>
              )}

              {activeKeys.includes("Provider Review") && (
                <Line
                  type="monotone"
                  dataKey="Provider Review"
                  stroke={chartConfig?.["Provider Review"]?.color}
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                >
                  {isBarCount && <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />}
                </Line>
              )}


            </LineChart>
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
