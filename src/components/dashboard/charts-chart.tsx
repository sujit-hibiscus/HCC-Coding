"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyData } from "@/lib/types/dashboard";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface ChartsChartProps {
  data: DailyData[]
}

export function ChartsChart({ data }: ChartsChartProps) {
  const chartData = [...data].reverse();

  const dynamicBarSize = Math.max(20, Math.min(700, 700 / chartData.length));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-sm shadow-xl border border-gray-400 px-4 py-1.5">
          <p className="font-semibold text-black  mb-2">{label}</p>
          {payload.map((
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center mb-1 last:mb-0">
              <div className="w-2 h-4 mr-2" style={{ backgroundColor: entry.color || "#2a9d90" }} />
              <span className="text-gray-700 mr-2">Charts</span>
              <span className="font-medium ml-auto">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden px-0">
      <CardHeader className="p-0 pt-1">
        <CardTitle className="text-lg text-center">Charts</CardTitle>
      </CardHeader>
      <CardContent className="p-0 w-full">
        <div className="h-[300px] w-full">
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
              <Bar
                dataKey="charts"
                name="Charts"
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
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
