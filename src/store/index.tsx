import dashboardFilters from "@/store/slices/dashboard-filters";
import dashboardSlice from "@/store/slices/DashboardSlice";
import documentManagementReducer from "@/store/slices/documentManagementSlice";
import pdfFilters from "@/store/slices/pdfFiltersSlice";
import documentTableSlice from "@/store/slices/table-document-slice";
import tableFiltersReducer from "@/store/slices/tableFiltersSlice";
import userForm from "@/store/slices/user-form-slice";
import userSlice from "@/store/slices/user-slice";
import dateRangeReducer from "@/store/slices/dateRangeSlice";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import sessionStorage from "redux-persist/lib/storage/session";

const RESET_STORE = "RESET_STORE";

const appReducer = combineReducers({
    dashboard: dashboardSlice,
    tableFilters: tableFiltersReducer,
    user: userSlice,
    documentManagement: documentManagementReducer,
    pdfFilters: pdfFilters,
    userForm: userForm,
    documentTable: documentTableSlice,
    dashboardFilters3: dashboardFilters,
    dateRange: dateRangeReducer,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rootReducer = (state: any, action: any) => {
    if (action.type === RESET_STORE) {
        storage.removeItem("persist:root");
        sessionStorage.removeItem("persist:root");
        return appReducer(undefined, action);
    }
    return appReducer(state, action);
};

let persistedReducer = rootReducer; // Default to non-persisted reducer

if (typeof window !== "undefined") {
    // Use sessionStorage instead of localStorage to isolate state per tab
    const persistConfig = {
        key: "root",
        storage: storage, // Changed from storage to sessionStorage
        whitelist: [
            "dashboard",
            "tableFilters",
            "user",
            "documentManagement",
            "pdfFilters",
            "userForm",
            "documentTable",
            "dashboardFilters2",
        ],
    };
    persistedReducer = persistReducer(persistConfig, rootReducer);
}

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
    devTools: process.env.NEXT_PUBLIC_LOCAL === "true",
});

// Export persistor only if window is defined
export const persistor = typeof window !== "undefined" ? persistStore(store) : ({} as ReturnType<typeof persistStore>);
export default store;

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Reset action
export const resetStore = () => ({ type: RESET_STORE });

export const resetReduxStore = () => {
    if (typeof window !== "undefined") {
        persistor.purge();
        store.dispatch(resetStore());
    }
};