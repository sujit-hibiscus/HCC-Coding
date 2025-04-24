
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { USERTYPES } from "@/lib/types/ProfileTypes";

interface StatusBadgeProps {
    status: USERTYPES;
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
