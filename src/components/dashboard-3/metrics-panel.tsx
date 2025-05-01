"use client";
import type { DashboardMetrics } from "@/lib/types/dashboard";
import { motion } from "framer-motion";
import { Activity, DollarSign, ShoppingCart, Users } from "lucide-react";

interface MetricsPanelProps {
  metrics: DashboardMetrics;
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Volume"
        value={metrics.totalVolume.toLocaleString()}
        icon={<DollarSign className="h-5 w-5 text-rose-500" />}
        change={"+20.1%"}
        changeText="from last month"
        className="bg-red-100 border-red-300"
        iconBg="bg-rose-50"
        delay={0.1}
      />
      <MetricCard
        title="Total Completed"
        value={metrics.totalCompleted.toLocaleString()}
        icon={<Users className="h-5 w-5 text-indigo-500" />}
        change={"+180.1%"}
        changeText="from last month"
        className="bg-green-100 border-green-300"
        iconBg="bg-indigo-50"
        delay={0.2}
      />
      <MetricCard
        title="Average Daily Productivity"
        value={metrics.averageDailyProductivity.toLocaleString()}
        icon={<ShoppingCart className="h-5 w-5 text-emerald-500" />}
        change={"+19%"}
        changeText="from last month"
        className="bg-blue-100 border-blue-300"
        iconBg="bg-emerald-50"
        delay={0.3}
      />
      <MetricCard
        title="Est Remaining Days"
        value={metrics.estRemainingDays.toLocaleString()}
        icon={<Activity className="h-5 w-5 text-amber-500" />}
        change={"+201"}
        changeText="since last hour"
        className="bg-yellow-100 border-yellow-300"
        iconBg="bg-amber-50"
        delay={0.4}
      />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeText?: string;
  className?: string;
  iconBg?: string;
  delay?: number;
}

function MetricCard({
  title,
  value,
  className,
  delay = 0
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`rounded-lg border-2 p-6 shadow-sm ${className}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className=" font-semibold text-lg text-gray-800">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        {/* <div className={`p-2 rounded-full ${iconBg}`}>
          {icon}
        </div> */}
      </div>
    </motion.div>
  );
}
