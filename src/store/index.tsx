import dashboardSlice from "@/store/slices/DashboardSlice";
import chartsFilterReducer from "@/store/slices/charts-filter-slice";
import tableFiltersReducer from "@/store/slices/tableFiltersSlice";
import userSlice from "@/store/slices/user-slice";

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

const RESET_STORE = "RESET_STORE";

// Combine all reducers
const appReducer = combineReducers({
    dashboard: dashboardSlice,
    tableFilters: tableFiltersReducer,
    // api: apiSlice,
    user: userSlice,
    chartsFilter: chartsFilterReducer,
    // previsit: previsitSlice,
    // provider: providerDetailSlice,
    // userForm: userForm,
    // pdfFilters: pdfFilters,
    // master: masterDataSlice,
    // chat: chatReducer,
});

// Root reducer that listens for the reset action
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
        "api",
        "previsit",
        "provider",
        "user",
        "tableFilters",
        "userForm",
        "pdfFilters",
        "master",
        "chat",
        "chartsFilter"
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
