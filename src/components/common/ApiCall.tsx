"use client";

import useFullPath from "@/hooks/use-fullpath";
import { useRedux } from "@/hooks/use-redux";
import useToast from "@/hooks/use-toast";
import { fetchDocuments } from "@/store/slices/documentManagementSlice";
import { fetchAssignedDocuments, fetchAuditDocuments, fetchCompletedDocuments, fetchPendingDocuments } from "@/store/slices/table-document-slice";


import { getAllUsers } from "@/store/slices/user-slice";
import { useRef } from "react";

export function useApiCall() {
    const isProcessingRef = useRef(false);
    const { dispatch, selector } = useRedux();
    const { fullPath = "" } = useFullPath();
    const { pendingDocuments, assignedDocuments, completedDocuments, auditDocuments } = selector((state) => state.documentTable);
    const { documents } = selector((state) => state.documentManagement);

    const { success } = useToast();

    const getUserApiCall = async (target: string) => {
        if (fullPath !== target) {
            /*  showPromiseToast({
                 promise: ,
                 loading: "Fetching users...",
                 error: "Failed to fetch users. Please try again.",
                 duration: 4000
             }); */
            dispatch(getAllUsers()).then(result => {
                if (result.payload) {
                    const message = typeof result.payload === "object" && "message" in result.payload
                        ? result.payload.message
                        : "";
                    success({ message: message as string });
                }
            });
        }


    };

    const getChartApi = (target: "pending" | "assigned" | "audit" | "completed" | "document") => {
        if (target === "pending") {
            if (pendingDocuments?.data?.length === 0) {
                dispatch(fetchPendingDocuments());
            }
        } else if (target === "assigned") {
            if (assignedDocuments?.data?.length === 0) {
                dispatch(fetchAssignedDocuments());
            }
        } else if (target === "audit") {
            if (auditDocuments?.data?.length === 0) {
                dispatch(fetchAuditDocuments());
            }
        } else if (target === "completed") {
            if (completedDocuments?.data?.length === 0) {
                dispatch(fetchCompletedDocuments());
            }
        } else if (target === "document") {
            if (documents?.length === 0) {
                dispatch(fetchDocuments());
            }

        }
    };
    const getBasePath = (userType: string) => {
        return userType === "Auditor" ? "/dashboard" :
            userType === "Analyst" ? "/dashboard" :
                userType === "Admin" ? "/dashboard" : "";
    };

    return {
        getBasePath,
        getUserApiCall,
        isLoading: isProcessingRef.current,
        getChartApi
    };
}

