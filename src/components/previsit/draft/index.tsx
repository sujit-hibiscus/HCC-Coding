"use client";
import { DataTable } from "@/components/common/data-table/data-table";
import { Loader } from "@/components/ui/Loader";
import { useLoading } from "@/hooks/use-loading";
import { useRedux } from "@/hooks/use-redux";
import { useTabs } from "@/hooks/use-tabs";
import { DraftData, PrevisitTab, type DraftDataTypes } from "@/lib/types/PrevisitTypes";
import { filterData } from "@/lib/utils";
import { Suspense } from "react";
import { useApiCall } from "../ApiCall";
import { DraftPrevisitColumns } from "./DraftPrevisitColumns";

export default function DraftDataTable() {
    const { selector } = useRedux();
    const { addChartId } = useTabs();
    const { isLoading } = useLoading();
    const { data: draftData, status } = selector((state) => state?.previsit?.draftData);
    const { search = "" } = selector((state) => state?.dashboard);
    const { getProviderDetails, previsitTabApiCall } = useApiCall();


    const isTest = process.env.NEXT_PUBLIC_TEST;
    const finalData = isTest ? DraftData : draftData?.length > 0 ? draftData : [];
    const filteredData = filterData(finalData, search);

    const handleManualUpload = (chartId: string) => {
        setTimeout(() => {
            getProviderDetails(chartId, "chart");
        });
        addChartId({ chartId, chartType: "manual" });
    };

    const handleViewLog = (chartId: string) => {
        addChartId({ chartId, chartType: "chartlog", link: "/dashboard/" });
    };

    const handleArchive = (chartId: string) => {
        console.log("View log for chart:", chartId);
    };

    const columns = DraftPrevisitColumns({
        onManualUpload: handleManualUpload,
        onViewLog: handleViewLog,
        onArchive: handleArchive,
    });

    const isTableLoading = status === "loading" || isLoading("fetchDraftData");

    const tableLoader = (
        <div className="py-8 flex h-[85vh] flex-col items-center justify-center">
            <Loader variant="table" size="md" text="" className="mb-4" />
            <div className="w-full max-w-3xl">
                <Loader variant="skeleton" />
            </div>
        </div>
    );

    return (
        <div className="h-full relative">
            {isTableLoading ? tableLoader : (
                <Suspense fallback={tableLoader}>
                    <DataTable<DraftDataTypes, string>
                        columns={columns}
                        data={filteredData as DraftDataTypes[]}
                        dateKey="dos"
                        onAction={() => { }}
                        defaultPageSize={20}
                        isRefreshing={isTableLoading}
                        handleRefresh={() => {
                            setTimeout(async () => {
                                previsitTabApiCall("draft" as PrevisitTab, true);
                            });
                        }}
                    />
                </Suspense>
            )}
        </div>
    );
}

