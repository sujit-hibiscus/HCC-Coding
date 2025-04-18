import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Tab } from "@/lib/types/dashboardTypes";
import { mockHccEntries } from "@/lib/data";

interface DashboardState {
    token: string;
    tabs: Tab[]
    activeTab: string;
    search: string;
    columnOrders: Record<string, string[]>; // Add this to store column orders by URL key
}

const initialState: DashboardState = {
    token: "",
    tabs: [{
        "id": "dashboard",
        "title": "Dashboard",
        "href": "/dashboard",
        "active": true
    }],
    // tabs: [{ id: "dashboard", title: "Dashboard", href: "/dashboard", active: true }],
    activeTab: "dashboard",
    search: "",
    columnOrders: {
        "default": [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ]
    }, // Initialize empty object for column orders
};

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        setGlobalSearch: (state, action: PayloadAction<string>) => {
            state.search = action.payload;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateTabSearch: (state, action: PayloadAction<any>) => {
            const activeTab = state.tabs?.find((tab) => tab.active);
            if (activeTab) {
                if ("search" in activeTab) {
                    activeTab.search = action.payload;
                }
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateMemberTab: (state, action: PayloadAction<any>) => {
            const activeTab = state.tabs?.find((tab) => tab.active);
            if (activeTab) {
                if ("tab" in activeTab) {
                    activeTab.tab = action.payload;
                }
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateMemberSubTab: (state, action: PayloadAction<any>) => {
            const activeTab = state.tabs?.find((tab) => tab.active);
            if (activeTab) {
                activeTab.subTab = action.payload;
            }
        },
        addTab: (state, action: PayloadAction<Tab>) => {
            state.tabs.forEach((tab) => (tab.active = false));
            const existingTab = state.tabs.find((tab) => tab.id === action.payload.id);

            if (!existingTab) {
                if (action?.payload?.href?.includes("/review?chartId")) {
                    state.tabs.push({
                        ...action.payload, active: true, stateData: {
                            newData: mockHccEntries
                        }
                    });
                } else {
                    state.tabs.push({ ...action.payload, active: true });
                }
            } else {
                existingTab.active = true;
            }
            state.activeTab = action.payload.id;
        },
        updateTab: (state, action: PayloadAction<Tab[]>) => {
            state.tabs = action.payload;
        },
        setActiveTab: (state, action: PayloadAction<string>) => {
            const allData = state.tabs;
            allData.forEach((tab) => (tab.active = tab.id === action.payload));
            state.activeTab = action.payload;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setActiveTabConditions: (state, action: PayloadAction<any[]>) => {
            const activeTab = state.tabs?.find((tab) => tab.active);
            if (activeTab) {
                // Ensure stateData exists
                if (!activeTab.stateData) {
                    activeTab.stateData = {}; // Initialize stateData if it's undefined
                }
                activeTab.stateData.newData = action.payload;
            }
        },
        reorderTab: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
            const { fromIndex, toIndex } = action.payload;
            const updatedTabs = state.tabs.slice();
            const [movedTab] = updatedTabs.splice(fromIndex, 1);
            updatedTabs.splice(toIndex, 0, movedTab);
            state.tabs = updatedTabs;
        },
        // Add new reducer for column orders
        setStoreColumnOrder: (state, action: PayloadAction<{ key: string; order: string[] }>) => {
            const { key, order } = action.payload;
            state.columnOrders[key] = order;
        },
    },
});

export const {
    setToken,
    setActiveTabConditions,
    setGlobalSearch,
    addTab,
    updateTab,
    updateMemberTab,
    updateMemberSubTab,
    updateTabSearch,
    setActiveTab,
    reorderTab,
    setStoreColumnOrder // Export the new action
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
