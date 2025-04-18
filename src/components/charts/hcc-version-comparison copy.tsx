"use client";

import React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowUp, ArrowDown, Minus, ChevronRight, FileText, Activity } from "lucide-react";

// Sample data for HCC version comparison
const hccVersionData = [
  {
    id: "p1",
    name: "Sophia Anderson",
    date: "2023-01-15",
    V24: { Suggested: 5, CarryForward: 3 },
    V28: { Suggested: 7, CarryForward: 2 },
    chartStatus: { Pending: 3, Draft: 2, Review: 4, ProviderReview: 1 },
  },
  {
    id: "p2",
    name: "Jackson Bennett",
    date: "2023-01-16",
    V24: { Suggested: 3, CarryForward: 4 },
    V28: { Suggested: 5, CarryForward: 3 },
    chartStatus: { Pending: 2, Draft: 3, Review: 2, ProviderReview: 1 },
  },
  {
    id: "p3",
    name: "Ava Thompson",
    date: "2023-01-17",
    V24: { Suggested: 6, CarryForward: 2 },
    V28: { Suggested: 4, CarryForward: 5 },
    chartStatus: { Pending: 1, Draft: 4, Review: 3, ProviderReview: 1 },
  },
  {
    id: "p4",
    name: "Ethan Ramirez",
    date: "2023-01-18",
    V24: { Suggested: 4, CarryForward: 5 },
    V28: { Suggested: 6, CarryForward: 4 },
    chartStatus: { Pending: 4, Draft: 2, Review: 2, ProviderReview: 2 },
  },
  {
    id: "p5",
    name: "Isabella Rivera",
    date: "2023-01-19",
    V24: { Suggested: 7, CarryForward: 3 },
    V28: { Suggested: 5, CarryForward: 6 },
    chartStatus: { Pending: 2, Draft: 3, Review: 5, ProviderReview: 2 },
  },
  {
    id: "p6",
    name: "Liam Gonzalez",
    date: "2023-01-20",
    V24: { Suggested: 6, CarryForward: 4 },
    V28: { Suggested: 8, CarryForward: 3 },
    chartStatus: { Pending: 3, Draft: 4, Review: 2, ProviderReview: 2 },
  },
  {
    id: "p7",
    name: "Mia Martinez",
    date: "2023-01-21",
    V24: { Suggested: 4, CarryForward: 6 },
    V28: { Suggested: 5, CarryForward: 5 },
    chartStatus: { Pending: 2, Draft: 5, Review: 1, ProviderReview: 2 },
  },
  {
    id: "p8",
    name: "Noah Hernandez",
    date: "2023-01-22",
    V24: { Suggested: 8, CarryForward: 2 },
    V28: { Suggested: 7, CarryForward: 4 },
    chartStatus: { Pending: 1, Draft: 3, Review: 4, ProviderReview: 3 },
  },
  {
    id: "p9",
    name: "Emma Robinson",
    date: "2023-01-23",
    V24: { Suggested: 5, CarryForward: 5 },
    V28: { Suggested: 6, CarryForward: 6 },
    chartStatus: { Pending: 3, Draft: 2, Review: 3, ProviderReview: 3 },
  },
  {
    id: "p10",
    name: "Lucas Scott",
    date: "2023-01-24",
    V24: { Suggested: 3, CarryForward: 7 },
    V28: { Suggested: 4, CarryForward: 5 },
    chartStatus: { Pending: 2, Draft: 4, Review: 2, ProviderReview: 1 },
  },
];

interface ChartStatus {
  Pending: number
  Draft: number
  Review: number
  ProviderReview: number
}

interface VersionData {
  id: string
  name: string
  date: string
  V24: {
    Suggested: number
    CarryForward: number
  }
  V28: {
    Suggested: number
    CarryForward: number
  }
  chartStatus: ChartStatus
}

