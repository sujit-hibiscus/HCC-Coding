"use client";

import { DataTable } from "@/components/common/data-table/data-table";
import { Loader } from "@/components/ui/Loader";
import { useLoading } from "@/hooks/use-loading";
import { useRedux } from "@/hooks/use-redux";
import { useTabs } from "@/hooks/use-tabs";
import { PrevisitTab, ProviderReviewData, ProviderReviewDataTypes } from "@/lib/types/PrevisitTypes";
import { filterData } from "@/lib/utils";
import { Suspense, useState } from "react";
import { useApiCall } from "../ApiCall";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { ProviderReviewPrevisitColumns } from "./ProviderReviewPrevisitColumns";

export default function ProviderReview() {
    const { selector } = useRedux();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { addChartId } = useTabs();
    const [isOpenCancel, setIsOpenCancel] = useState<boolean>(false);
    const { previsitTabApiCall } = useApiCall();

    const { search = "" } = selector(state => state?.dashboard);
    const { data: providerReviewData, status } = selector((state) => state?.previsit?.providerReview);
    const { isLoading } = useLoading();
    const isTest = process.env.NEXT_PUBLIC_TEST;
    const finalData = isTest ? ProviderReviewData : providerReviewData?.length > 0 ? providerReviewData : [];
    const filteredData = filterData(finalData, search);
    const handleNo = () => {
        setIsOpen(true);
    };

    const handleViewLog = (chartId: string) => {
        addChartId({ chartId, chartType: "chartlog", link: "/dashboard/" });
    };
    const handleCancel = () => {
        setIsOpenCancel(true);
    };

    const columns = ProviderReviewPrevisitColumns({
        onViewLog: handleViewLog,
        onNoShow: handleNo,
        onCancel: handleCancel,
    });

    const tableLoader = (
        <div className="py-8 flex h-[85vh] flex-col items-center justify-center">
            <Loader variant="table" size="md" text="" className="mb-4" />
            <div className="w-full max-w-3xl">
                <Loader variant="skeleton" />
            </div>
        </div>
    );
    const isTableLoading = status === "loading" || isLoading("fetchProviderReviewData");
    return (
        <div className="h-full">
            <ConfirmationDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onConfirm={() => {
                    setIsOpen(false);
                }}
                title="Are you sure you want to mark the appointment as"
                description="No show?"
            />
            <ConfirmationDialog
                isOpen={isOpenCancel}
                onClose={() => setIsOpenCancel(false)}
                onConfirm={() => {
                    setIsOpenCancel(false);
                }}
                title="Are you sure you want to mark the appointment as"
                description="Cancelled?"
            />
            {isTableLoading ? tableLoader :
                <Suspense fallback={tableLoader}>
                    <DataTable<ProviderReviewDataTypes, string>
                        columns={columns}
                        data={filteredData as ProviderReviewDataTypes[]}
                        dateKey="dos"
                        isRefreshing={isTableLoading}
                        handleRefresh={() => {
                            setTimeout(async () => {
                                previsitTabApiCall("provider-review" as PrevisitTab, true);
                            });
                        }}
                        onAction={() => { }}
                        defaultPageSize={20}
                    />
                </Suspense>}
        </div>
    );
}

