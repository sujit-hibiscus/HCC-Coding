"use client";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import React from "react";
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from "recharts";

const COLORS = [
  "#4D96FF",
  "#A66DD4",
  "#F97316",
  "#22C55E",
  "#EC4899",
  "#F43F5E",
  "#10B981",
  "#6366F1",
  "#EAB308",
  "#0EA5E9",
];

interface TopHccCodesProps {
  data: {
    name: string
    value: number
  }[]
  version: "V24" | "V28"
}

export function TopHccCodes({ data, version }: TopHccCodesProps) {
  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: COLORS[index % COLORS.length],
  }));

  const chartConfig = chartData.reduce((acc, curr) => {
    acc[curr.name] = {
      label: curr.name,
      color: curr.fill,
    };
    return acc;
  }, {} as ChartConfig);

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius } = props;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontWeight="bold"
        fontSize="14"
        className="cursor-not-allowed"
      >
        {props.value}
      </text>
    );
  };

  return (
    <div className="py-2 max-h-[280px]">
      <ChartContainer config={chartConfig}>
        <div className="w-full max-h-[320px] h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={140}
                innerRadius={60}
                labelLine={false}
                label={renderCustomizedLabel}
                isAnimationActive
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                            {totalVisitors.toLocaleString()}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                            {version} Codes
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </div>
  );
}