export function TopPatientHccData() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const selectedPatientData = hccVersionData.find((p) => p.id === selectedPatient) || null;

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="p-1 px-2">
      <div className="rounded-md p-0.5 border shadow-sm">
        <div className="max-h-[350px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow className="bg-slate-50">
                <TableHead className="w-[120px] font-semibold">
                  <div className="flex items-center gap-2 text-black">
                    <Badge
                      variant="outline"
                      className={"px-3 border-none py-0.5 bg-gray-200 text-gray-900 border-sky-200 w-full"}
                    >
                      Provider
                    </Badge>
                  </div>
                </TableHead>

                <TableHead className="justify-center font-semibold flex items-center gap-2">
                  <div className="flex items-center gap-2 text-black">
                    <Badge
                      variant="outline"
                      className={"px-3 border-none py-0.5 bg-gray-200 text-gray-900 border-sky-200"}
                    >
                      Charts
                    </Badge>
                  </div>
                </TableHead>
                {/* <TableHead className="text-center font-semibold">
                  <div className="flex justify-center items-center gap-1">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      V24
                    </Badge>
                  </div>
                </TableHead> */}
                <TableHead className="text-center font-semibold">
                  <div className="flex justify-center items-center gap-1">
                    <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                      V28
                    </Badge>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hccVersionData.map((patient, index) => {
                // const v24Total = patient.V24.Suggested + patient.V24.CarryForward;
                const v28Total = patient.V28.Suggested + patient.V28.CarryForward;
                const totalCharts = Object.values(patient.chartStatus).reduce((sum, count) => sum + count, 0);
                const isExpanded = expandedRow === patient.id;

                return (
                  <React.Fragment key={patient.id}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className={`cursor-pointer ${isExpanded ? "bg-slate-50" : index % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                      onClick={() => toggleRow(patient.id)}
                    >
                      <TableCell className="py-1.5 font-medium min-w-[200px]">
                        <div className="flex items-center gap-1">
                          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </motion.div>
                          {patient.name}
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5 text-center font-medium">{totalCharts}</TableCell>
                      {/*  <TableCell className="py-1.5 text-center">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          {v24Total}
                        </Badge>
                      </TableCell> */}
                      <TableCell className="py-1.5 text-center">
                        <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                          {v28Total}
                        </Badge>
                      </TableCell>
                    </motion.tr>

                    {/* Expanded Row Content */}
                    {isExpanded && (
                      <motion.tr
                        key={`${patient.id}-expanded`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TableCell colSpan={7} className="p-0 border-b">
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="p-1 bg-slate-50/80 backdrop-blur-sm"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                              {/* HCC CODES Section */}
                              <motion.div
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                                className="p-1 duration-300 col-span-3"
                              >
                                <div className="flex items-center mb-2 justify-center gap-2 ">
                                  <Activity className="h-4 w-4 text-gray-700" />
                                  <h4 className="text-sm font-semibold text-gray-800">HCC CODES</h4>
                                </div>

                                <div className="gap-2 grid grid-cols-1">
                                  {/* V24 Section */}
                                  {/* <div className="">
                                    <div className="flex items-center gap-1.5 mb-2">
                                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                                      <div className="text-xs font-medium text-gray-700">V24</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                      <DetailBox
                                        label="Suggested"
                                        value={patient.V24?.Suggested ?? "N/A"}
                                        variant="green"
                                        icon={null}
                                      />
                                      <DetailBox
                                        label="Carry Forward"
                                        value={patient.V24?.CarryForward ?? "N/A"}
                                        variant="green2"
                                        icon={null}
                                      />
                                    </div>
                                  </div> */}

                                  {/* V28 Section */}
                                  <div>
                                    <div className="flex items-center gap-1.5 mb-2">
                                      <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                                      <div className="text-xs font-medium text-gray-700">V28</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                      <DetailBox
                                        label="Suggested"
                                        value={patient.V28?.Suggested ?? "N/A"}
                                        variant="sky"
                                        icon={null}
                                      />
                                      <DetailBox
                                        label="Carry Forward"
                                        value={patient.V28?.CarryForward ?? "N/A"}
                                        variant="sky2"
                                        icon={null}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </motion.div>

                              {/* Chart Status Section */}
                              <motion.div
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                                className="p-1 pt-2 jus mb-2 col-span-4 transition-shadow duration-300"
                              >
                                <div className="flex items-center justify-center gap-2 ">
                                  <FileText className="h-4 w-4 text-gray-700" />
                                  <h4 className="text-sm font-semibold text-gray-800">CHART STATUS</h4>
                                </div>

                                <div>
                                  <div className="flex items-center pt-1.5 gap-1.5 mb-2">
                                    <div className="text-xs font-medium text-gray-700">Status Details</div>
                                  </div>
                                  <div className="">
                                    <div className="grid grid-cols-4 gap-1">
                                      <DetailBox
                                        label="Pending"
                                        value={patient.chartStatus?.Pending ?? "N/A"}
                                        variant="yellow"
                                        icon={null}
                                      />
                                      <DetailBox
                                        label="Draft"
                                        value={patient.chartStatus?.Draft ?? "N/A"}
                                        variant="sky"
                                        icon={null}
                                      />
                                      <DetailBox
                                        label="Review"
                                        value={patient.chartStatus?.Review ?? "N/A"}
                                        variant="purple"
                                        icon={null}
                                      />
                                      <DetailBox
                                        label="Closed"
                                        value={patient.chartStatus?.ProviderReview ?? "N/A"}
                                        variant="emerald"
                                        icon={null}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          </motion.div>
                        </TableCell>
                      </motion.tr>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Patient Details Dialog */}
      {selectedPatientData && (
        <PatientDetailsDialog
          patient={selectedPatientData}
          open={!!selectedPatient}
          onOpenChange={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}

const detailBoxVariants = cva("p-2 rounded-md border transition-all duration-200 hover:shadow-sm", {
  variants: {
    variant: {
      default: "bg-white border-gray-200",
      red: "bg-red-50/70 border-red-100 hover:bg-red-50",
      blue: "bg-blue-50/70 border-blue-500 hover:bg-blue-50",
      yellow: "bg-yellow-50/70 border-yellow-500 hover:bg-yellow-50",
      sky: "bg-sky-100/70 border-sky-500 hover:bg-sky-50",
      sky2: "bg-sky-200/70 border-sky-700 hover:bg-sky-50",
      purple: "bg-purple-50/70 border-purple-500 hover:bg-purple-50",
      emerald: "bg-emerald-50/70 border-emerald-500 hover:bg-emerald-50",
      green: "bg-green-100/70 border-green-500 hover:bg-green-50",
      green2: "bg-green-200/70 border-green-700 hover:bg-green-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface DetailBoxProps extends VariantProps<typeof detailBoxVariants> {
  label: string
  value?: string | number | null
  icon?: React.ReactNode
}

export function DetailBox({ label, value, variant }: DetailBoxProps) {
  return (
    <div className={cn(detailBoxVariants({ variant }), "flex !p-1.5 justify-between rounded-[2px]")}>
      <div className="flex items-center gap-1.5 mb-1">
        <div className="text-[11px] font-medium text-gray-700">{label}</div>
      </div>
      <div className="text-sm font-semibold">{value ?? "N/A"}</div>
    </div>
  );
}

// Patient Details Dialog Component
function PatientDetailsDialog({
  patient,
  open,
  onOpenChange,
}: {
  patient: VersionData
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const v24Total = patient.V24.Suggested + patient.V24.CarryForward;
  const v28Total = patient.V28.Suggested + patient.V28.CarryForward;
  const totalDiff = v28Total - v24Total;
  const percentChange = v24Total > 0 ? Math.round((totalDiff / v24Total) * 100) : 0;

  // Calculate total charts
  const totalCharts = Object.values(patient.chartStatus).reduce((sum, count) => sum + count, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[500px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle>{patient.name} HCC Details</DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary">HCC Details</TabsTrigger>
                  <TabsTrigger value="charts">Chart Details</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Date</div>
                      <div className="font-medium">{new Date(patient.date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Difference</div>
                      <div className="flex items-center gap-2">
                        <motion.span
                          className="text-xl font-bold"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, type: "spring" }}
                        >
                          {totalDiff > 0 ? "+" : ""}
                          {totalDiff}
                        </motion.span>
                        <Badge
                          variant="outline"
                          className={`flex items-center gap-1 ${totalDiff > 0
                            ? "bg-green-50 text-green-700 border-green-200"
                            : totalDiff < 0
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                        >
                          {totalDiff > 0 ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : totalDiff < 0 ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          {percentChange}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          V24
                        </Badge>
                        <span className="text-lg font-bold">{v24Total}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">Suggested</div>
                          <div className="font-medium">{patient.V24.Suggested}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Carry Forward</div>
                          <div className="font-medium">{patient.V24.CarryForward}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                          V28
                        </Badge>
                        <span className="text-lg font-bold">{v28Total}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">Suggested</div>
                          <div className="font-medium">{patient.V28.Suggested}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Carry Forward</div>
                          <div className="font-medium">{patient.V28.CarryForward}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-sm font-medium">
                      <div>Category</div>
                      <div className="text-center">V24</div>
                      <div className="text-center">V28</div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center border-b pb-2">
                      <div className="text-sm">Suggested</div>
                      <div className="text-center">{patient.V24.Suggested}</div>
                      <div className="text-center flex items-center justify-center gap-1">
                        {patient.V28.Suggested}
                        {patient.V28.Suggested !== patient.V24.Suggested && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${patient.V28.Suggested > patient.V24.Suggested
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                              }`}
                          >
                            {patient.V28.Suggested > patient.V24.Suggested ? "+" : ""}
                            {patient.V28.Suggested - patient.V24.Suggested}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center border-b pb-2">
                      <div className="text-sm">Carry Forward</div>
                      <div className="text-center">{patient.V24.CarryForward}</div>
                      <div className="text-center flex items-center justify-center gap-1">
                        {patient.V28.CarryForward}
                        {patient.V28.CarryForward !== patient.V24.CarryForward && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${patient.V28.CarryForward > patient.V24.CarryForward
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                              }`}
                          >
                            {patient.V28.CarryForward > patient.V24.CarryForward ? "+" : ""}
                            {patient.V28.CarryForward - patient.V24.CarryForward}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center pt-1">
                      <div className="text-sm font-bold">Total</div>
                      <div className="text-center font-bold">{v24Total}</div>
                      <div className="text-center flex items-center justify-center gap-1 font-bold">
                        {v28Total}
                        {totalDiff !== 0 && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${totalDiff > 0
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                              }`}
                          >
                            {totalDiff > 0 ? "+" : ""}
                            {totalDiff}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="charts" className="py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Chart Status Overview</h3>
                      <Badge variant="outline" className="bg-gray-50">
                        Total: {totalCharts}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <ChartStatusItem
                        label="Pending"
                        count={patient.chartStatus.Pending}
                        total={totalCharts}
                        color="bg-yellow-400"
                      />

                      <ChartStatusItem
                        label="Draft"
                        count={patient.chartStatus.Draft}
                        total={totalCharts}
                        color="bg-blue-400"
                      />

                      <ChartStatusItem
                        label="Review"
                        count={patient.chartStatus.Review}
                        total={totalCharts}
                        color="bg-purple-400"
                      />

                      <ChartStatusItem
                        label="Provider Review"
                        count={patient.chartStatus.ProviderReview}
                        total={totalCharts}
                        color="bg-green-400"
                      />
                    </div>

                    <div className="pt-4 border-t mt-4">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Charts
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}

// Chart Status Item Component
function ChartStatusItem({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{count}</span>
          <Badge variant="outline" className="text-xs">
            {percentage}%
          </Badge>
        </div>
      </div>
      <Progress value={percentage} className={color} />
    </div>
  );
}
