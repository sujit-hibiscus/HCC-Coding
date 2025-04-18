import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-64 rounded-md" />
                    <Skeleton className="h-10 w-36 rounded-md" />
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart Volume */}
                <div className="border rounded-lg p-4 shadow-sm space-y-4">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-64 w-full rounded-md" />
                    <div className="flex justify-center flex-wrap gap-2">
                        <Skeleton className="h-4 w-14 rounded-full" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                        <Skeleton className="h-4 w-24 rounded-full" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                </div>

                {/* Top 10 HCC Codes V24 + V28 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 shadow-sm space-y-4">
                        <Skeleton className="h-5 w-44" />
                        <div className="p-2 flex justify-center ">
                            <Skeleton className="h-[280px] w-[300px] rounded-full" />
                        </div>
                    </div>
                    <div className="border rounded-lg p-4 shadow-sm space-y-4">
                        <Skeleton className="h-5 w-44" />
                        <div className="p-2 flex justify-center ">
                            <Skeleton className="h-[280px] w-[300px] rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Top 10 Providers (HCC Volume) */}
                <div className="border rounded-lg p-4 shadow-sm space-y-4">
                    <Skeleton className="h-5 w-56" />
                    <Skeleton className="h-64 w-full rounded-md" />
                    <div className="flex justify-center flex-wrap gap-2">
                        <Skeleton className="h-4 w-28 rounded-full" />
                        <Skeleton className="h-4 w-32 rounded-full" />
                        <Skeleton className="h-4 w-28 rounded-full" />
                        <Skeleton className="h-4 w-32 rounded-full" />
                    </div>
                </div>

                {/* HCC V24 vs V28 */}
                <div className="border rounded-lg p-4 shadow-sm space-y-4">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-64 w-full rounded-md" />
                    <div className="flex justify-center flex-wrap gap-2">
                        <Skeleton className="h-4 w-28 rounded-full" />
                        <Skeleton className="h-4 w-32 rounded-full" />
                        <Skeleton className="h-4 w-28 rounded-full" />
                        <Skeleton className="h-4 w-32 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
