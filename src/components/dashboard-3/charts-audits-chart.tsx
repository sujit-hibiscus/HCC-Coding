"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { DailyData } from "@/lib/types/dashboard";
import { useRedux } from "@/hooks/use-redux";
import { toggleChartSeries } from "@/store/slices/dashboard-filters-3";

interface ChartsAuditsChartProps {
  data: DailyData[]
}

export function ChartsAuditsChart({ data }: ChartsAuditsChartProps) {
  const { selector, dispatch } = useRedux();
  const { activeChartSeries } = selector((state) => state.dashboardFilters3);

  // Reverse the data to show days in ascending order (oldest to newest)
  const chartData = [...data].reverse();

  const handleLegendClick = (dataKey: "charts" | "audits") => {
    dispatch(toggleChartSeries(dataKey));
  };

  return (
    <Card className="overflow-hidden px-0">
      <CardHeader className="p-0 pt-1">
        <CardTitle className="text-lg text-center">Daily Charts and Audits</CardTitle>
      </CardHeader>
      <CardContent className="p-0 w-full">
        <div className="h-[320px] w-full">
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
                formatter={(value) => [`${value}`, ""]}
                labelFormatter={(label) => `Day ${label}`}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                  padding: "8px",
                }}
                animationDuration={300}
              />
              <Legend
                onClick={(e) => handleLegendClick(e.dataKey as "charts" | "audits")}
                wrapperStyle={{ cursor: "pointer" }}
              />
              {activeChartSeries.charts && (
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
              )}
              {activeChartSeries.audits && (
                <Bar
                  dataKey="audits"
                  name="Audits"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                  animationDuration={500}
                  label={{
                    position: "top",
                    fill: "#f97316",
                    fontSize: 10,
                    formatter: (value: string) => value,
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
