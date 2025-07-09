"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConditionCommonCard } from "@/components/ui/condition-common-card"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/ui/dialog"
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import useToast from "@/hooks/use-toast"
import { AnimatePresence, motion } from "framer-motion"
import type React from "react"
import { useState } from "react"

const ICD_OPTIONS: SearchableSelectOption[] = [
    { label: "ICD:Z93.2", value: "Z93.2" },
    { label: "ICD:J44.9", value: "J44.9" },
    { label: "ICD:E11.9", value: "E11.9" },
    { label: "ICD:I10", value: "I10" },
]

const ICD_DATA = {
    "Z93.2": {
        hccCode: "463",
        V24HCC: "260",
        rxHccCode: "280",
        description:
            "Presence of an ileostomy, a surgically created opening in the abdominal wall for waste to exit the body after bowel removal.",
    },
    "J44.9": {
        hccCode: "111",
        rxHccCode: "202",
        V24HCC: "111",
        description:
            "Chronic obstructive pulmonary disease, unspecified, characterized by airflow limitation that is not fully reversible and worsens over time.",
    },
    "E11.9": {
        hccCode: "19",
        rxHccCode: "0",
        V24HCC: "159",
        description:
            "Type 2 diabetes mellitus without complications, a chronic condition affecting the way the body processes blood sugar (glucose).",
    },
    I10: {
        hccCode: "21",
        rxHccCode: "0",
        V24HCC: "166",
        description:
            "Essential (primary) hypertension, a condition in which the force of the blood against artery walls is consistently too high.",
    },
}

export interface UpdateIcdCodeModalProps {
    open: boolean
    onClose: () => void
    item: { icdCode?: string; id?: string } | null
    onUpdateIcdLoading?: (id: string) => void
}

export const UpdateIcdCodeModal: React.FC<UpdateIcdCodeModalProps> = ({ open, onClose, item, onUpdateIcdLoading }) => {
    const [selectedIcd, setSelectedIcd] = useState<string>("")
    const { success } = useToast()

    const reset = () => {
        setSelectedIcd("")
        onClose()
    }

    const handleUpdateIcd = async () => {
        if (!selectedIcd) return

        if (onUpdateIcdLoading && item?.id) {
            onUpdateIcdLoading(item.id)
        }

        onClose()

        const bodyData = {
            oldIcd: item?.icdCode,
            newIcd: selectedIcd,
            ...ICD_DATA[selectedIcd as keyof typeof ICD_DATA],
        }

        await new Promise((resolve) => setTimeout(resolve, 3000))
        success({ message: "ICD updated successfully!" })
        reset()
    }

    return (
        <AnimatePresence>
            {open && (
                <Dialog open={open} onOpenChange={reset}>
                    <DialogContent className="max-w-3xl pt-4">
                        <motion.div>
                            <DialogHeader>
                                <div className="flex pb-2 flex-col items-center justify-center w-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl font-extrabold text-selectedText tracking-tight">
                                            Suggest Alternate ICD Code
                                        </span>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4 mt-2">
                                <div className="w-full gap-3 items-start flex">
                                    <div className="flex whitespace-nowrap items-center gap-2 mb-2 pt-[4.5px]">
                                        <span className="text-sm font-semibold text-gray-700">Current ICD Code:</span>
                                        {item?.icdCode ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge
                                                        variant="outline"
                                                        className={`font-mono px-1.5 text-xs ${item?.icdCode?.includes("$") ? " text-yellow-700 border-yellow-200 bg-yellow-100" : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"}`}
                                                    >
                                                        ICD:{item?.icdCode?.replace("$", "")}
                                                    </Badge>
                                                </TooltipTrigger>
                                            </Tooltip>
                                        ) : <span className="text-base text-gray-900 font-mono px-2">{item?.icdCode || "-"}</span>}

                                    </div>

                                    <div className="w-full flex gap-1 items-center">
                                        <div className="text-sm whitespace-nowrap font-semibold text-gray-700">Suggested ICD Code:</div>
                                        <SearchableSelect
                                            options={ICD_OPTIONS}
                                            value={selectedIcd}
                                            onValueChange={setSelectedIcd}
                                            placeholder="Select ICD code..."
                                            searchPlaceholder="Search ICD codes..."
                                            className="mt-0.5"
                                        />
                                    </div>
                                </div>

                                {selectedIcd && ICD_DATA[selectedIcd as keyof typeof ICD_DATA] && (
                                    <ConditionCommonCard
                                        V24HCC={ICD_DATA[selectedIcd as keyof typeof ICD_DATA].V24HCC}
                                        icdCode={selectedIcd}
                                        hccCode={ICD_DATA[selectedIcd as keyof typeof ICD_DATA].hccCode}
                                        hccV28Code={ICD_DATA[selectedIcd as keyof typeof ICD_DATA].hccCode}
                                        description={ICD_DATA[selectedIcd as keyof typeof ICD_DATA].description || "-"}
                                        diagnosis=""
                                        evidence=""
                                        query={undefined}
                                        status={undefined}
                                        expanded={true}
                                    />
                                )}
                            </div>

                            <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
                                <Button variant="outline" onClick={reset} className="!rounded-none">
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdateIcd} disabled={!selectedIcd} className="!rounded-none">
                                    Update
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    )
}
