"use client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ChartLogHeaderLoading = () => {
    return (
        <Card className="mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i}>
                        <Skeleton className="h-6 w-44" />
                    </div>
                ))}
            </div>
        </Card>
    );
};

const ChartLogBodyLoading = () => {
    return (
        <div className="gap-3 grid grid-cols-4">
            {Array(5).fill(0).map((_, index) => (
                <Skeleton key={index} className="flex p-4 bg-transparent items-center border h-full w-full space-x-4">
                    <div className="flex flex-col w-full gap-2">
                        <div className="flex items-center gap-4 justify-between">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-4" />
                        </div>
                        <Skeleton className="h-6 w-44" />
                    </div>
                </Skeleton>
            ))}
        </div>
    );
};

const ChartLogLoading = () => {
    return (
        <div className="h-full p-2">
            <div className="mx-auto h-full flex flex-col gap-2">
                <ChartLogHeaderLoading />
                <ChartLogBodyLoading />
            </div>
        </div>
    );
};

export default ChartLogLoading;
export { ChartLogHeaderLoading, ChartLogBodyLoading };