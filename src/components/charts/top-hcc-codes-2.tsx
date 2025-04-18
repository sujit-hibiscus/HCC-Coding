"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnimatePresence, motion } from "framer-motion";

const COLORS = [
  "#4D96FF",
  "#A66DD4",
  "#F97316",
  "#22C55E",
  "#EC4899",
  "#F43F5E",
  "#10B981",
  "#6366F1",
  "#EAB308",
  "#0EA5E9",
];

interface TopHccCodesProps {
  data: {
    name: string
    value: number
  }[]
  version: "V24" | "V28"
  isExpanded?: boolean
  isLoading?: boolean
  onExpand?: () => void
}

export function TopHccCodes2({ data, version, isExpanded, isLoading, onExpand }: TopHccCodesProps) {
  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    fill: COLORS[index % COLORS.length],
  }));


  // Determine how many rows to display based on expanded state
  const displayData = isExpanded ? chartData : chartData.slice(0, 11);

  return (
    <div className="overflow-auto max-h-[350px] rounded-md border shadow-sm">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10">
          <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <TableHead className="w-[75%] font-semibold flex items-center gap-2">
              <div className="flex items-center gap-2 text-black">
                <Badge
                  variant="outline"
                  className={"px-3 border-none py-0.5 bg-gray-200 text-gray-900 border-sky-200"}
                >

                  Code
                </Badge>
              </div>
            </TableHead>
            <TableHead className="text-right font-semibold">
              <div className="flex justify-end items-center">
                <Badge
                  variant="outline"
                  className={`px-3 py-0.5 ${version === "V24"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-sky-50 text-sky-700 border-sky-200"
                    }`}
                >
                  {version}
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
                </TableRow>
              ))
              : // Data rows
              displayData.map((item, index) => (
                <motion.tr
                  key={`${item.name}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <TableCell className="py-[5px]">
                    <div className="flex items-center">
                      {/* <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div> */}
                      <span>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right !pr-4 py-[5px] font-semibold">{item.value.toLocaleString()}</TableCell>
                </motion.tr>
              ))}
          </AnimatePresence>
        </TableBody>
      </Table>
      {!isExpanded && displayData.length < chartData.length && (
        <div className="p-2 text-center border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExpand}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Show {chartData.length - displayData.length} more codes
          </Button>
        </div>
      )}
    </div>
  );
}
