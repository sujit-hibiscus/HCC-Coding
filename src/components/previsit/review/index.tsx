"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { Loader } from "@/components/ui/Loader";
import { useLoading } from "@/hooks/use-loading";
import { useRedux } from "@/hooks/use-redux";
import { useTabs } from "@/hooks/use-tabs";
import { PrevisitTab, ReviewData, ReviewDataTypes } from "@/lib/types/PrevisitTypes";
import { filterData } from "@/lib/utils";
import { Suspense } from "react";
import { useApiCall } from "../ApiCall";
import { ReviewPrevisitColumns } from "./ReviewPrevisitColumns";

export default function ReviewDataTable() {
    const { selector } = useRedux();
    const { addChartId } = useTabs();
    const { search = "" } = selector(state => state?.dashboard);
    const { data: reviewData, status } = selector((state) => state?.previsit?.reviewData);
    const { isLoading } = useLoading();
    const isTest = process.env.NEXT_PUBLIC_TEST;
    const finalData = isTest ? ReviewData : reviewData?.length > 0 ? reviewData : [];
    const filteredData = filterData(finalData, search);
    const { previsitTabApiCall } = useApiCall();
    const handleViewLog = (chartId: string) => {
        addChartId({ chartId, chartType: "chartlog", link: "/dashboard/" });
    };

    const columns = ReviewPrevisitColumns({
        onViewLog: handleViewLog,
    });

    const isTableLoading = status === "loading" || isLoading("fetchProviderReviewData");
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
            {isTableLoading ? tableLoader : <Suspense fallback={tableLoader}><DataTable<ReviewDataTypes, string>
                columns={columns}
                isRefreshing={isTableLoading}
                handleRefresh={() => {
                    setTimeout(async () => {
                        previsitTabApiCall("review" as PrevisitTab, true);
                    });
                }}
                data={filteredData as ReviewDataTypes[]}
                dateKey="dos"

                onAction={() => { }}
                defaultPageSize={20}
            />
            </Suspense>}
        </div>
    );
}

