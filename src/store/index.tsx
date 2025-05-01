
import dashboardSlice from "@/store/slices/DashboardSlice";
import chartsFilterReducer from "@/store/slices/charts-filter-slice";
import documentManagementReducer from "@/store/slices/documentManagementSlice";
import pdfFilters from "@/store/slices/pdfFiltersSlice";
import documentTableSlice from "@/store/slices/table-document-slice";
import tableFiltersReducer from "@/store/slices/tableFiltersSlice";
import userForm from "@/store/slices/user-form-slice";
import userSlice from "@/store/slices/user-slice";
import dashboardFilters3Reducer from "./slices/dashboard-filters-3";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

const RESET_STORE = "RESET_STORE";

// Combine all reducers
const appReducer = combineReducers({
    dashboard: dashboardSlice,
    tableFilters: tableFiltersReducer,
    user: userSlice,
    chartsFilter: chartsFilterReducer,
    documentManagement: documentManagementReducer,
    pdfFilters: pdfFilters,
    userForm: userForm,
    documentTable: documentTableSlice,
    dashboardFilters3: dashboardFilters3Reducer,
});


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rootReducer = (state: any, action: any) => {
    if (action.type === RESET_STORE) {
        storage.removeItem("persist:root");
        return appReducer(undefined, action);
    }
    return appReducer(state, action);
};

const persistConfig = {
    key: "root",
    storage,
    whitelist: [
        "dashboard",
        "tableFilters",
        "user",
        "chartsFilter",
        "documentManagement",
        "pdfFilters",
        "userForm",
        "documentTable",
        "dashboardFilters2",
    ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);
export default store;

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Reset action
export const resetStore = () => ({ type: RESET_STORE });

export const resetReduxStore = () => {
    persistor.purge();
    store.dispatch(resetStore());
};
