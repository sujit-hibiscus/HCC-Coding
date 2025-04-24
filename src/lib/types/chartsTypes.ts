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

export const analystsData = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Michael Johnson" },
]

export const auditorsData = [
    { id: "1", name: "Sarah Wilson" },
    { id: "2", name: "Robert Brown" },
    { id: "3", name: "Emily Davis" },
]
