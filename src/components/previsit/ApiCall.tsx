"use client";

import useFullPath from "@/hooks/use-fullpath";
import { useRedux } from "@/hooks/use-redux";
import useToast from "@/hooks/use-toast";
import { setActiveTabConditions } from "@/store/slices/DashboardSlice";
import { getHccMasterData } from "@/store/slices/masterDataSlice";
import { getAllDraftData, getAllPendingData, getAllProviderReviewData, getAllReviewData } from "@/store/slices/previsit-slice";
import { ChartDetailsRes, getChartDetails, getLabDocs, getMemberProgressNotes, getOtherDocs, getProviderDetail } from "@/store/slices/provider-details-slice";
import { getAllAppointmentCounts, getAllUsers } from "@/store/slices/user-slice";
import { useRef } from "react";

export function useApiCall() {
    const isProcessingRef = useRef(false);
    const { dispatch, selector } = useRedux();
    const { pendingData, draftData, reviewData, providerReview } = selector((state) => state?.previsit);
    const { target = "", fullPath = "" } = useFullPath();
    const { tabs: allOpenedTabs } = selector(state => state.dashboard);
    const { error, showPromiseToast, success } = useToast();

    const sidebarApiCall = async (id: string) => {
        if (id === "pending" && target !== "pending") {
            if (!(pendingData?.data?.length > 0)) {
                await dispatch(getAllPendingData());
            }
        }
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
    enum PrevisitTab {
        Pending = "pending",
        Draft = "draft",
        Review = "review",
        ProviderReview = "provider-review"
    }

    const previsitTabApiCall = async (id: PrevisitTab, isForce?: boolean) => {
        const dataMap = {
            [PrevisitTab.Pending]: { data: pendingData?.data, action: getAllPendingData },
            [PrevisitTab.Draft]: { data: draftData?.data, action: getAllDraftData },
            [PrevisitTab.Review]: { data: reviewData?.data, action: getAllReviewData },
            [PrevisitTab.ProviderReview]: { data: providerReview?.data, action: getAllProviderReviewData },
        };

        const { data, action } = dataMap[id];

        if (!(data?.length > 0) || isForce) {
            const fetchDataPromise = new Promise<void>(async (resolve, reject) => {
                try {
                    await dispatch(action()); // Extract response data
                    resolve();
                } catch (err) {
                    console.error("🚀 ~ fetchDataPromise ~ err:", err);
                    reject(new Error("An error occurred while fetching data."));
                }
            });

            /* showPromiseToast({
                promise: fetchDataPromise,
                loading: `Fetching ${id} data...`,
                error: "Failed to fetch data. Please try again.",
            }); */

            await fetchDataPromise;
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
        if (userType === "Analyst") {
            await dispatch(getAllPendingData());
        } else if (userType === "Provider") {
            await dispatch(getAllProviderReviewData());
        }

        dispatch(getAllAppointmentCounts());

    };
    const loginApi = async (target: "Login" | "Sidebar", userType: "Analyst" | "Provider") => {
        if (target === "Login") {
            callBulkApi(userType);
        } else if (target === "Sidebar") {
            await dispatch(getAllPendingData());
        }

    };

    const getProviderDetails = async (id: string, type: "member" | "chart", mID?: string) => {
        if ((id?.length > 0)) {
            try {
                if (type === "member" && mID) {
                    if (!(allOpenedTabs?.map(item => item?.id)?.includes(id?.replace(/ /g, "-")))) {
                        return showPromiseToast({
                            promise: dispatch(getProviderDetail(mID)),
                            loading: "Loading provider details...",
                            error: "Failed to load provider details",
                            duration: 4000
                        });
                    }
                } else if (type === "chart") {
                    if (!(allOpenedTabs?.map(item => item?.id)?.includes(id))) {
                        // Use showPromiseToast for chart details
                        return showPromiseToast({
                            promise: dispatch(getChartDetails(id)).then(result => {
                                try {
                                    const data = result?.payload as ChartDetailsRes;
                                    const apiEntry = data ? data?.data?.medical_conditions?.map((item, index) => {
                                        const { concept } = item;
                                        return {
                                            "id": index,
                                            "condition": concept,
                                            category: item?.category,
                                            note: item?.analyst_notes ? item?.analyst_notes : "",
                                            pNote: item?.provider_notes ? item?.provider_notes : "",
                                            "isExpanded": false,
                                            "status": "pending",
                                            "code": {
                                                "v24": item?.hcc_v24 || 0,
                                                "v28": item?.hcc_v28 || 0
                                            },
                                            "references": [
                                                {
                                                    "id": "ref1",
                                                    "title": item?.member_documents?.doc_file_name,
                                                    "type": "Clinical",
                                                    "dated": "2024-01-15",
                                                    "pdfUrl": item?.member_documents?.doc_path
                                                }
                                            ]
                                        };
                                    }) || [] : [];

                                    dispatch(setActiveTabConditions(apiEntry));
                                    return result;
                                } catch (error) {
                                    console.error("Error processing chart data:", error);
                                    throw error; // Re-throw to trigger the error toast
                                }
                            }),
                            loading: "Loading chart details...",
                            error: "Failed to load chart details",
                            duration: 4000
                        });
                    }
                }
            } catch (e) {
                console.error("🚀 ~ getProviderDetails ~ e:", e);
                // Handle any unexpected errors
                error({
                    message: "An unexpected error occurred",
                    duration: 4000
                });
                console.error("Error in getProviderDetails:", error);
            }
        }
    };

    const getBasePath = (userType: string) => {
        return userType === "Provider" ? "/dashboard" : userType === "Analyst" ? "/dashboard" : "";
        // return userType === "Provider" ? "/dashboard/previsit/provider-review" : userType === "Analyst" ? "/dashboard/previsit/pending" : ""
    };

    const getLoginMasterData = () => {
        dispatch(getHccMasterData());
    };

    return {
        sidebarApiCall,
        getProviderDetails,
        previsitTabApiCall,
        memberTabApiCall,
        loginApi,
        getBasePath,
        getUserApiCall,
        isLoading: isProcessingRef.current,
        getLoginMasterData
    };
}

