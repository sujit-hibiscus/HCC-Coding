import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Tab } from "@/lib/types/dashboardTypes";
import { fetchData } from "@/lib/api/api-client";
import toast from "react-hot-toast";

interface DashboardState {
    token: string;
    isPageLoading: Boolean
    tabs: Tab[]
    activeTab: string;
    search: string;
    analystUsers: { id: string | number; name: string }[];
    auditorUsers: { id: string | number; name: string }[];
    columnOrders: Record<string, string[]>;
}

const initialState: DashboardState = {
    token: "",
    isPageLoading: false,
    tabs: [],
    // tabs: [{ id: "dashboard", title: "Dashboard", href: "/dashboard", active: true }],
    activeTab: "",
    analystUsers: [],
    auditorUsers: [],
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
    },
};

interface ApiResponse {
    status: string
    message: string
    data: {
        "id": number,
        "first_name": string,
        "last_name": string,
        "role_id": number
    }[]
}

export const fetchAnalystUsers = createAsyncThunk("dashboard/fetchAnalystUsers", async (_, { rejectWithValue }) => {
    try {
        const response = await fetchData("get/analyst_users/");
        const data = response.data as ApiResponse;
        if (data.status === "Success") {
            return data.data.map(user => ({
                id: `${user.id}`,
                name: `${user.first_name} ${user.last_name}`
            }));
        } else {
            toast.error(`${data.message}`);
            return [] as { id: number; name: string }[];
        }
    } catch (error) {
        return rejectWithValue((error as Error).message || "Failed to fetch analyst users");
    }
});

export const fetchAuditorUsers = createAsyncThunk("dashboard/fetchAuditorUsers", async (_, { rejectWithValue }) => {
    try {
        const response = await fetchData("get/auditor_users/");
        const data = response.data as ApiResponse;
        if (data.status === "Success") {
            // Transform the data to match the expected structure
            return data.data.map(user => ({
                id: `${user.id}`,
                name: `${user.first_name} ${user.last_name}`
            }));
        } else {
            toast.error(`${data.message}`);
            return [] as { id: number; name: string }[];
        }
    } catch (error) {
        return rejectWithValue((error as Error).message || "Failed to fetch auditor users");
    }
});

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },
        setPageLoading: (state, action: PayloadAction<Boolean>) => {
            state.isPageLoading = action.payload;
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
        resetTab: (state) => {
            state.tabs = [
                {
                    id: "dashboard",
                    title: "Dashboard",
                    href: "/dashboard",
                    active: true,
                },
            ];
        },
        addTab: (state, action: PayloadAction<Tab>) => {
            state.tabs.forEach((tab) => (tab.active = false));
            const existingTab = state.tabs.find((tab) => tab.id === action.payload.id);

            if (!existingTab) {
                if (action?.payload?.href?.includes("/review?chartId")) {

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
    extraReducers: (builder) => {
        builder
            .addCase(fetchAuditorUsers.fulfilled, (state, action) => {
                state.auditorUsers = action.payload;
            });

        builder
            .addCase(fetchAnalystUsers.fulfilled, (state, action) => {
                state.analystUsers = action.payload; // Fix: use analystUsers instead of analystsData
            });
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
    resetTab,
    setPageLoading,
    setStoreColumnOrder
} = dashboardSlice.actions;
export default dashboardSlice.reducer;
