"use client"

import ProgressiveLoader from "@/components/common/ProgressiveLoader"
import { SidebarProvider } from "@/components/ui/sidebar"
import ReduxProvider from "@/store/ReduxProvider"
import { useSelectedLayoutSegments } from "next/navigation"

export default function LoginSkeletonLoader() {
    const segments = useSelectedLayoutSegments()
    const fullPath = '/' + segments.join('/')

    return (
        fullPath === "/" ? <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-[32rem] bg-white rounded-lg shadow-lg p-8 space-y-6">
                {/* Title Skeleton */}
                <div className="text-center">
                    <div className="h-8 bg-gray-200 rounded-md animate-pulse mx-auto w-3/4"></div>
                </div>

                {/* Login Heading Skeleton */}
                <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded-md animate-pulse w-16"></div>

                    {/* Email Field Skeleton */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                        <div className="h-12 bg-gray-100 border border-gray-200 rounded-md animate-pulse"></div>
                    </div>

                    {/* Password Field Skeleton */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                        <div className="relative">
                            <div className="h-12 bg-gray-100 border border-gray-200 rounded-md animate-pulse"></div>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Sign In Button Skeleton */}
                    <div className="pt-2">
                        <div className="h-12 bg-gray-200 rounded-md animate-pulse w-full"></div>
                    </div>
                </div>
            </div>
        </div> : <ReduxProvider>
            <SidebarProvider>
                <div className="flex h-screen w-full">
                    <div className={`absolute z-[111111] `}
                        style={{
                            height: "100%",
                            width: "100%",
                            "--header-height": "0.4rem",
                            "--tab-bar-height": "2.5rem"
                        } as React.CSSProperties}
                    >
                        {<ProgressiveLoader />}
                    </div>
                </div>
            </SidebarProvider>
        </ReduxProvider >
    )
}
