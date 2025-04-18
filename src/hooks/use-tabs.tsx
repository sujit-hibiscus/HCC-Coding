import { addTab, setActiveTab, updateTab } from "@/store/slices/DashboardSlice";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useRedux } from "./use-redux";

export const useTabs = () => {
    const router = useRouter();
    const { dispatch, selector } = useRedux();
    const tabs = selector((state) => state.dashboard.tabs);
    const activeTab = selector((state) => state.dashboard.activeTab);

    const handleAddTab = useCallback((id: string, title: string, href: string) => {
        dispatch(addTab({ id, title, href, active: true }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, router]);

    const handleCloseTab = useCallback((tabId: string) => {
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
        dispatch(setActiveTab(tabId));
        const tab = tabs.find(t => t.id === tabId);
        if (tab?.href) {
            router.push(tab.href);
        }
    }, [dispatch, router, tabs]);

    const handleAddChartId = useCallback(({ chartId, chartType, link = "/dashboard/details/" }: { chartId: string, chartType: string, link?: string }) => {
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
