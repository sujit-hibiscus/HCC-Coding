import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function DocumentSkeleton() {
    return (
        <div className="flex h-full w-full flex-col bg-white">
            <div className="flex flex-1">
                {/* Left sidebar */}
                <div className="w-full md:w-[24rem]  border-r bg-gray-50/50">
                    <div className="p-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input type="search" placeholder="Search documents..." className="pl-8" disabled />
                        </div>
                    </div>

                    <div className="space-y-1 px-2">
                        {/* Document items */}
                        {[1, 2, 3, 4, 5].map((item) => (
                            <Card key={item} className="mb-2 overflow-hidden">
                                <CardContent className="p-3">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <Skeleton className="h-5 w-40" />
                                            <Badge className="px-2 py-0 text-xs">
                                                <Skeleton className="h-3 w-14" />
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Skeleton className="h-3 w-16" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Main content */}
                <div className="flex flex-1 flex-col">
                    <div className="flex h-12 items-center justify-between border-b px-4">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-8 w-24" />
                    </div>

                    <div className="flex-1 p-6 ">
                        <div className="mx-auto relative">
                            <Skeleton className="mb-6 h-8 w-3/4" />

                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/6" />
                            </div>

                            <div className="mt-8 space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-4/6" />
                            </div>

                            <div className="absolute h-full w-full flex justify-center items-center 
                            ">
                                <div>
                                    <div className="mt-12 flex justify-center">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                    </div>

                                    <div className="mt-4 flex justify-center">
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
