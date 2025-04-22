import { USERTYPES } from "@/lib/types/PrevisitTypes";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

interface StatusBadgeProps {
    status: USERTYPES;
}

// Use a flexible Record<string, ...> to avoid enum restriction issues
const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    [USERTYPES.ANALYST]: {
        color: "bg-orange-100 text-orange-700 hover:bg-orange-100",
        icon: "",
    },
    [USERTYPES.ADMIN]: {
        color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-100",
        icon: "",
    },
    [USERTYPES.AUDITOR]: {
        color: "bg-green-100 text-green-700 hover:bg-green-100",
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
