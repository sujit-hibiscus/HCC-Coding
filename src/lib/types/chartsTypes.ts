export enum ChartTab {
    Pending = "pending",
    Assigned = "assigned",
    Audit = "audit",
    Completed = "completed",
}

export enum USERTYPES {
    SUPERADMIN = "Super Admin",
    ADMIN = "Admin",
    AUDITOR = "Auditor",
    ANALYST = "Analyst",
}

export const targetTabs = ["pending", "assigned", "audit", "completed", "document"];

type ProfileType = "Analyst" | "Provider"

export interface UserTypes {
    id: number
    Fname: string
    Lname: string
    email: string
    password: string
    profile_type: ProfileType | number | string
    target?: {
        dailyChartTarget?: number
        maxAssignments?: number
    }
}