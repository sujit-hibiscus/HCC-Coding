"use client";

import type React from "react";

import TabsComponent from "@/components/common/CommonTab";
import { useRedux } from "@/hooks/use-redux";
import type { Tab } from "@/lib/types/dashboardTypes";
import { updateTab } from "@/store/slices/DashboardSlice";

import { useApiCall } from "@/components/common/ApiCall";
import ProgressiveLoader from "@/components/common/ProgressiveLoader";
import { ChartTab } from "@/lib/types/chartsTypes";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock, FileEdit } from "lucide-react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const tabVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 0 },
};

export default function ChartsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { selector, dispatch } = useRedux();
    const [currentTab, setCurrentTab] = useState(pathname.split("/").pop() || "pending");
    const { tabs: storedTabs = [] } = selector((state) => state.dashboard);
    const { userType = "", appointmentCounts } = selector((state) => state.user);

    if (!(userType?.toLowerCase()?.includes("admin"))) {
        redirect("/unauthorized");
    }

    const chartsCounts = appointmentCounts?.data?.charts;
    const tabCountLoading = appointmentCounts?.status;
    const { getChartApi } = useApiCall();

    const { pendingDocuments, assignedDocuments, auditDocuments, completedDocuments } = selector((state) => state.documentTable);
    console.log("🚀 ~ pendingDocuments:", pendingDocuments)

    const tabs = [
        {
            value: ChartTab.Pending,
            label: "Pending",
            icon: Clock,
            count: pendingDocuments?.data?.length > 0 ? pendingDocuments?.data?.length : chartsCounts?.Pending,
        },
        {
            value: ChartTab.Assigned,
            label: "Assigned",
            icon: FileEdit,
            count: assignedDocuments?.data?.length > 0 ? assignedDocuments?.data?.length : chartsCounts?.Assigned,
        },
        {
            value: ChartTab.Audit,
            label: "Audit",
            icon: CheckCircle2,
            count: auditDocuments?.data?.length > 0 ? auditDocuments?.data?.length : chartsCounts?.Audit,
        },
        {
            value: ChartTab.Completed,
            label: "Completed",
            icon: CheckCircle2,
            count: completedDocuments?.data?.length > 0 ? completedDocuments?.data?.length : chartsCounts?.Completed,
        },
    ];
    const tabsData = [
        {
            value: ChartTab.Pending,
            label: "Pending",
            icon: Clock,
            count: pendingDocuments?.data?.length > 0 ? pendingDocuments?.data?.length : chartsCounts?.Pending,
        },
        {
            value: ChartTab.Assigned,
            label: "Assigned",
            icon: FileEdit,
            count: assignedDocuments?.data?.length > 0 ? assignedDocuments?.data?.length : chartsCounts?.Assigned,
        },
        {
            value: ChartTab.Audit,
            label: "Audit",
            icon: CheckCircle2,
            count: auditDocuments?.data?.length > 0 ? auditDocuments?.data?.length : chartsCounts?.Audit,
        },
        {
            value: ChartTab.Completed,
            label: "Completed",
            icon: CheckCircle2,
            count: completedDocuments?.data?.length > 0 ? completedDocuments?.data?.length : chartsCounts?.Completed,
        },
    ];

    const [isLoading, setIsLoading] = useState(false);
    const [currentPath, setCurrentPath] = useState(pathname);

    useEffect(() => {
        if (pathname !== currentPath) {
            setIsLoading(true);
            setCurrentPath(pathname);

            // Use requestAnimationFrame for smoother transitions
            requestAnimationFrame(() => {
                // Simulate minimum loading time for better UX
                setTimeout(() => {
                    requestAnimationFrame(() => {
                        setIsLoading(false);
                    });
                }, 300);
            });
        }
    }, [pathname, currentPath]);

    useEffect(() => {
        setCurrentTab(pathname.split("/").pop() || "pending");
    }, [pathname]);

    const handleTabChange = (value: string) => {
        setCurrentTab(value);
        const targetHref = `/dashboard/charts/${value}`;

        const targetTab = (storedTabs as Tab[])?.map((item) => (item?.active ? { ...item, href: targetHref } : item));

        setTimeout(() => {
            const targetTab = tabsData?.find((item) => item.value === value);
            getChartApi(value as "pending" | "assigned" | "audit" | "completed");

        });

        dispatch(updateTab(targetTab));
        router.push(targetHref);
    };

    return (
        <div className="relative h-full ">
            <div className={"opacity-100 h-full transition-opacity duration-300"}>
                <div className="px-2 py-1 h-full flex space-y-1 flex-col bg-background">
                    <div className="h-10 flex items-center justify-between">
                        {userType !== "Provider" && (
                            <div className="flex items-center gap-2">
                                <TabsComponent
                                    countLoading={tabCountLoading === "Loading"}
                                    tabs={tabs}
                                    currentTab={currentTab}
                                    handleTabChange={handleTabChange}
                                />
                            </div>
                        )}
                    </div>


                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentTab}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={tabVariants}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="h-full relative overflow-hidden flex flex-col pt-2 pb-1"
                        >
                            {isLoading && (
                                <div className="absolute h-full w-full opacity-80 inset-0 z-40">
                                    <ProgressiveLoader />
                                </div>
                            )}
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
