import { TableHead } from "@/components/ui/table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, type Header } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import { motion } from "framer-motion";

interface SortableHeaderProps<TData, TValue> {
    header: Header<TData, TValue>
}

export function SortableHeader<TData, TValue>({ header }: SortableHeaderProps<TData, TValue>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isDragable = (header.column.columnDef as any).isDragable !== false;

    const {
        attributes,
        listeners,
        transform,
        transition,
        setNodeRef,
        isDragging,
    } = useSortable({
        id: header.id,
        disabled: !isDragable
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        position: "relative" as const,
        zIndex: isDragging ? 999 : "auto",
        touchAction: "none",
        opacity: isDragging ? 0.8 : 1,
    };


    return (
        <TableHead
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`
                bg-tabBg text-selectedText
                relative transition-colors group cursor-default select-none
                ${isDragging ? "shadow-lg" : ""}
              `}
        >
            <motion.div className={`flex items-center justify-between gap-2 ${header.getContext()?.header.index === 0 ? "" : ""} cursor-pointer focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary`}
                initial={{ scale: 1 }}
                animate={{
                    scale: isDragging ? 1.05 : 1,
                }}
                style={{
                    shadow: isDragging ? "0 5px 15px rgba(0,0,0,0.1)" : "none",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {isDragging ? (
                    <div className="capitalize !bg-selectedText text-tabBg w-full text-center font-medium max-h-[40px]">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                ) : (
                    <div className="flex relative w-full text-[1rem] font-semibold text-center !text-selectedText ">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        {isDragable && !isDragging && (
                            <div className="absolute right-0 h-full flex items-center">
                                <motion.button
                                    {...listeners}
                                    className="opacity-0 text-selectedText group-hover:opacity-100 transition-opacity touch-none hover:bg-transparent dark:hover:bg-gray-800 p-1 rounded-full"
                                    title="Drag to reorder column"
                                    whileHover={{ scale: 1.1, x: 4 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <GripVertical className="h-4 w-4" />
                                </motion.button>
                            </div>
                        )}
                    </div>
                )}

            </motion.div>
        </TableHead>
    );
}