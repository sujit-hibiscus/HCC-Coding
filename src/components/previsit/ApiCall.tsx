"use client";

import useFullPath from "@/hooks/use-fullpath";
import { useRedux } from "@/hooks/use-redux";
import useToast from "@/hooks/use-toast";
import { getAllPendingData } from "@/store/slices/previsit-slice";
import { getLabDocs, getMemberProgressNotes, getOtherDocs } from "@/store/slices/provider-details-slice";
import { getAllUsers } from "@/store/slices/user-slice";
import { useRef } from "react";

export function useApiCall() {
    const isProcessingRef = useRef(false);
    const { dispatch } = useRedux();
    const { fullPath = "" } = useFullPath();

    const { showPromiseToast, success } = useToast();

    const sidebarApiCall = async (id: string) => {
        console.log("🚀 ~ sidebarApiCall ~ id:", id);

    };
    const getUserApiCall = async (target: string) => {
        if (fullPath !== target) {
            showPromiseToast({
                promise: dispatch(getAllUsers()).then(result => {
                    if (result.payload) {
                        const message = typeof result.payload === "object" && "message" in result.payload
                            ? result.payload.message
                            : "";
                        success({ message });
                    }
                }),
                loading: "Fetching users...",
                error: "Failed to fetch users. Please try again.",
                duration: 4000
            });
        }

    };




    const memberTabApiCall = async (id: string, chartID: string) => {
        if (id === "progressNotes") {
            dispatch(getMemberProgressNotes({ chartId: chartID, memberId: chartID }));
            /* showPromiseToast({
                promise: dispatch(getMemberProgressNotes({ chartId: chartID, memberId: chartID })),
                loading: "Loading progress notes docs...",
                error: "Failed to load provider details",
                duration: 4000
            }); */
        } else if (id === "other-document") {
            dispatch(getOtherDocs({ chartId: chartID, memberId: chartID }));
            /* showPromiseToast({
                promise: dispatch(getOtherDocs({ chartId: chartID, memberId: chartID })),
                loading: "Loading other docs...",
                error: "Failed to load provider details",
                duration: 4000
            }); */
        } else if (id === "labResults") {
            dispatch(getLabDocs({ chartId: chartID, memberId: chartID }));
            /* showPromiseToast({
                promise: dispatch(getLabDocs({ chartId: chartID, memberId: chartID })),
                loading: "Loading lab result docs...",
                error: "Failed to load provider details",
                duration: 4000
            }); */
        }
    };

    const callBulkApi = async (userType: "Analyst" | "Provider") => {
        console.log("🚀 ~ callBulkApi ~ userType:", userType);


    };
    const loginApi = async (target: "Login" | "Sidebar", userType: "Analyst" | "Provider") => {
        if (target === "Login") {
            callBulkApi(userType);
        } else if (target === "Sidebar") {
            await dispatch(getAllPendingData());
        }

    };

    const getBasePath = (userType: string) => {
        return userType === "Provider" ? "/dashboard" : userType === "Analyst" ? "/dashboard" : "";
        // return userType === "Provider" ? "/dashboard/previsit/provider-review" : userType === "Analyst" ? "/dashboard/previsit/pending" : ""
    };

    const getLoginMasterData = () => {
        // /dispatch(getHccMasterData());
    };

    return {
        sidebarApiCall,
        memberTabApiCall,
        loginApi,
        getBasePath,
        getUserApiCall,
        isLoading: isProcessingRef.current,
        getLoginMasterData
    };
}

