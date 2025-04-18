import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
    return (
        <div className="p-6 space-y-6">
            {/* Top Section: Charts Volume & HCC Identified */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Charts Volume */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <Skeleton className="h-6 w-1/3" /> {/* Title */}
                        <Skeleton className="h-72 w-full rounded-md" /> {/* Line Chart */}
                        <div className="flex justify-center gap-2">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-4 w-20 rounded" />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* HCC Identified */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <Skeleton className="h-6 w-1/3" /> {/* Title */}
                        <Skeleton className="h-64 w-full rounded-md" /> {/* Bar Chart */}
                        <div className="flex gap-2 justify-center">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-4 w-28 rounded" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Provider Table & HCC Codes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 10 Providers Table */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <Skeleton className="h-6 w-2/3" /> {/* Title */}
                        <div className="space-y-3">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-1/4" /> {/* Provider Name */}
                                    <Skeleton className="h-4 w-10" /> {/* Charts */}
                                    <Skeleton className="h-4 w-10" /> {/* V24 */}
                                    <Skeleton className="h-4 w-10" /> {/* V28 */}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top 10 HCC Codes */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <Skeleton className="h-6 w-2/3" /> {/* Title */}
                        <div className="grid grid-cols-2 gap-6">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-2/3" /> {/* Code */}
                                    <Skeleton className="h-4 w-1/4" /> {/* Value */}
                                </div>
                            ))}

                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
