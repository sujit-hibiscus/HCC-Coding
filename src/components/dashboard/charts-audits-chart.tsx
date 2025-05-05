"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRedux } from "@/hooks/use-redux";
import type { DailyData } from "@/lib/types/dashboard";
import { toggleChartSeries } from "@/store/slices/dashboard-filters";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ChartLegendItem } from "./custom-chart-legend";
import { useEffect } from "react";

interface ChartsAuditsChartProps {
  data: DailyData[]
}

export function ChartsAuditsChart({ data }: ChartsAuditsChartProps) {
  const { selector, dispatch } = useRedux();
  const { activeChartSeries } = selector((state) => state.dashboardFilters3);
  const chartData = [...data].reverse();
  const seriesCount = (activeChartSeries.charts ? 1 : 0) + (activeChartSeries.audits ? 1 : 0);
  const dynamicBarSize = Math.max(10, Math.min(400, 400 / (chartData.length * Math.max(seriesCount, 1))));

  const handleLegendClick = (dataKey: keyof typeof chartConfig) => {
    dispatch(toggleChartSeries(dataKey as "charts" | "audits"));
  };

  useEffect(() => {
    if (Object?.values(activeChartSeries)?.every((item) => item === false)) {
      dispatch(toggleChartSeries("charts"));
      dispatch(toggleChartSeries("audits"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChartSeries]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-sm shadow-xl border border-gray-400 px-4 py-1.5">
          <p className="font-semibold text-black  mb-2">{label}</p>
          {payload.map(
            (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              entry: any,
              index: number,
            ) => {
              const color = entry.dataKey === "charts" ? "#e76e50" : "#2a9d90";
              const name = entry.dataKey === "charts" ? "Reviews" : "Audits";

              return (
                <div key={`item-${index}`} className="flex items-center mb-1 last:mb-0">
                  <div className="w-2 h-4 mr-2" style={{ backgroundColor: color }} />
                  <span className="text-gray-700 mr-2">{name}</span>
                  <span className="font-medium ml-auto">{entry.value}</span>
                </div>
              );
            },
          )}
        </div>
      );
    }
    return null;
  };

  const chartConfig = {
    charts: {
      label: "Reviews",
      color: "#e76e50",
    },
    audits: {
      label: "Audits",
      color: "#2a9d90",
    },
  } satisfies Record<"charts" | "audits", { label: string; color: string }>;

  return (
    <Card className="overflow-hidden px-0">
      <CardHeader className="p-0 pt-1">
        <CardTitle className="text-lg text-center">Daily Reviewed and Audited</CardTitle>
      </CardHeader>

      <CardContent className="p-0 w-full">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              {activeChartSeries.charts && (
                <Bar
                  dataKey="charts"
                  name="Reviews"
                  fill="#e76e50"
                  radius={[4, 4, 0, 0]}
                  barSize={dynamicBarSize}
                  animationDuration={500}
                  label={{
                    position: "top",
                    fill: "#e76e50",
                    fontSize: 10,
                    formatter: (value: string) => value,
                  }}
                />
              )}
              {activeChartSeries.audits && (
                <Bar
                  dataKey="audits"
                  name="Audits"
                  fill="#2a9d90"
                  radius={[4, 4, 0, 0]}
                  barSize={dynamicBarSize}
                  animationDuration={500}
                  label={{
                    position: "top",
                    fill: "#2a9d90",
                    fontSize: 10,
                    formatter: (value: string) => value,
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex w-full flex-wrap gap-1.5 pb-1 justify-center">
          {Object.entries(chartConfig).map(([key, config]) => (
            <ChartLegendItem
              key={key}
              label={config.label}
              color={config.color}
              isActive={activeChartSeries[key as "charts" | "audits"] === true}
              onClick={() => handleLegendClick(key as keyof typeof chartConfig)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
