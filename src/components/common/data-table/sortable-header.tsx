import { TableHead } from "@/components/ui/table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, type Header } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";

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
        zIndex: isDragging ? 1 : "auto",
        touchAction: "none",
    };


    return (
        <TableHead
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`
            bg-tabBg text-selectedText
            relative transition-colors group cursor-default select-none`}
        >
            <div className={`flex items-center justify-between gap-2 ${header.getContext()?.header.index === 0 ? "" : ""} cursor-pointer focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary`}>
                {isDragging ? <div className="capitalize">{header.getContext()?.header?.id}</div> : <div className="flex relative w-full text-[1rem] font-semibold text-center !text-selectedText">
                    {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    {isDragable && (
                        !isDragging && <div className="absolute right-0 h-full flex items-center">
                            <button
                                {...listeners}
                                className="opacity-0 text-selectedText  group-hover:opacity-100 transition-opacity touch-none"
                                title="Drag to reorder column"
                            >
                                <GripVertical className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>}

            </div>
        </TableHead>
    );
}