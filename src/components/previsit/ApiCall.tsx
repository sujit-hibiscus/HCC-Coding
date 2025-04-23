"use client";

import useFullPath from "@/hooks/use-fullpath";
import { useRedux } from "@/hooks/use-redux";
import useToast from "@/hooks/use-toast";


import { getAllUsers } from "@/store/slices/user-slice";
import { useRef } from "react";

export function useApiCall() {
    const isProcessingRef = useRef(false);
    const { dispatch } = useRedux();
    const { fullPath = "" } = useFullPath();

    const { showPromiseToast, success } = useToast();

    const sidebarApiCall = async (id: string) => {
        console.info("🚀 ~ sidebarApiCall ~ id:", id);

    };
    const getUserApiCall = async (target: string) => {
        if (fullPath !== target) {
            showPromiseToast({
                promise: dispatch(getAllUsers()).then(result => {
                    if (result.payload) {
                        const message = typeof result.payload === "object" && "message" in result.payload
                            ? result.payload.message
                            : "";
                        success({ message: message as string });
                    }
                }),
                loading: "Fetching users...",
                error: "Failed to fetch users. Please try again.",
                duration: 4000
            });
        }

    };






    const loginApi = async (target: "Login" | "Sidebar", userType: "Analyst" | "Auditor" | "Admin") => {
        /*  if (target === "Login") {
             callBulkApi(userType);
         } else if (target === "Sidebar") {
 
         } */

    };

    const getBasePath = (userType: string) => {
        return userType === "Auditor" ? "/dashboard" :
            userType === "Analyst" ? "/dashboard" :
                userType === "Admin" ? "/dashboard" : "";
        // return userType === "Provider" ? "/dashboard/previsit/provider-review" : userType === "Analyst" ? "/dashboard/previsit/pending" : ""
    };

    const getLoginMasterData = () => {
        // /dispatch(getHccMasterData());
    };

    return {
        sidebarApiCall,
        loginApi,
        getBasePath,
        getUserApiCall,
        isLoading: isProcessingRef.current,
        getLoginMasterData
    };
}

