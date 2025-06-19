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
import { isWithinInterval, parse } from "date-fns";
import { EndDateFilter, StartDateFilter } from "@/lib/utils";

const tabVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 0 },
};

const filterDocumentsByDateRange = (docs: any[], range: [string, string]) => {
    return docs.filter(d => {
        if (d.received) {
            const parsedDate = parse(d.received, 'MM-dd-yyyy', new Date());
            return isWithinInterval(parsedDate, {
                start: new Date(range[0]),
                end: new Date(range[1]),
            });
        }
        return false;
    });
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
    const storedData = selector((state) => state.tableFilters);
    console.log("🚀 ~ storedData:", storedData)

    const filteredPendinCount = filterDocumentsByDateRange(
        pendingDocuments?.data,
        (storedData["dashboard/charts/pending"]?.dateRange ?? []).map(date =>
            date instanceof Date ? date.toISOString().slice(0, 10) : ""
        ) as [string, string]
    )
    const filteredAssignedCount = filterDocumentsByDateRange(
        assignedDocuments?.data,
        (storedData["dashboard/charts/assigned"]?.dateRange ?? []).map(date =>
            date instanceof Date ? date.toISOString().slice(0, 10) : ""
        ) as [string, string]
    )
    const filteredAuditCount = filterDocumentsByDateRange(
        auditDocuments?.data,
        (storedData["dashboard/charts/audit"]?.dateRange ?? []).map(date =>
            date instanceof Date ? date.toISOString().slice(0, 10) : ""
        ) as [string, string]
    )
    const filteredCompletedCount = filterDocumentsByDateRange(
        completedDocuments?.data,
        (storedData["dashboard/charts/completed"]?.dateRange ?? []).map(date =>
            date instanceof Date ? date.toISOString().slice(0, 10) : ""
        ) as [string, string]
    )



    const bodyData = [EndDateFilter, StartDateFilter]
    console.log("🚀 ~ bodyData:", bodyData)


    const tabs = [
        {
            value: ChartTab.Pending,
            label: "Pending",
            icon: Clock,
            count: pendingDocuments?.data?.length > 0 ? filteredPendinCount?.length : chartsCounts?.Pending,
        },
        {
            value: ChartTab.Assigned,
            label: "Assigned",
            icon: FileEdit,
            count: assignedDocuments?.data?.length > 0 ? filteredAssignedCount?.length : chartsCounts?.Assigned,
        },
        {
            value: ChartTab.Audit,
            label: "Audit",
            icon: CheckCircle2,
            count: auditDocuments?.data?.length > 0 ? filteredAuditCount?.length : chartsCounts?.Audit,
        },
        {
            value: ChartTab.Completed,
            label: "Completed",
            icon: CheckCircle2,
            count: completedDocuments?.data?.length > 0 ? filteredCompletedCount?.length : chartsCounts?.Completed,
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
            getChartApi(value as "pending" | "assigned" | "audit" | "completed");

        });

        dispatch(updateTab(targetTab));
        router.push(targetHref);
    };

    const storedLoader = selector(state => state.dashboard.isPageLoading)


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
                            {(isLoading || storedLoader) && (
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
