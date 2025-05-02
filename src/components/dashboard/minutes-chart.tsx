"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyData } from "@/lib/types/dashboard";
import { formatMinutes } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface MinutesChartProps {
  data: DailyData[]
}

export function MinutesChart({ data }: MinutesChartProps) {
  const chartData = [...data].reverse();
  const dynamicBarSize = Math.max(20, Math.min(700, 700 / chartData.length));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-sm shadow-xl border border-gray-400 px-4 py-1.5">
          <p className="font-semibold text-black  mb-2">{label}</p>
          {payload.map((entry: unknown, index: number) => (
            <div key={`item-${index}`} className="flex items-center mb-1 last:mb-0">
              <div className="w-2 h-4 mr-2" style={{ backgroundColor: "#005A9C" }} />
              <span className="text-gray-700 mr-3">Duration</span>
              <span className="font-medium text-gray-900 ml-auto">{formatMinutes((entry as { value: number }).value)}</span>
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
        <CardTitle className="text-lg text-center">Duration</CardTitle>
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
                dataKey="minutes"
                name="Duration"
                fill="#005A9C"
                radius={[4, 4, 0, 0]}
                barSize={dynamicBarSize}
                animationDuration={500}
                label={{
                  position: "top",
                  fill: "#005A9C",
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
