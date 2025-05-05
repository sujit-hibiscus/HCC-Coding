"use client";
import type { DashboardMetrics } from "@/lib/types/dashboard";
import type React from "react";

import { motion } from "framer-motion";
import { Activity, BarChart3, CheckCircle, ClipboardCheck, Users, UserCheck, CalendarDays } from "lucide-react";

interface MetricsPanelProps {
  metrics: DashboardMetrics
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <div className="grid xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-2">
      <MetricCard
        title="Quality Score"
        value={`${metrics.qualityScore}%`}
        icon={<CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
        className="bg-emerald-100 border-emerald-300"
        iconBg="bg-emerald-50"
        delay={0.05}
      />
      <MetricCard
        title="Total Volume"
        value={metrics.totalVolume.toLocaleString()}
        icon={<BarChart3 className="h-3.5 w-3.5 text-rose-500" />}
        className="bg-red-100 border-red-300"
        iconBg="bg-rose-50"
        delay={0.1}
      />
      <MetricCard
        title="Total Completed"
        value={metrics.totalCompleted.toLocaleString()}
        icon={<ClipboardCheck className="h-3.5 w-3.5 text-green-500" />}
        className="bg-green-100 border-green-300"
        iconBg="bg-indigo-50"
        delay={0.15}
      />
      <MetricCard
        title="Daily Productivity"
        value={metrics.averageDailyProductivity.toLocaleString()}
        icon={<Activity className="h-3.5 w-3.5 text-blue-500" />}
        className="bg-blue-100 border-blue-300"
        iconBg="bg-blue-50"
        delay={0.2}
      />
      <MetricCard
        title="Est Remaining Days"
        value={metrics.estRemainingDays.toLocaleString()}
        icon={<CalendarDays className="h-3.5 w-3.5 text-amber-500" />}
        className="bg-yellow-100 border-yellow-300"
        iconBg="bg-amber-50"
        delay={0.25}
      />
      <MetricCard
        title="Total Analysts"
        value={metrics.totalAnalysts.toString()}
        icon={<Users className="h-3.5 w-3.5 text-purple-500" />}
        className="bg-purple-100 border-purple-300"
        iconBg="bg-purple-50"
        delay={0.3}
      />
      <MetricCard
        title="Total Auditors"
        value={metrics.totalAuditors.toString()}
        icon={<UserCheck className="h-3.5 w-3.5 text-teal-500" />}
        className="bg-teal-100 border-teal-300"
        iconBg="bg-teal-50"
        delay={0.35}
      />
    </div>
  );
}

interface MetricCardProps {
  title: string
  value: string
  icon: React.ReactNode
  change?: string
  changeText?: string
  className?: string
  iconBg?: string
  delay?: number
}

function MetricCard({ title, value, icon, className, iconBg, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`rounded-lg border-2 p-3 shadow-sm ${className}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold  text-gray-800">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-1.5 rounded-full ${iconBg}`}>{icon}</div>
      </div>
    </motion.div>
  );
}
