"use client";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import { Download, Maximize2, Minimize2, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { generateChartData } from "@/components/charts/data-generator";
import { CalendarDateRangePicker } from "@/components/common/data-table/CalendarDateRangePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRedux } from "@/hooks/use-redux";
import { resetDashboard, setChartData, setDateRange, toggleExpandChart } from "@/store/slices/charts-filter-slice";
import { ChartsVolume } from "./charts-volume";
import DashboardSkeleton from "./Dashboard-loading";
import { HccVersionComparison } from "./hcc-version-comparison";
import { TopPatientHccData } from "./hcc-version-comparison copy";
import { TopHccCodes2 } from "./top-hcc-codes-2";

export default function DashboardPage() {
    const { selector, dispatch } = useRedux();
    const { dateRange, chartData, isLoading, expandedChart, animationComplete, isDirty } = selector(
        (state) => state.chartsFilter,
    );

    const dashboardRef = useRef<HTMLDivElement>(null);

    const chartsVolumeRef = useRef<HTMLDivElement>(null);
    const hccVersionsRef = useRef<HTMLDivElement>(null);
    const topProvidersRef = useRef<HTMLDivElement>(null);
    const topHccCodesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (dateRange[0] && dateRange[1]) {
            const newChartData = generateChartData(dateRange[0]!, dateRange[1]!);
            dispatch(setChartData(newChartData));
        }
    }, [dateRange, dispatch]);

    const getChartRef = (chartId: string) => {
        switch (chartId) {
            case "chartsVolume":
                return chartsVolumeRef;
            case "hccVersions":
                return hccVersionsRef;
            case "topProviders":
                return topProvidersRef;
            case "topHccCodes":
                return topHccCodesRef;
            default:
                return null;
        }
    };

    const handleDateRangeChange = (range: [Date | null, Date | null]) => {
        dispatch(setDateRange(range));
    };

    const handleReset = () => {
        dispatch(resetDashboard());
    };

    const handleExportToImage = async () => {
        if (!dashboardRef.current) return;

        try {
            const dashboardElement = dashboardRef.current;
            const { height, width } = dashboardElement.getBoundingClientRect();

            const dataUrl = await toPng(dashboardElement, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: "#ffffff",
                width: width,
                height: height,
                style: {
                    margin: "0",
                    padding: "0",
                },
            });

            const link = document.createElement("a");
            link.download = `dashboard-${new Date().toISOString().split("T")[0]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Error exporting dashboard:", error);
        }
    };

    const handleToggleExpandChart = (chartId: string, isIncluded = false) => {
        dispatch(toggleExpandChart({ data: chartId, isIncluded }));

        if (!isIncluded) {
            setTimeout(() => {
                const chartRef = getChartRef(chartId);
                const chartElement = chartRef?.current;
                if (chartElement) {
                    const rect = chartElement.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const targetY = scrollTop + rect.top - window.innerHeight / 2 + rect.height / 2;
                    window.scrollTo({
                        top: targetY,
                        behavior: "smooth",
                    });
                } else {
                    console.error("Chart element not found for ID:", chartId);
                }
            }, 300);
        }
    };

    useEffect(() => {
        if (expandedChart && expandedChart.length > 0) {
            expandedChart.forEach((chartId) => {
                getChartRef(chartId);
            });
        }
    }, [expandedChart]);

    if (!chartData) {
        return <DashboardSkeleton />;
    }

    const charts = [
        {
            id: "chartsVolume",
            title: "Charts Volume",
            component: ChartsVolume,
            data: chartData.chartsVolume,
            ref: chartsVolumeRef,
        },
        {
            id: "topProviders",
            title: "Top 10 Providers (HCC Volume)",
            component: TopPatientHccData,
            data: chartData.topProviders,
            type: "HCC",
            ref: topProvidersRef,
        },
        {
            id: "hccVersions",
            title: "HCC Identified",
            component: HccVersionComparison,
            data: chartData.hccVersions,
            type: "version",
            ref: hccVersionsRef,
        },
        {
            id: "topHccCodes",
            title: "Top 10 HCC Codes",
            component: "combined",
            data: {
                v24: chartData.topCodesV24,
                // v28: chartData.topCodesV28,
            },
            ref: topHccCodesRef,
        },
    ];

    // Determine layout based on expanded charts
    const isChartsVolumeExpanded = expandedChart?.includes("chartsVolume");
    const isHccVersionsExpanded = expandedChart?.includes("hccVersions");

    return (
        <div className="w-full p-1 pb-2 space-y-1" ref={dashboardRef}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="flex pr-2 flex-row items-end sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                        {isDirty && (
                            <Button size="sm" onClick={handleReset} className="h-8">
                                <span className="hidden md:inline-block">Reset</span>
                                <X className="md:ml-2 h-4 w-4" />
                            </Button>
                        )}

                        <CalendarDateRangePicker dateRange={dateRange} setDateRange={handleDateRangeChange} />
                    </div>
                    <Button onClick={handleExportToImage} className="">
                        <Download className="mr-1.5 h-4 w-4" />
                        Export as Image
                    </Button>
                </div>
            </div>

            {/* First row: Charts Volume (70%) and Top Providers (30%) */}
            <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                    <AnimatePresence>
                        {/* Charts Volume - 70% width or 100% if expanded */}
                        <motion.div
                            key="chartsVolume"
                            ref={chartsVolumeRef}
                            className={isChartsVolumeExpanded ? "lg:col-span-10" : "lg:col-span-7"}
                            layout
                            layoutId="chartsVolume"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: animationComplete ? 1 : 0,
                                y: animationComplete ? 0 : 20,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                delay: animationComplete ? 0.1 : 0,
                                layout: { type: "spring", stiffness: 200, damping: 25 },
                            }}
                        >
                            <Card className="overflow-hidden h-full shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-300 rounded-sm">
                                <CardHeader className="flex flex-row items-center justify-center py-1.5 px-2.5 border-b border-gray-100 dark:border-gray-800 relative">
                                    <CardTitle className="text-lg bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text font-semibold text-transparent">
                                        {charts[0].title}
                                    </CardTitle>
                                    <div className="absolute top-1 right-2">
                                        {charts[0].data.length > 10 && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleToggleExpandChart(charts[0].id, isChartsVolumeExpanded)}
                                                className="gap-1 h-7 px-1.5"
                                            >
                                                {isChartsVolumeExpanded ? (
                                                    <>
                                                        <Minimize2 className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:inline text-xs">Collapse</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Maximize2 className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:inline text-xs">Expand</span>
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ChartsVolume
                                        data={charts[0].data}
                                        isLoading={isLoading}
                                        isExpanded={isChartsVolumeExpanded}
                                        onExpand={() => handleToggleExpandChart(charts[0].id)}
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Top Providers - 30% width or below if Charts Volume is expanded */}
                        <motion.div
                            key="topProviders"
                            ref={topProvidersRef}
                            className={isChartsVolumeExpanded ? "lg:col-span-10" : "lg:col-span-3"}
                            layout
                            layoutId="topProviders"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: animationComplete ? 1 : 0,
                                y: animationComplete ? 0 : 20,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                delay: animationComplete ? 0.2 : 0,
                                layout: { type: "spring", stiffness: 200, damping: 25 },
                            }}
                        >
                            <Card className="overflow-hidden h-full shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-300 rounded-sm">
                                <CardHeader className="flex flex-row items-center justify-center py-1.5 px-2.5 border-b border-gray-100 dark:border-gray-800 relative">
                                    <CardTitle className="text-lg bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text font-semibold text-transparent">
                                        {charts[1].title}
                                    </CardTitle>
                                    <div className="absolute top-1 right-2">
                                        {charts[1].data.length > 10 && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleToggleExpandChart(charts[1].id, expandedChart?.includes(charts[1].id))}
                                                className="gap-1 h-7 px-1.5"
                                            >
                                                {expandedChart?.includes(charts[1].id) ? (
                                                    <>
                                                        <Minimize2 className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:inline text-xs">Collapse</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Maximize2 className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:inline text-xs">Expand</span>
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <TopPatientHccData />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Second row: HCC Identified (70%) and Top HCC Codes (30%) */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                    <AnimatePresence>
                        {/* HCC Identified - 70% width or 100% if expanded */}
                        <motion.div
                            key="hccVersions"
                            ref={hccVersionsRef}
                            className={isHccVersionsExpanded ? "lg:col-span-10" : "lg:col-span-7"}
                            layout
                            layoutId="hccVersions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: animationComplete ? 1 : 0,
                                y: animationComplete ? 0 : 20,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                delay: animationComplete ? 0.3 : 0,
                                layout: { type: "spring", stiffness: 200, damping: 25 },
                            }}
                        >
                            <Card className="overflow-hidden h-full shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-300 rounded-sm">
                                <CardHeader className="flex flex-row items-center justify-center py-1.5 px-2.5 border-b border-gray-100 dark:border-gray-800 relative">
                                    <CardTitle className="text-lg bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text font-semibold text-transparent">
                                        {charts[2].title}
                                    </CardTitle>
                                    <div className="absolute top-1 right-2">
                                        {charts[2].data.length > 10 && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleToggleExpandChart(charts[2].id, isHccVersionsExpanded)}
                                                className="gap-1 h-7 px-1.5"
                                            >
                                                {isHccVersionsExpanded ? (
                                                    <>
                                                        <Minimize2 className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:inline text-xs">Collapse</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Maximize2 className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:inline text-xs">Expand</span>
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <HccVersionComparison
                                        data={charts[2].data}
                                        isLoading={isLoading}
                                        isExpanded={isHccVersionsExpanded}
                                        type="version"
                                        onExpand={() => handleToggleExpandChart(charts[2].id)}
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Top HCC Codes - 30% width or below if HCC Identified is expanded */}
                        <motion.div
                            key="topHccCodes"
                            ref={topHccCodesRef}
                            className={
                                isHccVersionsExpanded ? (isChartsVolumeExpanded ? "lg:col-span-10" : "lg:col-span-5") : "lg:col-span-3"
                            }
                            layout
                            layoutId="topHccCodes"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: animationComplete ? 1 : 0,
                                y: animationComplete ? 0 : 20,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                delay: animationComplete ? 0.4 : 0,
                                layout: { type: "spring", stiffness: 200, damping: 25 },
                            }}
                        >
                            <Card className="overflow-hidden h-full shadow-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-300 rounded-sm">
                                <CardHeader className="flex flex-row items-center justify-center py-1.5 px-2.5 border-b border-gray-100 dark:border-gray-800">
                                    <CardTitle className="text-lg bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text font-semibold text-transparent">
                                        {charts[3].title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 pr-2">
                                    <div className={`flex ${isHccVersionsExpanded ? "flex-col lg:flex-row" : "flex-col"} pb-1`}>
                                        <div className="flex-1 px-1">
                                            {/* <div className="font-semibold text-gray-700 text-center">V24</div> */}
                                            <TopHccCodes2 data={charts[3].data.v24} version="V28" />
                                        </div>
                                        {/* <Separator
                                            className="bg-gray-300 dark:bg-gray-700"
                                            orientation={isHccVersionsExpanded && window.innerWidth >= 1024 ? "vertical" : "horizontal"}
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-700 text-center">V28</div>
                                            <TopHccCodes2 data={charts[3].data.v28} version="V28" />
                                        </div> */}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* If HCC Versions is expanded, show Top Providers at 50% width */}
                {isHccVersionsExpanded && !isChartsVolumeExpanded && (
                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
                        <AnimatePresence>
                            <motion.div
                                key="topProviders-moved"
                                className="lg:col-span-5"
                                layout
                                layoutId="topProviders-moved"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: animationComplete ? 1 : 0,
                                    y: animationComplete ? 0 : 20,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                    delay: animationComplete ? 0.5 : 0,
                                    layout: { type: "spring", stiffness: 200, damping: 25 },
                                }}
                            >
                                {/* This is a placeholder that will only be visible when HCC Versions is expanded */}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
