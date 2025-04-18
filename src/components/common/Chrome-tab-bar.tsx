import useFullPath from "@/hooks/use-fullpath";
import { useRedux } from "@/hooks/use-redux";
import { useTabs } from "@/hooks/use-tabs";
import { reorderTab } from "@/store/slices/DashboardSlice";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import { useMemo } from "react";


function ChromeTabBar() {
    const { fullPath = "", previsit, target } = useFullPath();
    const { selector, dispatch } = useRedux();
    const tabs = selector((state) => state.dashboard.tabs);
    const { closeTab, changeTab, } = useTabs();
    const finalizeTab = useMemo(() => {
        let hasActiveTab = false;

        const updatedTabs = tabs?.map(item => {
            const isActive = (previsit === "dashboard/previsit/")
                ? (item?.id === "pending" || item.id === "postvisit")
                : (previsit === " dashboard/postvisit/") ? (item?.id === "follow-up" || item.id === "postvisit") : item.href === fullPath;


            if (isActive) hasActiveTab = true;

            return { ...item, active: isActive };
        });

        setTimeout(() => {
            if (!hasActiveTab) {
                updatedTabs.push({
                    id: "new-tab",
                    href: fullPath,
                    title: target,
                    active: true
                });
            }
        },);

        return updatedTabs;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabs, fullPath]);

    const reorder = (tabId: string, fromIndex: number, toIndex: number) => {
        dispatch(reorderTab({ fromIndex, toIndex }));
    };
    return (
        <div className="w-full">
            <Tabs
                darkMode={true}
                className="capitalize bg-white dark:bg-accent animate-smooth"
                onTabClose={closeTab}
                onTabActive={changeTab}
                tabs={finalizeTab}
                onTabReorder={reorder}
            />
        </div>
    );
}

export default ChromeTabBar;
