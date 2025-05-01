"use client";
import type { DashboardMetrics } from "@/lib/types/dashboard";
import { motion } from "framer-motion";

interface MetricsPanelProps {
  metrics: DashboardMetrics
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-blue-700 rounded-md overflow-hidden">
      <MetricCard
        title="Total Volume"
        value={metrics.totalVolume.toLocaleString()}
        className="bg-[#000080]/80 text-white"
        delay={0.1}
      />
      <MetricCard
        title="Total Completed"
        value={metrics.totalCompleted.toLocaleString()}
        className="bg-[#000080]/80 text-white"
        delay={0.2}
      />
      <MetricCard
        title="Average Daily Productivity"
        value={metrics.averageDailyProductivity.toLocaleString()}
        className="bg-[#000080]/80 text-white"
        delay={0.3}
      />
      <MetricCard
        title="Est Remaining Days"
        value={metrics.estRemainingDays.toLocaleString()}
        className="bg-[#000080]/80 text-white"
        delay={0.4}
      />
    </div>
  );
}

interface MetricCardProps {
  title: string
  value: string
  className?: string
  delay?: number
}

function MetricCard({ title, value, className, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`text-center p-4 ${className}`}
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
}
