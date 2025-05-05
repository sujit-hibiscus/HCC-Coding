"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRedux } from "@/hooks/use-redux";
import type { DailyData } from "@/lib/types/dashboard";
import { toggleChartTimeSeries } from "@/store/slices/dashboard-filters";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ChartLegendItem } from "./custom-chart-legend";
import { useEffect } from "react";

interface TimeSpentChartProps {
    data: DailyData[]
}

export function TimeSpentChart({ data }: TimeSpentChartProps) {
    const { selector, dispatch } = useRedux();
    const { activeChartTimeSeries: activeChartSeries } = selector((state) => state.dashboardFilters3);
    const chartData = [...data].reverse();
    const seriesCount = (activeChartSeries.analyst ? 1 : 0) + (activeChartSeries.auditor ? 1 : 0);
    const dynamicBarSize = Math.max(10, Math.min(400, 400 / (chartData.length * Math.max(seriesCount, 1))));

    const handleLegendClick = (dataKey: keyof typeof chartConfig) => {
        dispatch(toggleChartTimeSeries(dataKey as "auditor" | "analyst"));
    };

    useEffect(() => {
        if (Object?.values(activeChartSeries)?.every((item) => item === false)) {
            dispatch(toggleChartTimeSeries("auditor"));
            dispatch(toggleChartTimeSeries("analyst"));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeChartSeries]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white rounded-sm shadow-xl border border-gray-400 px-4 py-1.5">
                    <p className="font-semibold text-black mb-2">{label}</p>
                    {payload.map(
                        (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            entry: any,
                            index: number,
                        ) => {
                            const color = entry.dataKey === "analystTime" ? "#6366f1" : "#8b5cf6";
                            const name = entry.dataKey === "analystTime" ? "Analyst Time" : "Auditor Time";
                            const value = (entry.value / 60).toFixed(1);

                            return (
                                <div key={`item-${index}`} className="flex items-center mb-1 last:mb-0">
                                    <div className="w-2 h-4 mr-2" style={{ backgroundColor: color }} />
                                    <span className="text-gray-700 mr-2">{name}</span>
                                    <span className="font-medium ml-auto">{value}h</span>
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
        analyst: {
            label: "Analyst Time",
            color: "#6366f1",
        },
        auditor: {
            label: "Auditor Time",
            color: "#8b5cf6",
        },
    };

    return (
        <Card className="overflow-hidden px-0">
            <CardHeader className="p-0 pt-1">
                <CardTitle className="text-lg text-center">Daily Time Spent</CardTitle>
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
                            {activeChartSeries.analyst && (
                                <Bar
                                    dataKey="analystTime"
                                    name="Analyst Time"
                                    fill="#6366f1"
                                    radius={[4, 4, 0, 0]}
                                    barSize={dynamicBarSize}
                                    animationDuration={500}
                                    label={{
                                        position: "top",
                                        fill: "#6366f1",
                                        fontSize: 10,
                                        formatter: (value: number) => `${(value / 60).toFixed(1)}h`,
                                    }}
                                />
                            )}
                            {activeChartSeries.auditor && (
                                <Bar
                                    dataKey="auditorTime"
                                    name="Auditor Time"
                                    fill="#8b5cf6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={dynamicBarSize}
                                    animationDuration={500}
                                    label={{
                                        position: "top",
                                        fill: "#8b5cf6",
                                        fontSize: 10,
                                        formatter: (value: number) => `${(value / 60).toFixed(1)}h`,
                                    }}
                                />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex w-full flex-wrap gap-1.5 pb-1 justify-center">
                    {Object.entries(chartConfig).map(([key, config]) => {
                        return (
                            <ChartLegendItem
                                key={key}
                                label={config.label}
                                color={config.color}
                                isActive={activeChartSeries[key as keyof typeof activeChartSeries] === true}
                                onClick={() => handleLegendClick(key as keyof typeof chartConfig)}
                            />
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
