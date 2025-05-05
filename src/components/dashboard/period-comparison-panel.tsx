"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PeriodMetrics } from "@/lib/types/dashboard";

interface PeriodComparisonPanelProps {
  title: string
  metrics: PeriodMetrics
  className?: string
  headerClassName?: string
}

export function PeriodComparisonPanel({
  title,
  metrics,
  className = "",
  headerClassName = "",
}: PeriodComparisonPanelProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className={`py-2 px-4 ${headerClassName}`}>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-5 text-center">
          <MetricHeader title="Total Assigned" />
          <MetricHeader title="Total Completed" />
          <MetricHeader title="Total Audited" />
          <MetricHeader title="Average Daily Productivity" />
          <MetricHeader title="Average Hours/day" />
        </div>
        <div className="grid grid-cols-5 text-center bg-white">
          <MetricValue value={metrics.totalAssigned} />
          <MetricValue value={metrics.totalCompleted} />
          <MetricValue value={metrics.totalAudited} />
          <MetricValue value={metrics.averageDailyProductivity} />
          <MetricValue value={(metrics.averageDailyTime / 60).toFixed(1)} suffix="h" />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricHeader({ title }: { title: string }) {
  return <div className="p-2 text-xs font-medium">{title}</div>;
}

function MetricValue({ value, suffix = "" }: { value: number | string; suffix?: string }) {
  return (
    <div className="p-3 text-lg font-semibold">
      {value}
      {suffix}
    </div>
  );
}
