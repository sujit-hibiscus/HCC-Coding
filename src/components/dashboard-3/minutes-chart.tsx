"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyData } from "@/lib/types/dashboard";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface MinutesChartProps {
  data: DailyData[]
}


export function MinutesChart({ data }: MinutesChartProps) {
  // Reverse the data to show days in ascending order (oldest to newest)
  const chartData = [...data].reverse();

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
              {/* <CartesianGrid strokeDasharray="3 3" vertical={false} /> */}
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              {/* <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} /> */}
              <Tooltip
                formatter={(value) => [`${value} min`, "Duration"]}
                labelFormatter={(label) => `Day ${label}`}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  fontSize: "14px",
                  color: "#2d3748",
                }}
                itemStyle={{
                  color: "#2b6cb0",
                  fontWeight: 500,
                  marginBottom: "6px",
                }}
                labelStyle={{
                  color: "#4a5568",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
                animationDuration={300}
              />

              <Bar
                dataKey="minutes"
                name="Duration"
                fill="#005A9C"
                radius={[4, 4, 0, 0]}
                barSize={20}
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
