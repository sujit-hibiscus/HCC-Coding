"use client";
import { DataTable } from "@/components/common/data-table/data-table";
import { Loader } from "@/components/ui/Loader";
import { useLoading } from "@/hooks/use-loading";
import { useRedux } from "@/hooks/use-redux";
import { UserTypes } from "@/lib/types/PrevisitTypes";
import { filterData } from "@/lib/utils";
import { getAllUsers } from "@/store/slices/user-slice";
import { Suspense } from "react";
import { UserTableColumns } from "./userTableColumns";

interface UserTableProps {
    onEdit: (user: UserTypes) => void
    onDelete: (id: string) => void
}


const testUsers: UserTypes[] = [
    {
        id: 1,
        Fname: "Alice",
        Lname: "Johnson",
        email: "alice@example.com",
        profile_type: "Analyst",
        password: "Analyst",
    },
    {
        id: 2,
        Fname: "Bob",
        Lname: "Smith",
        email: "bob@example.com",
        profile_type: "Provider",
        password: "Analyst",
        // Add other fields as needed
    },
    {
        id: 3,
        Fname: "Charlie",
        Lname: "Brown",
        email: "charlie@example.com",
        profile_type: "Provider",
        password: "Analyst",
        // Add other fields as needed
    },
];


export function UserTable({ onEdit, onDelete }: UserTableProps) {
    const { selector, dispatch } = useRedux();
    const { status: usersStatus } = selector((state) => state.user.users);
    const { data: users } = selector((state) => state.user.users);

    const { isLoading } = useLoading();
    const finalData = [...(users ?? []), ...testUsers];

    const { search = "" } = selector((state) => state?.dashboard);
    const filteredData = filterData(finalData ? finalData : [], search);
    const handleDelete = (chartId: string) => {
        onDelete(chartId);
    };

    const handleEdit = (chartId: string) => {
        const targetEntry = finalData?.find(item => item?.id == +chartId);
        if (targetEntry) {
            onEdit(targetEntry);
        }
    };

    // Define table columns
    const columns = UserTableColumns({
        onDelete: handleDelete,
        onEdit: handleEdit,
    });

    const isTableLoading = status === "loading" || isLoading("fetchDraftData");

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
            {(isTableLoading || usersStatus === "Loading") ? tableLoader : (
                <Suspense fallback={tableLoader}>
                    <DataTable<UserTypes, string>
                        columns={columns}
                        data={filteredData as UserTypes[]}
                        dateKey=""
                        onAction={() => { }}
                        defaultPageSize={20}
                        isRefreshing={isTableLoading}
                        handleRefresh={() => {
                            setTimeout(async () => {
                                await dispatch(getAllUsers());
                            });
                        }}
                    />
                </Suspense>
            )}
        </div>
    );
}

