"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { Loader } from "@/components/ui/Loader";
import { useLoading } from "@/hooks/use-loading";
import { useRedux } from "@/hooks/use-redux";
import { useTabs } from "@/hooks/use-tabs";
import { PrevisitData, PrevisitDataTypes, PrevisitTab } from "@/lib/types/PrevisitTypes";
import { filterData } from "@/lib/utils";
import { Suspense, useState } from "react";
import { useApiCall } from "../ApiCall";
import { RetryDialog } from "../RetryModal";
import { PendingPrevisitColumns } from "./PendingPrevisitColumns";

export default function PendingPresitTable() {
    const { selector } = useRedux();
    const [isRetryDialogOpen, setIsRetryDialogOpen] = useState(false);
    const [selectedChartId, setSelectedChartId] = useState<string>("");
    const { search = "" } = selector(state => state?.dashboard);
    const { addChartId } = useTabs();
    const { isLoading } = useLoading();
    const { data: previsitData, status } = selector((state) => state?.previsit?.pendingData);
    const isTest = process.env.NEXT_PUBLIC_TEST;
    const finalData = isTest ? PrevisitData : previsitData?.length > 0 ? previsitData : [];
    const filteredData = filterData(finalData, search);
    const { previsitTabApiCall } = useApiCall();
    const handleViewLog = (chartId: string) => {
        addChartId({ chartId, chartType: "chartlog", link: "/dashboard/" });
    };

    const handleRetryConfirm = () => {
        setIsRetryDialogOpen(false);
    };

    const handleManualUpload = () => {
        // addChartId({ chartId, chartType: "manual" });
    };

    const handleRetry = (chartId: string) => {
        setSelectedChartId(chartId);
        setIsRetryDialogOpen(true);
    };



    const columns = PendingPrevisitColumns({
        onManualUpload: handleManualUpload,
        onRetry: handleRetry,
        onViewLog: handleViewLog,
    });


    const isTableLoading = status === "loading" || isLoading("fetchPendingData");


    const tableLoader = (
        <div className="py-8 flex h-[85vh] flex-col items-center justify-center">
            <Loader variant="table" size="md" text="" className="mb-4" />
            <div className="w-full max-w-3xl">
                <Loader variant="skeleton" />
            </div>
        </div>
    );

    return (
        <div className="h-full">
            <RetryDialog
                isOpen={isRetryDialogOpen}
                onClose={() => setIsRetryDialogOpen(false)}
                onConfirm={handleRetryConfirm}
                chartId={selectedChartId}
            />
            {isTableLoading ? tableLoader : <Suspense fallback={tableLoader}>
                <DataTable<PrevisitDataTypes, string>
                    columns={columns}
                    isRefreshing={isTableLoading}
                    handleRefresh={() => {
                        setTimeout(async () => {
                            previsitTabApiCall("pending" as PrevisitTab, true);
                        });
                    }}
                    data={filteredData as PrevisitDataTypes[]}
                    dateKey="dos"
                    onAction={() => { }}
                    defaultPageSize={20}
                />
            </Suspense>
            }
        </div>
    );
}

