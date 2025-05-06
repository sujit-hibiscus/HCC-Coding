"use client";
import { DataTable } from "@/components/common/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/Loader";
import { useLoading } from "@/hooks/use-loading";
import { useRedux } from "@/hooks/use-redux";
import type { UserTypes } from "@/lib/types/chartsTypes";
import { filterData } from "@/lib/utils";
import { getAllUsers } from "@/store/slices/user-slice";
import { RefreshCcw } from "lucide-react";
import { Suspense } from "react";
import { UserTableColumns } from "./userTableColumns";

interface UserTableProps {
    onEdit: (user: UserTypes) => void
    onDelete: (id: string) => void
}

export function UserTable({ onEdit, onDelete }: UserTableProps) {
    const { selector, dispatch } = useRedux();
    const { status: usersStatus } = selector((state) => state.user.users);
    const { data: users } = selector((state) => state.user.users);
    const { isLoading } = useLoading();

    const { search = "" } = selector((state) => state?.dashboard);
    const filteredData = filterData(users || [], search);

    const handleDelete = (chartId: string) => {
        onDelete(chartId);
    };

    const handleEdit = (chartId: string) => {
        const targetEntry = users?.find((item) => item?.id == +chartId);
        if (targetEntry) {
            onEdit(targetEntry);
        }
    };

    // Define table columns
    const columns = UserTableColumns({
        onDelete: handleDelete,
        onEdit: handleEdit,
    });

    const isTableLoading = usersStatus === "Loading" || isLoading("fetchDraftData");
    const hasNoData = !isTableLoading && (!users || users.length === 0);

    const tableLoader = (
        <div className="py-8 flex flex-col items-start justify-center">
            <Loader rowCount={6} variant="table" size="md" text="" className="mb-4" />
            <div className="w-full max-w-3xl">
                <Loader variant="skeleton" />
            </div>
        </div>
    );

    return (
        <div className="h-full relative">
            {isTableLoading ? (
                tableLoader
            ) : hasNoData ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground mb-4">No users found</p>
                    <Button variant="outline" onClick={() => dispatch(getAllUsers())} className="gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            ) : (
                <Suspense fallback={tableLoader}>
                    <DataTable<UserTypes, string>
                        columns={columns}
                        data={filteredData as UserTypes[]}
                        dateKey=""
                        onAction={() => { }}
                        defaultPageSize={25}
                        isRefreshing={isTableLoading}
                        handleRefresh={() => {
                            dispatch(getAllUsers());
                        }}
                    />
                </Suspense>
            )}
        </div>
    );
}
