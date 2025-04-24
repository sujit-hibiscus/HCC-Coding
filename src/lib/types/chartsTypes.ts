export enum ChartTab {
    Pending = "pending",
    Assigned = "assigned",
    Audit = "audit",
}

export enum USERTYPES {
    SUPERADMIN = "Super Admin",
    ADMIN = "Admin",
    AUDITOR = "Auditor",
    ANALYST = "Analyst",
}

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
