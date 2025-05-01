"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalystData } from "@/lib/types/dashboard";

interface AnalystTableProps {
  title: string
  analysts: AnalystData[]
  headerClassName?: string
}

export function AnalystTable({ title, analysts, headerClassName = "" }: AnalystTableProps) {
  return (
    <Card>
      <CardHeader className={`py-2 px-4 ${headerClassName}`}>
        <CardTitle className="text-center text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="font-semibold">Analyst Name</TableHead>
              <TableHead className="font-semibold text-right">Daily Target</TableHead>
              <TableHead className="font-semibold text-right">Total Charts</TableHead>
              <TableHead className="font-semibold text-right">Charts Per Day</TableHead>
              <TableHead className="font-semibold text-right">Time Per Day</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analysts.map((analyst, index) => (
              <TableRow key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                <TableCell className="font-medium">{analyst.name}</TableCell>
                <TableCell className="text-right">{analyst.dailyTarget}</TableCell>
                <TableCell className="text-right">{analyst.totalCharts}</TableCell>
                <TableCell className="text-right">{analyst.chartsPerDay}</TableCell>
                <TableCell className="text-right">{analyst.timePerDay} min</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
