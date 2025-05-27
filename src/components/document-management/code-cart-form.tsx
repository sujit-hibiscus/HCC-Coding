"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useRedux } from "@/hooks/use-redux"
import { updateCodeCart, addCartItem } from "@/store/slices/documentManagementSlice"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle, Loader2, Trash2, Plus, Search, Check, ChevronsUpDown } from "lucide-react"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface CodeCartItem {
    code: string
    description: string
}

interface CodeCart {
    items: CodeCartItem[]
    notes: string
    searchTerm: string
}

interface Document {
    id: string
    status: string
}

interface DeleteConfirmation {
    isOpen: boolean
    index: number
    type: "static" | "dynamic"
}

interface CodeCartFormProps {
    selectedDocumentId: string | null
    currentCodeCart: CodeCart
    staticCartItems: CodeCartItem[]
    selectedDocument: Document
    showSidebar: boolean
    isCompletingReview: boolean
    onComplete: () => void
    onRemoveCartItem: (index: number) => void
    onRemoveStaticItem: (index: number) => void
    deleteConfirmation: DeleteConfirmation | null
    setDeleteConfirmation: (confirmation: DeleteConfirmation | null) => void
}

export default function CodeCartForm({
    selectedDocumentId,
    currentCodeCart,
    staticCartItems,
    selectedDocument,
    showSidebar,
    isCompletingReview,
    onComplete,
    onRemoveCartItem,
    onRemoveStaticItem,
    deleteConfirmation,
    setDeleteConfirmation,
}: CodeCartFormProps) {
    const { dispatch } = useRedux()
    const [open, setOpen] = useState(false)
    const [selectedCode, setSelectedCode] = useState<CodeCartItem | null>(null)

    // Mock available codes for search - in real app this would come from an API
    const availableCodes = useMemo(
        () => [
            { code: "A00.0", description: "Cholera due to Vibrio cholerae 01, biovar cholerae" },
            { code: "A00.1", description: "Cholera due to Vibrio cholerae 01, biovar eltor" },
            { code: "A00.9", description: "Cholera, unspecified" },
            { code: "A01.0", description: "Typhoid fever" },
            { code: "A01.1", description: "Paratyphoid fever A" },
            { code: "A01.2", description: "Paratyphoid fever B" },
            { code: "A01.3", description: "Paratyphoid fever C" },
            { code: "A01.4", description: "Paratyphoid fever, unspecified" },
            { code: "B00.0", description: "Eczema herpeticum" },
            { code: "B00.1", description: "Herpesviral vesicular dermatitis" },
            { code: "B00.2", description: "Herpesviral gingivostomatitis and pharyngotonsillitis" },
            { code: "C00.0", description: "Malignant neoplasm of external upper lip" },
            { code: "C00.1", description: "Malignant neoplasm of external lower lip" },
            { code: "D00.0", description: "Carcinoma in situ of lip, oral cavity and pharynx" },
            { code: "E10.0", description: "Type 1 diabetes mellitus with hyperosmolarity" },
            { code: "E10.1", description: "Type 1 diabetes mellitus with ketoacidosis" },
            { code: "F10.0", description: "Alcohol use disorders" },
            { code: "G00.0", description: "Haemophilus meningitis" },
            { code: "H00.0", description: "Hordeolum and other deep inflammation of eyelid" },
            { code: "I00", description: "Rheumatic fever without heart involvement" },
            { code: "J00", description: "Acute nasopharyngitis [common cold]" },
            { code: "K00.0", description: "Anodontia" },
            { code: "L00", description: "Staphylococcal scalded skin syndrome" },
            { code: "M00.0", description: "Staphylococcal arthritis and polyarthritis" },
            { code: "N00.0", description: "Acute nephritic syndrome with minor glomerular abnormality" },
            { code: "O00.0", description: "Abdominal pregnancy" },
            { code: "P00.0", description: "Newborn affected by maternal hypertensive disorders" },
            { code: "Q00.0", description: "Anencephaly" },
            { code: "R00.0", description: "Tachycardia, unspecified" },
            { code: "S00.0", description: "Superficial injury of scalp" },
            { code: "T00", description: "Superficial injuries involving multiple body regions" },
            { code: "V00.0", description: "Pedestrian on foot injured in collision with roller-skater" },
            { code: "W00", description: "Fall due to ice and snow" },
            { code: "X00", description: "Exposure to uncontrolled fire in building or structure" },
            { code: "Y00", description: "Assault by blunt object" },
            { code: "Z00.0", description: "General adult medical examination" },
        ],
        [],
    )

    // Filter static items based on search term (for display in table)
    const filteredStaticItems = staticCartItems.filter(
        (item) =>
            item.code.toLowerCase().includes(currentCodeCart.searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(currentCodeCart.searchTerm.toLowerCase()),
    )

    const filteredDynamicItems = currentCodeCart.items.filter(
        (item) =>
            item.code.toLowerCase().includes(currentCodeCart.searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(currentCodeCart.searchTerm.toLowerCase()),
    )

    const handleSearchChange = (value: string) => {
        if (selectedDocumentId) {
            dispatch(
                updateCodeCart({
                    documentId: selectedDocumentId,
                    cartData: { searchTerm: value },
                }),
            )
        }
    }

    const handleAddCode = (item: CodeCartItem) => {
        if (selectedDocumentId) {
            // Check if item already exists in cart
            const existsInCart = currentCodeCart.items.some((cartItem) => cartItem.code === item.code)
            const existsInStatic = staticCartItems.some((staticItem) => staticItem.code === item.code)

            if (!existsInCart && !existsInStatic) {
                dispatch(addCartItem({ documentId: selectedDocumentId, item }))
            }

            // Clear search and hide results
            setSelectedCode(null)
            setOpen(false)
            dispatch(
                updateCodeCart({
                    documentId: selectedDocumentId,
                    cartData: { searchTerm: "" },
                }),
            )
        }
    }

    return (
        <motion.div
            className="w-full flex flex-col md:w-[32rem] h-full border-t md:border-t-0 md:border-l overflow-y-auto bg-white p-2"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8,
                velocity: 2,
            }}
        >
            <h3 className="text-lg font-semibold mb-4">Code Cart</h3>

            <div className="flex flex-col justify-between h-full">
                <div className="flex flex-col h-full">
                    {/* Searchable Select with Combobox */}
                    <div className="mb-2">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between text-sm h-8"
                                >
                                    <div className="flex items-center">
                                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                        {selectedCode ? (
                                            <span className="truncate">
                                                {selectedCode.code} - {selectedCode.description}
                                            </span>
                                        ) : (
                                            "Search DX code..."
                                        )}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder="Search DX code..."
                                        value={currentCodeCart.searchTerm}
                                        onValueChange={handleSearchChange}
                                    />
                                    <CommandList>
                                        <CommandEmpty>No codes found.</CommandEmpty>
                                        <CommandGroup>
                                            {availableCodes
                                                .filter(
                                                    (item) =>
                                                        item.code.toLowerCase().includes(currentCodeCart.searchTerm.toLowerCase()) ||
                                                        item.description.toLowerCase().includes(currentCodeCart.searchTerm.toLowerCase()),
                                                )
                                                .slice(0, 10)
                                                .map((item) => {
                                                    const existsInCart = currentCodeCart.items.some((cartItem) => cartItem.code === item.code)
                                                    const existsInStatic = staticCartItems.some((staticItem) => staticItem.code === item.code)
                                                    const isDisabled = existsInCart || existsInStatic

                                                    return (
                                                        <CommandItem
                                                            key={item.code}
                                                            value={`${item.code} ${item.description}`}
                                                            onSelect={() => {
                                                                if (!isDisabled) {
                                                                    handleAddCode(item)
                                                                }
                                                            }}
                                                            disabled={isDisabled}
                                                            className={cn(
                                                                "flex items-center justify-between",
                                                                isDisabled && "opacity-50 cursor-not-allowed",
                                                            )}
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium text-sm">{item.code}</div>
                                                                <div className="text-xs  truncate">{item.description}</div>
                                                            </div>
                                                            {isDisabled ? (
                                                                <Check className="ml-2 h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <Plus className="ml-2 h-4 w-4" />
                                                            )}
                                                        </CommandItem>
                                                    )
                                                })}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Search Filter Input */}
                    <div className="mb-3">
                        <Input
                            placeholder="Filter cart items..."
                            value={currentCodeCart.searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="text-sm"
                        />
                    </div>

                    {/* Table */}
                    <div className="flex-1 border border-gray-300 rounded mb-3">
                        <div className="bg-selectedText text-white text-sm font-medium">
                            <div className="grid grid-cols-12 gap-2 p-2">
                                <div className="col-span-4">ICD-CMS-10</div>
                                <div className="col-span-7">Description</div>
                                <div className="col-span-1"></div>
                            </div>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {/* Show filtered static items first */}
                            {filteredStaticItems.map((item, index) => (
                                <div key={`static-${index}`} className="grid grid-cols-12 gap-2 p-2 border-b border-gray-200 text-sm">
                                    <div className="col-span-4 font-medium">{item.code}</div>
                                    <div className="col-span-7">{item.description}</div>
                                    <div className="col-span-1">
                                        <button
                                            onClick={() => setDeleteConfirmation({ isOpen: true, index, type: "static" })}
                                            className="text-red-500 hover:text-red-700"
                                            aria-label="Delete item"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {/* Then show filtered dynamic items from the cart */}
                            {filteredDynamicItems.map((item, index) => (
                                <div key={`dynamic-${index}`} className="grid grid-cols-12 gap-2 p-2 border-b border-gray-200 text-sm">
                                    <div className="col-span-4 font-medium">{item.code}</div>
                                    <div className="col-span-7">{item.description}</div>
                                    <div className="col-span-1">
                                        <button
                                            onClick={() => setDeleteConfirmation({ isOpen: true, index, type: "dynamic" })}
                                            className="text-red-500 hover:text-red-700"
                                            aria-label="Delete item"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Show message when no items match the filter */}
                            {filteredStaticItems.length === 0 && filteredDynamicItems.length === 0 && currentCodeCart.searchTerm && (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="text-gray-400 mb-2">
                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">No items found</p>
                                </div>
                            )}

                            {/* Show message when there are no items at all */}
                            {filteredStaticItems.length === 0 && filteredDynamicItems.length === 0 && !currentCodeCart.searchTerm && (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="text-gray-400 mb-2">
                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">No items in cart</p>
                                    <p className="text-xs text-gray-400 mt-1">Add some codes to get started</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-4">
                        <Label className="text-sm font-medium mb-2 block">Notes</Label>
                        <Textarea
                            placeholder="Enter notes..."
                            value={currentCodeCart.notes}
                            onChange={(e) => {
                                if (selectedDocumentId) {
                                    dispatch(
                                        updateCodeCart({
                                            documentId: selectedDocumentId,
                                            cartData: { notes: e.target.value },
                                        }),
                                    )
                                }
                            }}
                            rows={4}
                            className="text-sm max-h-[100px]"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    {selectedDocument.status !== "completed" && !showSidebar && (
                        <Button onClick={onComplete} disabled={isCompletingReview} className="text-white">
                            {isCompletingReview ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            {isCompletingReview ? "Submitting..." : "Submit"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirmation?.isOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteConfirmation(null)}
                        />

                        {/* Modal */}
                        <motion.div
                            className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{
                                duration: 0.2,
                                ease: "easeOut",
                            }}
                        >
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900">Confirm Delete</h4>
                                </div>

                                <p className="text-sm text-gray-600">
                                    Are you sure you want to delete this item? This action cannot be undone.
                                </p>

                                <div className="flex justify-end space-x-3 pt-2">
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant="outline" size="sm" onClick={() => setDeleteConfirmation(null)} className="px-4">
                                            Cancel
                                        </Button>
                                    </motion.div>

                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                if (deleteConfirmation.type === "static") {
                                                    onRemoveStaticItem(deleteConfirmation.index)
                                                } else {
                                                    onRemoveCartItem(deleteConfirmation.index)
                                                }
                                                setDeleteConfirmation(null)
                                            }}
                                            className="px-4"
                                        >
                                            Delete
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
