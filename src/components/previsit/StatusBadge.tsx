import { CODINGAPPROVEDSTATUS, CODINGREVIEWSTATUS, DRAFTSTATUS, PENDINGSTATUS, PROGRESSNOTESTATUS, REVIEWSTATUS, USERTYPES } from "@/lib/types/PrevisitTypes";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

interface StatusBadgeProps {
    status: PENDINGSTATUS | DRAFTSTATUS | REVIEWSTATUS | PROGRESSNOTESTATUS | CODINGREVIEWSTATUS | CODINGAPPROVEDSTATUS | USERTYPES;
}

// Use a flexible Record<string, ...> to avoid enum restriction issues
const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    [PENDINGSTATUS.PENDINGSTATUSSTATUS]: {
        color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
        icon: "",
    },
    [PENDINGSTATUS.DOCRETRIEVAL]: {
        color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
        icon: "",
    },
    [PENDINGSTATUS.ERROR]: {
        color: "bg-red-100 text-red-700 hover:bg-red-100",
        icon: "",
    },
    [DRAFTSTATUS.QUEUE]: {
        color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
        icon: "",
    },
    [DRAFTSTATUS.PROCESSING]: {
        color: "bg-orange-100 text-orange-700 hover:bg-orange-100",
        icon: "",
    },
    [REVIEWSTATUS.RFR]: {
        color: "bg-blue-100 text-blue-700 hover:bg-blue-100",
        icon: "",
    },
    [REVIEWSTATUS.INPROGRESS]: {
        color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
        icon: "",
    },
    [REVIEWSTATUS.HOLD]: {
        color: "bg-gray-100 text-gray-700 hover:bg-gray-100",
        icon: "",
    },
    [REVIEWSTATUS.ADDITIONAL]: {
        color: "bg-teal-100 text-teal-700 hover:bg-teal-100",
        icon: "",
    },
    [REVIEWSTATUS.DOCUMENT]: {
        color: "bg-orange-100 text-orange-700 hover:bg-orange-100",
        icon: "",
    },
    [PROGRESSNOTESTATUS.ACTIVE]: {
        color: "bg-green-100 text-green-700 hover:bg-green-100",
        icon: "",
    },
    [PROGRESSNOTESTATUS.UNASSIGNED]: {
        color: "bg-orange-100 text-orange-700 hover:bg-orange-100",
        icon: "",
    },
    [CODINGAPPROVEDSTATUS.CREATED]: {
        color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
        icon: "",
    },
    [USERTYPES.ANALYST]: {
        color: "bg-orange-100 text-orange-700 hover:bg-orange-100",
        icon: "",
    },
    [USERTYPES.PROVIDER]: {
        color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
        icon: "",
    }
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
