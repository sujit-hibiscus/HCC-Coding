
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { USERTYPES } from "@/lib/types/ProfileTypes";
import { DOCUMENT_STATUS } from "@/store/slices/table-document-slice";

interface StatusBadgeProps {
    status: USERTYPES | DOCUMENT_STATUS;
}

// Use a flexible Record<string, ...> to avoid enum restriction issues
const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    [USERTYPES.ANALYST]: {
        color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        icon: "",
    },
    [USERTYPES.ADMIN]: {
        color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        icon: "",
    },
    [USERTYPES.AUDITOR]: {
        color: "bg-green-100 text-green-800 hover:bg-green-200",
        icon: "",
    },
    [USERTYPES.SUPERADMIN]: {
        color: "bg-selectedText text-white hover:bg-selectedText/80",
        icon: "",
    },
    [DOCUMENT_STATUS.PENDING]: {
        color: "bg-yellow-500 text-white hover:bg-yellow-600",
        icon: ""
    },
    [DOCUMENT_STATUS.ON_HOLD]: {
        color: "bg-red-400 hover:text-white text-black border-red-700 hover:bg-red-700",
        icon: ""
    },
    [DOCUMENT_STATUS.IN_PROGRESS]: {
        color: "bg-yellow-300 text-black border-yellow-500 hover:bg-yellow-400",
        icon: ""
    },
    [DOCUMENT_STATUS.ERROR]: {
        color: "bg-red-500 text-white hover:bg-red-600",
        icon: ""
    },
    [DOCUMENT_STATUS.COMPLETED]: {
        color: "bg-green-300 border-green-700 text-black hover:bg-green-500",
        icon: ""
    },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status] || { color: "bg-gray-200 text-gray-800", icon: "" };

    return (
        <Badge
            variant="outline"
            className={cn(
                "flex items-center max-w-[9.37rem] gap-1 rounded-none px-2 py-1 font-medium",
                config.color
            )}
        >
            <span className="text-[0.5rem]">{config.icon}</span>
            {status}
        </Badge>
    );
}
