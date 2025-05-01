"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DailyData } from "@/lib/types/dashboard";

interface ChartsChartProps {
  data: DailyData[]
}

export function ChartsChart({ data }: ChartsChartProps) {
  // Reverse the data to show days in ascending order (oldest to newest)
  const chartData = [...data].reverse();

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
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [`${value}`, "Charts"]}
                labelFormatter={(label) => `Day ${label}`}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
                  fontSize: "14px",
                  color: "#2d3748", // gray-700
                }}
                itemStyle={{
                  color: "#3182ce", // blue-600
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
                labelStyle={{
                  color: "#4a5568", // gray-600
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
                animationDuration={300}
              />

              <Bar
                dataKey="charts"
                name="Charts"
                fill="#0369a1"
                radius={[4, 4, 0, 0]}
                barSize={20}
                animationDuration={500}
                label={{
                  position: "top",
                  fill: "#0369a1",
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
