import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import React from "react";

interface ConditionCommonCardProps {
    status?: "accepted" | "rejected";
    expanded?: boolean;
    onExpand?: () => void;
    icdCode?: string;
    hccV28Code?: string;
    code_status?: string | null
    hccCode?: string;
    icd10_desc?: string;
    diagnosis: string;
    description: string;
    evidence: string;
    query?: string | null;
    actionButtons?: React.ReactNode;
    className?: string;
    V24HCC: string
    children?: React.ReactNode;
}

export const ConditionCommonCard: React.FC<ConditionCommonCardProps> = ({
    status,
    expanded,
    onExpand,
    icdCode,
    hccV28Code,
    hccCode, code_status,
    icd10_desc,
    diagnosis,
    description,
    evidence,
    query,
    V24HCC = "",
    actionButtons,
    className,
    children,
}) => {
    return (
        <Card
            className={cn(
                "border transition-all duration-200 !bg-white overflow-hidden",
                status === "accepted" && "border-emerald-200 bg-emerald-50/30",
                status === "rejected" && "border-rose-200 bg-rose-50/30",
                expanded && "ring-2 ring-blue-200 shadow-md",
                className
            )}
        >
            <CardContent className="p-2 relative flex gap-2.5 items-center justify-between">
                <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            {icdCode && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge
                                            variant="outline"
                                            className={`font-mono px-1.5 text-xs ${icdCode?.includes("$") ? " text-yellow-700 border-yellow-200 bg-yellow-100" : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"}`}
                                        >
                                            ICD:{icdCode?.replace("$", "")}
                                        </Badge>
                                    </TooltipTrigger>
                                    {icd10_desc && icd10_desc?.length > 0 && (
                                        <TooltipContent>{icd10_desc}</TooltipContent>
                                    )}
                                </Tooltip>
                            )}
                            {hccV28Code && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge
                                            variant="outline"
                                            className="font-mono px-1.5 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                        >
                                            V28:{hccV28Code}
                                        </Badge>
                                    </TooltipTrigger>
                                </Tooltip>
                            )}
                            {V24HCC && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge
                                            variant="outline"
                                            className="font-mono px-1.5 text-xs bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                        >
                                            V24:{V24HCC}
                                        </Badge>
                                    </TooltipTrigger>
                                </Tooltip>
                            )}
                            {hccCode && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge
                                            variant="outline"
                                            className="font-mono px-1.5 text-xs bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                        >
                                            RX-HCC:{hccCode}
                                        </Badge>
                                    </TooltipTrigger>
                                </Tooltip>
                            )}

                        </div>
                        {code_status && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge
                                        variant="outline"
                                        className="font-mono text-xs bg-lime-50 text-lime-700 px-1.5 border-lime-200 hover:bg-lime-100"
                                    >
                                        {code_status}
                                    </Badge>
                                </TooltipTrigger>
                            </Tooltip>
                        )}
                    </div>
                    <div className="flex items-start justify-between gap-2 relative">
                        <div className="flex-1 min-w-0">
                            {/* Main Content */}
                            <div className="space-y-2">
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{diagnosis}</h3>
                                    <p className="text-sm text-gray-600 text-justify pr-2 mt-0.5">{description}</p>
                                </div>
                                {/* Evidence Section */}
                                <div className="bg-blue-50 ">
                                    <div className="flex items-start justify-between gap-2">
                                        {evidence?.length > 0 && <div className="flex-1 min-w-0">
                                            <div className={cn("overflow-hidden transition-all duration-300", expanded ? "max-h-none" : "")}>
                                                <div className="text-xs gap-1 items-start p-1 text-gray-700 flex leading-relaxed text-justify">
                                                    <div className=" flex flex-shrink-0">
                                                        <Image src="/images/Lab.svg" alt="Clinical Indicators" width={15} height={15} className="pt-0.5 inline-block" />
                                                    </div>
                                                    :{" "}{evidence}
                                                </div>
                                            </div>
                                        </div>}
                                        {evidence.length > 300 && onExpand && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={onExpand}
                                                className="h-6 px-2 text-xs shrink-0"
                                            >
                                                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {(query && query !== "NA") && (
                                    <div className="flex items-center justify-between text-xs text-gray-500 bg-yellow-50">
                                        <div className="text-xs gap-1 items-start p-1 text-gray-700 flex leading-relaxed">
                                            <div className=" flex flex-shrink-0">
                                                <Image src="/images/query.svg" alt="Query icon" width={15} height={15} className="pt-0.5 inline-block" />
                                            </div>
                                            :{" "}
                                            <span className="italic text-justify">{query}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {children}
                        </div>
                        {actionButtons && <div className="flex relative flex-col gap-1.5 shrink-0 self-center">
                            {actionButtons}
                        </div>}

                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 