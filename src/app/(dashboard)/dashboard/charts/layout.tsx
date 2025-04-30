"use client";

import type React from "react";

import TabsComponent from "@/components/common/CommonTab";
import { useRedux } from "@/hooks/use-redux";
import type { Tab } from "@/lib/types/dashboardTypes";
import { updateTab } from "@/store/slices/DashboardSlice";

import { Button } from "@/components/ui/button";
import { ChartTab } from "@/lib/types/chartsTypes";
import { autoAssign } from "@/store/slices/documentManagementSlice";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Clock, FileEdit, LoaderCircle, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const tabVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 0 },
};

export default function ChartLayout({
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
    const chartsCounts = appointmentCounts?.data?.charts;
    const tabCountLoading = appointmentCounts?.status;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { pendingDocuments, assignedDocuments, auditDocuments, completedDocuments } = selector((state) => state.documentTable);

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

    useEffect(() => {
        setCurrentTab(pathname.split("/").pop() || "pending");
    }, [pathname]);

    const handleTabChange = (value: string) => {
        setCurrentTab(value);
        const targetHref = `/dashboard/charts/${value}`;

        const targetTab = (storedTabs as Tab[])?.map((item) => (item?.active ? { ...item, href: targetHref } : item));

        setTimeout(() => {
            // chartsData(value as charts);
        });

        dispatch(updateTab(targetTab));
        router.push(targetHref);
    };

    const handleAutoAssign = async () => {
        setIsSubmitting(true);


        const resultAction = await dispatch(autoAssign());;
        if (autoAssign.fulfilled.match(resultAction)) {
            setIsSubmitting(false);
        }
        /* setTimeout(() => {
            setIsSubmitting(false);
            success({ message: "Chart Assigned Successfully!" });

        }, 2000); */
    };

    return (
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
                        <Button
                            onClick={handleAutoAssign}
                            disabled={isSubmitting}
                            className="flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoaderCircle className="w-4 h-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Auto Assign
                                </>
                            )}
                        </Button>
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
                    className="h-full overflow-hidden flex flex-col pt-2 pb-1"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
