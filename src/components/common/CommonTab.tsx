"use client";

import type React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Typography } from "../ui/Typography";
import { cn } from "@/lib/utils";

interface Tab {
    value: string
    label: string
    icon?: React.ElementType
    count?: number
}

interface TabsComponentProps {
    tabs: Tab[]
    currentTab: string
    isFull?: boolean
    countLoading?: boolean
    handleTabChange: (value: string) => void
}

const TabsComponent: React.FC<TabsComponentProps> = ({
    tabs,
    isFull = false,
    currentTab,
    countLoading = false,
    handleTabChange,
}) => {
    return (
        <ScrollArea className="w-full">
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full flex items-center">
                <TabsList
                    className={cn(
                        "inline-flex items-center justify-center rounded-none md:gap-0 !p-0 shadow-md md:px-1.5  bg-selectedText text-tabBg",
                        isFull && "w-full",
                    )}
                >
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = tab?.value === currentTab;
                        return (
                            <TabsTrigger
                                aria-hidden="true"
                                key={tab.value}
                                value={tab.value}
                                className="relative h-full w-full rounded-none inline-flex items-center justify-center whitespace-nowrap px-2 md:px-2.5 gap-1  text-sm lg:text-base font-medium ring-offset-background transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-selectedText data-[state=active]:shadow-sm data-[state=active]:bg-primary"
                            >
                                {Icon && <Icon className="md:mr-2 h-4 w-4" />}
                                <Typography
                                    variant="tab"
                                    className={`${isSelected ? "text-selectedText dark:text-selectedText" : ""} ${Icon && "hidden md:block"}`}
                                >
                                    {tab.label}
                                </Typography>
                                <div className="pb-0.5">
                                    {(tab.count !== undefined || tab.count === 0) &&
                                        (countLoading ? (
                                            <div
                                                className={cn(
                                                    "ml-1 w-4 h-4 rounded-full animate-pulse",
                                                    isSelected
                                                        ? "bg-selectedText dark:bg-gray-500" // More visible when selected
                                                        : "bg-tabBg dark:bg-gray-700", // Standard when not selected
                                                )}
                                            ></div>
                                        ) : (
                                            <Badge
                                                variant="default"
                                                className={`text-xs bg-transparent shadow-none ml-1 p-0 transition-colors duration-300 ${isSelected ? "text-selectedText " : " text-tabBg"}`}
                                            >
                                                {tab.count}
                                            </Badge>
                                        ))}
                                </div>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </Tabs>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
};

export default TabsComponent;

