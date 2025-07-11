import { filterData } from "@/lib/utils";
import { addTab, setActiveTab, setPageLoading, updateTab } from "@/store/slices/DashboardSlice";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useRedux } from "./use-redux";

export const useTabs = () => {
    const router = useRouter();
    const { dispatch, selector } = useRedux();
    const tabs = selector((state) => state.dashboard.tabs);
    const activeTab = selector((state) => state.dashboard.activeTab);

    const handleAddTab = useCallback((id: string, title: string, href: string) => {
        dispatch(setPageLoading(id !== activeTab));
        dispatch(addTab({ id, title, href, active: true }));
    }, [activeTab, dispatch]);

    const handleCloseTab = useCallback((tabId: string) => {
        dispatch(setPageLoading(activeTab === tabId));
        if (tabs.length > 1) {
            const closedTabIndex = tabs.findIndex(tab => tab.id === tabId);
            const updatedTabs = tabs.filter(tab => tab.id !== tabId);
            let newActiveTab = activeTab;

            if (activeTab === tabId) {
                if (updatedTabs.length > 0) {
                    const newActiveIndex = closedTabIndex > 0 ? closedTabIndex - 1 : 0;
                    newActiveTab = updatedTabs[newActiveIndex]?.id ?? "";
                } else {
                    newActiveTab = "";
                }
            }

            const finalTabs = updatedTabs.map(tab => ({
                ...tab,
                active: tab.id === newActiveTab
            }));

            dispatch(updateTab(finalTabs));
            dispatch(setActiveTab(newActiveTab));

            if (newActiveTab) {
                const targetTab = finalTabs.find(item => item.active);
                if (targetTab?.href) {
                    router.push(targetTab.href);
                }
            }
        }
    }, [dispatch, tabs, activeTab, router]);



    const handleTabChange = useCallback((tabId: string) => {
        dispatch(setPageLoading(activeTab !== tabId));
        dispatch(setActiveTab(tabId));
        const tab = tabs.find(t => t.id === tabId);
        if (tab?.href) {
            router.push(tab.href);
        }
    }, [activeTab, dispatch, router, tabs]);

    const handleAddChartId = useCallback(({ chartId, chartType, link = "/dashboard/details/" }: { chartId: string, chartType: string, link?: string }) => {
        dispatch(setPageLoading(true));
        const reviewType = chartType
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join("-");
        const href = `${link}${chartType}?chartId=${chartId}`;
        const tabTitle = `${reviewType}: ${chartId}`;

        const tabData = {
            id: chartId,
            title: tabTitle,
            href,
            active: true,
            search: {
                sugg: "",
                carry: "",
                rejected: ""
            }
        };
        setTimeout(() => {
            dispatch(addTab(tabData));
        });
        setTimeout(() => {
            router.push(href);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleAddTab]);

    const handleOpenProfile = useCallback(({ provider, tabType, id = "", link = "/dashboard/" }: { provider: string, id: string, tabType: string, link?: string }) => {
        dispatch(setPageLoading(true));
        const providerName = provider?.replace(/ /g, "-");
        const href = `${link}${tabType}?provider=${id}`;
        const tabTitle = `${tabType}: ${provider}`;

        const tabData = {
            id: providerName,
            title: tabTitle,
            href,
            active: true,
            tab: "charts"
        };
        setTimeout(() => {
            dispatch(addTab(tabData));
        });
        setTimeout(() => {
            router.push(href);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleAddTab]);

    return {
        tabs,
        activeTab,
        addTab: handleAddTab,
        closeTab: handleCloseTab,
        changeTab: handleTabChange,
        addChartId: handleAddChartId,
        addProfile: handleOpenProfile,
    };
};

// Custom hook for chart tabs (modeled after usePrevisitTabs)
import { ChartTab } from "@/lib/types/chartsTypes";
import { isWithinInterval, startOfDay } from "date-fns";
import { CheckCircle2, Clock, FileEdit } from "lucide-react";

export function useChartTabs() {
    const { selector } = useRedux();
    const { appointmentCounts } = selector((state) => state.user);
    const chartsCounts = appointmentCounts?.data?.charts;
    const tabCountLoading = appointmentCounts?.status;
    const { pendingDocuments, assignedDocuments, auditDocuments, completedDocuments } = selector((state) => state.documentTable);
    const storedData = selector((state) => state.tableFilters);
    const globalSearch = selector((state) => state.dashboard.search);

    // Helper: apply all filters (global search, column, date)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function applyAllFilters(data: any[], tabKey: string) {
        if (!data) return [];
        let filtered = [...data];
        // 1. Global search
        if (globalSearch) {
            filtered = filterData(filtered, globalSearch.trim());
        }
        // 2. Column filters
        const filters = storedData[tabKey]?.columnFilters || [];
        for (const filter of filters) {
            const { id, value } = filter;
            if (!value) continue;
            filtered = filtered.filter(row => {
                const cell = row[id];
                if (cell == null) return false;
                // Array filter (e.g., status multi-select)
                if (Array.isArray(value)) {
                    return value.map(v => (typeof v === "string" ? v.trim() : v)).includes(typeof cell === "string" ? cell.trim() : cell);
                }
                // String filter
                if (typeof cell === "string" && typeof value === "string") {
                    return cell.trim().toLowerCase().includes(value.trim().toLowerCase());
                }
                // Number filter
                if (typeof cell === "number" && typeof value === "number") {
                    return cell === value;
                }
                // fallback
                return String(cell).trim().toLowerCase().includes(String(value).trim().toLowerCase());
            });
        }
        // 3. Date range filter (on received)
        const dateRange = storedData[tabKey]?.dateRange || [];
        if (dateRange.filter(Boolean).length > 0) {
            const [start, end] = dateRange;
            filtered = filtered.filter(row => {
                const received = row.received;
                if (!received) return false;
                const [month, day, year] = received.split("-").map(Number);
                if (!month || !day || !year) return false;
                const rowDate = startOfDay(new Date(year, month - 1, day));
                const startDate = start ? startOfDay(new Date(start)) : null;
                const endDate = end ? startOfDay(new Date(end)) : null;
                if (startDate && endDate) {
                    return isWithinInterval(rowDate, { start: startDate, end: endDate });
                } else if (startDate) {
                    return rowDate >= startDate;
                } else if (endDate) {
                    return rowDate <= endDate;
                }
                return true;
            });
        }
        return filtered;
    }

    const filteredPending = applyAllFilters(pendingDocuments?.data, "dashboard/charts/pending");
    const filteredAssigned = applyAllFilters(assignedDocuments?.data, "dashboard/charts/assigned");
    const filteredAudit = applyAllFilters(auditDocuments?.data, "dashboard/charts/audit");
    const filteredCompleted = applyAllFilters(completedDocuments?.data, "dashboard/charts/completed");

    const tabs = [
        {
            value: ChartTab.Pending,
            label: "Pending",
            icon: Clock,
            count: pendingDocuments?.data?.length > 0 ? filteredPending?.length : chartsCounts?.Pending,
        },
        {
            value: ChartTab.Assigned,
            label: "Assigned",
            icon: FileEdit,
            count: assignedDocuments?.data?.length > 0 ? filteredAssigned?.length : chartsCounts?.Assigned,
        },
        {
            value: ChartTab.Audit,
            label: "Audit",
            icon: CheckCircle2,
            count: auditDocuments?.data?.length > 0 ? filteredAudit?.length : chartsCounts?.Audit,
        },
        {
            value: ChartTab.Completed,
            label: "Completed",
            icon: CheckCircle2,
            count: completedDocuments?.data?.length > 0 ? filteredCompleted?.length : chartsCounts?.Completed,
        },
    ];
    return { tabs, tabCountLoading };
}
