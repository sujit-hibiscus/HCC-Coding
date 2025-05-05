"use client";

import { Button } from "@/components/ui/button";
import { useRedux } from "@/hooks/use-redux";
import { loadDashboardData, resetDashboard, setDashboardData, setDateRange } from "@/store/slices/dashboard-filters";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { Download, RefreshCw, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { CalendarDateRangePicker } from "../common/data-table/CalendarDateRangePicker";
import { Loader } from "../ui/Loader";
import { AnalystTable } from "./analyst-table";
import { ChartsAuditsChart } from "./charts-audits-chart";
import { generateDashboardData } from "./data-generator";
import { MetricsPanel } from "./metrics-panel";
import { PeriodComparisonPanel } from "./period-comparison-panel";
import { QualityMetricsTable } from "./quality-metrics-table";
import { TimeSpentChart } from "./time-spent-chart";

export function AdminDashboard() {
  const { selector, dispatch } = useRedux();
  const { dateRange, dashboardData, isDirty, isLoading, filtersApplied } = selector((state) => state.dashboardFilters3);
  // const userType = selector((state) => state.user.userType);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading && dateRange[0] && dateRange[1]) {
      if (!isNaN(dateRange[0].getTime()) && !isNaN(dateRange[1].getTime())) {
        const newData = generateDashboardData(dateRange[0], dateRange[1]);
        dispatch(setDashboardData(newData));
      }
    }
  }, [isLoading, dateRange, dispatch]);

  const handleDateRangeChange = (range: [Date | null, Date | null]) => {
    dispatch(setDateRange(range));
  };

  const handleLoadData = () => {
    dispatch(loadDashboardData());
  };

  const handleResetFilters = () => {
    dispatch(resetDashboard());
  };

  const handleExportToImage = async () => {
    if (!dashboardRef.current) return;

    try {
      const dataUrl = await toPng(dashboardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `admin-dashboard-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error exporting dashboard:", error);
    }
  };

  if (!dashboardData) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <motion.div
      ref={dashboardRef}
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
        <div className="flex items-center gap-2">{/* Removed redundant title */}</div>
        <div className="flex flex-wrap items-center gap-2">
          {filtersApplied && (
            <Button variant="blue" onClick={handleResetFilters} className="h-8 px-2 lg:px-3">
              <span className="hidden md:inline-block">Reset</span>
              <X className="md:ml-2 h-4 w-4" />
            </Button>
          )}
          <CalendarDateRangePicker dateRange={dateRange} setDateRange={handleDateRangeChange} />
          <Button
            onClick={handleLoadData}
            className="px-6 rounded-sm flex items-center gap-2"
            size="sm"
            disabled={!isDirty || isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin h-4 w-4" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Load
              </>
            )}
          </Button>
          <Button onClick={handleExportToImage} className="px-6 rounded-sm" size="sm">
            <Download className="mr-1 h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      <MetricsPanel metrics={dashboardData.metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <PeriodComparisonPanel
            title={dashboardData.periodTitles.yearToDateTitle}
            metrics={dashboardData.yearToDate}
            className="bg-[#4B0082]/20 border-[#4B0082]"
            headerClassName="bg-[#4B0082]/80 text-white"
          />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <PeriodComparisonPanel
            title={dashboardData.periodTitles.currentMonthTitle}
            metrics={dashboardData.currentMonth}
            className="bg-[#004687]/20 border-[#004687]"
            headerClassName="bg-[#004687]/80 text-white"
          />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <PeriodComparisonPanel
            title={dashboardData.periodTitles.selectedDurationTitle}
            metrics={dashboardData.selectedDuration}
            className="bg-blue-100 border-blue-600"
            headerClassName="bg-blue-600 text-white"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <ChartsAuditsChart data={dashboardData.dailyData} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.45 }}
      >
        <TimeSpentChart data={dashboardData.dailyData} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-1 2xl:grid-cols-3 gap-1">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 items-start lg:grid-cols-2 gap-1">
            <AnalystTable
              title="Charts Reviewed"
              analysts={dashboardData.analysts}
              headerClassName="bg-[#e76e50] text-white"
            />
            <AnalystTable
              title="Charts Audited"
              analysts={dashboardData.auditors}
              headerClassName="bg-[#2a9d90] text-white"
            />

          </div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <QualityMetricsTable analysts={dashboardData.analysts} headerClassName="bg-indigo-600 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
}
