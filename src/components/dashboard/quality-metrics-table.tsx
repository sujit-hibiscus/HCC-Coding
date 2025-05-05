"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import type { AnalystData } from "@/lib/types/dashboard";
import { useState } from "react";

interface QualityMetricsTableProps {
    analysts: AnalystData[]
    headerClassName?: string
    isLoading?: boolean
    maxInitialRows?: number
}

export function QualityMetricsTable({
    analysts,
    headerClassName = "bg-indigo-600 text-white",
    isLoading = false,
    maxInitialRows = 5,
}: QualityMetricsTableProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine how many rows to display based on expanded state
    const displayData = isExpanded ? analysts : analysts.slice(0, maxInitialRows);

    return (
        <Card className="shadow-sm border rounded-md overflow-hidden">
            <CardHeader className={`py-2 px-4 ${headerClassName}`}>
                <CardTitle className="text-center text-white">Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-auto max-h-[360px]">
                    <Table>
                        <TableHeader className="sticky top-0 bg-white z-10">
                            <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                                <TableHead className="font-semibold">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="px-3 py-0.5 bg-gray-200 text-gray-900 border-none">
                                            Analyst
                                        </Badge>
                                    </div>
                                </TableHead>
                                <TableHead className="text-right font-semibold">
                                    <div className="flex justify-end items-center">
                                        <Badge variant="outline" className="px-3 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                                            Charts Audited
                                        </Badge>
                                    </div>
                                </TableHead>
                                <TableHead className="text-right font-semibold">
                                    <div className="flex justify-end items-center">
                                        <Badge variant="outline" className="px-3 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                                            Quality Score
                                        </Badge>
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {isLoading
                                    ? // Loading state
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={`loading-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                            <TableCell className="py-3">
                                                <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2 ml-auto"></div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2 ml-auto"></div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    : // Data rows
                                    displayData.map((analyst, index) => (
                                        <motion.tr
                                            key={`${analyst.name}-${index}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                            className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                                        >
                                            <TableCell className="py-[5px] font-medium">{analyst.name}</TableCell>
                                            <TableCell className="text-right !pr-4 py-[5.8px] font-semibold">
                                                {Math.floor(analyst.totalCharts * 0.7).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right !pr-4 py-[5.8px] font-semibold">
                                                <span
                                                    className={`px-2 py-1 rounded ${analyst.qualityScore >= 95
                                                        ? "bg-green-100 text-green-800"
                                                        : analyst.qualityScore >= 90
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-amber-100 text-amber-800"
                                                        }`}
                                                >
                                                    {analyst.qualityScore}%
                                                </span>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>
                {!isExpanded && analysts.length > maxInitialRows ? (
                    <div className="p-2 text-center border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(true)}
                        >
                            Show {analysts.length - maxInitialRows} more analysts
                        </Button>
                    </div>
                ) : <div className="p-2 text-center border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(false)}
                    >
                        Hide {analysts.length - maxInitialRows}  analysts
                    </Button>
                </div>}
            </CardContent>
        </Card>
    );
}
