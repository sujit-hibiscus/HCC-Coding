"use client";

import type React from "react";

import TabsComponent from "@/components/common/CommonTab";
import { useRedux } from "@/hooks/use-redux";
import type { Tab } from "@/lib/types/dashboardTypes";
import { updateTab } from "@/store/slices/DashboardSlice";

import { useApiCall } from "@/components/common/ApiCall";
import ProgressiveLoader from "@/components/common/ProgressiveLoader";
import { useChartTabs } from "@/hooks/use-tabs";
import { AnimatePresence, motion } from "framer-motion";
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
    const { userType = "" } = selector((state) => state.user);

    if (!(userType?.toLowerCase()?.includes("admin"))) {
        redirect("/unauthorized");
    }

    // Use the new custom hook for chart tabs
    const { tabs, tabCountLoading } = useChartTabs();

    const { getChartApi } = useApiCall();
    const [isLoading, setIsLoading] = useState(false);
    const [currentPath, setCurrentPath] = useState(pathname);

    useEffect(() => {
        if (pathname !== currentPath) {
            setIsLoading(true);
            setCurrentPath(pathname);
            requestAnimationFrame(() => {
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

    const storedLoader = selector(state => state.dashboard.isPageLoading);

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
