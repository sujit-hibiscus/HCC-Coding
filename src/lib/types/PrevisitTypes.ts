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

export enum PrevisitTab {
    Pending = "pending",
    Draft = "draft",
    Review = "review",
    ProviderReview = "provider-review"
}


export enum USERTYPES {
    SUPERADMIN = "Super Admin",
    ADMIN = "Admin",
    AUDITOR = "Auditor",
    ANALYST = "Analyst",
}

export enum CODINGREVIEWSTATUS {
    RFR = "RFR",
    ACTIVE = "Active"
}

export enum ChartTypeEnum {
    PROVIDER_REVIEW = "provider-review",
    REVIEW = "review",
    MANUAL = "manual",
    POSTREVIEW = "postReview",
    CODINGREVIEW = "codingReview",
}


export interface MemberProfile {
    id: string
    fname: string
    lname: string
    insurance1: string
    subscriberId1: string
    insurance2?: string
    subscriberId2?: string
    pcpId?: number
    dob?: string
    address: string
    city: string
    state: string
    zip: string
    createdOn: string
    updatedOn: string
}

export interface Reference {
    id: string
    title: string
    type: string
    dated: string
    pdfUrl: string
}

export interface HCCEntry {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code: any
    id: string
    condition: string
    isExpanded: boolean
    references: Reference[]
    note?: string
    status: "pending" | "accepted" | "rejected"
    pNote?: string
}


/* coding review*/
export type CodingReviewTypes = {
    chartId: string;
    firstName: string;
    lastName: string;
    dos: string; // Date of Service
    pcp: string; // Primary Care Physician
    facility: string;
    insurance: string;
    DXCodes: number;
    CPTCodes: number;
    status: CODINGREVIEWSTATUS
};
export const codingReviewData: CodingReviewTypes[] = [
    {
        chartId: "CH001",
        firstName: "John",
        lastName: "Doe",
        dos: "02-20-2024",
        pcp: "Dr. Smith",
        facility: "City Hospital",
        insurance: "Blue Cross",
        DXCodes: 5,
        CPTCodes: 3,
        status: CODINGREVIEWSTATUS.RFR,
    },
    {
        chartId: "CH002",
        firstName: "Jane",
        lastName: "Doe",
        dos: "02-21-2024",
        pcp: "Dr. Brown",
        facility: "General Clinic",
        insurance: "United Healthcare",
        DXCodes: 4,
        CPTCodes: 2,
        status: CODINGREVIEWSTATUS.ACTIVE,
    },
    {
        chartId: "CH003",
        firstName: "Alice",
        lastName: "Johnson",
        dos: "02-22-2024",
        pcp: "Dr. Taylor",
        facility: "Downtown Medical",
        insurance: "Aetna",
        DXCodes: 6,
        CPTCodes: 4,
        status: CODINGREVIEWSTATUS.RFR,
    },
    {
        chartId: "CH004",
        firstName: "Bob",
        lastName: "Williams",
        dos: "02-23-2024",
        pcp: "Dr. White",
        facility: "City Hospital",
        insurance: "Cigna",
        DXCodes: 3,
        CPTCodes: 5,
        status: CODINGREVIEWSTATUS.ACTIVE,
    },
    {
        chartId: "CH005",
        firstName: "Emily",
        lastName: "Davis",
        dos: "02-24-2024",
        pcp: "Dr. Adams",
        facility: "General Clinic",
        insurance: "Medicare",
        DXCodes: 5,
        CPTCodes: 3,
        status: CODINGREVIEWSTATUS.RFR,
    },
    {
        chartId: "CH006",
        firstName: "Michael",
        lastName: "Miller",
        dos: "02-25-2024",
        pcp: "Dr. Green",
        facility: "Downtown Medical",
        insurance: "Medicaid",
        DXCodes: 4,
        CPTCodes: 2,
        status: CODINGREVIEWSTATUS.ACTIVE,
    },
    {
        chartId: "CH007",
        firstName: "Sarah",
        lastName: "Wilson",
        dos: "02-26-2024",
        pcp: "Dr. Hall",
        facility: "City Hospital",
        insurance: "Aetna",
        DXCodes: 6,
        CPTCodes: 4,
        status: CODINGREVIEWSTATUS.RFR,
    },
    {
        chartId: "CH008",
        firstName: "David",
        lastName: "Martinez",
        dos: "02-27-2024",
        pcp: "Dr. Lopez",
        facility: "General Clinic",
        insurance: "Cigna",
        DXCodes: 3,
        CPTCodes: 5,
        status: CODINGREVIEWSTATUS.ACTIVE,
    },
    {
        chartId: "CH009",
        firstName: "Laura",
        lastName: "Anderson",
        dos: "02-28-2024",
        pcp: "Dr. Scott",
        facility: "Downtown Medical",
        insurance: "Blue Cross",
        DXCodes: 5,
        CPTCodes: 3,
        status: CODINGREVIEWSTATUS.RFR,
    },
    {
        chartId: "CH010",
        firstName: "James",
        lastName: "Thomas",
        dos: "02-29-2024",
        pcp: "Dr. Baker",
        facility: "City Hospital",
        insurance: "United Healthcare",
        DXCodes: 4,
        CPTCodes: 2,
        status: CODINGREVIEWSTATUS.ACTIVE,
    },
    {
        chartId: "CHART016",
        firstName: "Emma",
        lastName: "Clark",
        dos: "02-16-2024",
        pcp: "Dr. Daniel Robinson",
        facility: "UCLA Medical Center",
        insurance: "Cigna",
        DXCodes: 2,
        CPTCodes: 4,
        status: CODINGREVIEWSTATUS.RFR,
    },
    {
        chartId: "CHART017",
        firstName: "Mason",
        lastName: "Lewis",
        dos: "02-17-2024",
        pcp: "Dr. Kimberly Adams",
        facility: "Mount Sinai Hospital",
        insurance: "Aetna",
        DXCodes: 3,
        CPTCodes: 2,
        status: CODINGREVIEWSTATUS.ACTIVE,
    },
    {
        chartId: "CHART018",
        firstName: "Lucas",
        lastName: "Walker",
        dos: "02-18-2024",
        pcp: "Dr. Brian Carter",
        facility: "Stanford Health Care",
        insurance: "Medicaid",
        DXCodes: 5,
        CPTCodes: 3,
        status: CODINGREVIEWSTATUS.RFR,
    },
    {
        chartId: "CHART019",
        firstName: "Charlotte",
        lastName: "Hall",
        dos: "02-19-2024",
        pcp: "Dr. Victoria King",
        facility: "NewYork-Presbyterian Hospital",
        insurance: "Humana",
        DXCodes: 4,
        CPTCodes: 5,
        status: CODINGREVIEWSTATUS.ACTIVE,
    },
    {
        chartId: "CHART020",
        firstName: "Ethan",
        lastName: "Allen",
        dos: "02-20-2024",
        pcp: "Dr. Henry Wright",
        facility: "Mayo Clinic",
        insurance: "UnitedHealthcare",
        DXCodes: 2,
        CPTCodes: 1,
        status: CODINGREVIEWSTATUS.RFR,
    },
    {
        chartId: "CHART021",
        firstName: "Amelia",
        lastName: "Young",
        dos: "02-21-2024",
        pcp: "Dr. Olivia Green",
        facility: "Massachusetts General Hospital",
        insurance: "Blue Cross Blue Shield",
        DXCodes: 6,
        CPTCodes: 3,
        status: CODINGREVIEWSTATUS.ACTIVE,
    },
    {
        chartId: "CHART022",
        firstName: "Benjamin",
        lastName: "King",
        dos: "02-22-2024",
        pcp: "Dr. William Scott",
        facility: "Cedars-Sinai Medical Center",
        insurance: "Medicare",
        DXCodes: 3,
        CPTCodes: 2,
        status: CODINGREVIEWSTATUS.RFR,
    },
    {
        chartId: "CHART023",
        firstName: "Harper",
        lastName: "Wright",
        dos: "02-23-2024",
        pcp: "Dr. Alexander Moore",
        facility: "Cleveland Clinic",
        insurance: "Anthem",
        DXCodes: 4,
        CPTCodes: 5,
        status: CODINGREVIEWSTATUS.ACTIVE,
    },
    {
        chartId: "CHART024",
        firstName: "Daniel",
        lastName: "Scott",
        dos: "02-24-2024",
        pcp: "Dr. Emily Turner",
        facility: "Johns Hopkins Hospital",
        insurance: "Kaiser Permanente",
        DXCodes: 5,
        CPTCodes: 3,
        status: CODINGREVIEWSTATUS.RFR,
    },
    {
        chartId: "CHART025",
        firstName: "Ella",
        lastName: "Torres",
        dos: "02-25-2024",
        pcp: "Dr. Joshua Thomas",
        facility: "NewYork-Presbyterian Hospital",
        insurance: "Cigna",
        DXCodes: 2,
        CPTCodes: 1,
        status: CODINGREVIEWSTATUS.ACTIVE,
    },

];

/* Pending Data */
export type ProviderType = {
    chartId: string;
    dos: string; // Date of Service
    pcp: string; // Primary Care Physician
    facility: string;
    insurance: string;
    newSugg: number;
    carryForward: number;
};

export const ProviderData: ProviderType[] = [
    {
        chartId: "CHT001",
        dos: "02-01-2024",
        pcp: "Dr. John Doe",
        facility: "General Hospital",
        insurance: "HealthCare Plus",
        newSugg: 5,
        carryForward: 2,
    },
    {
        chartId: "CHT002",
        dos: "02-02-2024",
        pcp: "Dr. Jane Smith",
        facility: "City Medical Center",
        insurance: "MediSecure",
        newSugg: 3,
        carryForward: 1,
    },
    {
        chartId: "CHT003",
        dos: "02-03-2024",
        pcp: "Dr. Emily Johnson",
        facility: "Sunrise Clinic",
        insurance: "WellnessCare",
        newSugg: 4,
        carryForward: 0,
    },
    {
        chartId: "CHT004",
        dos: "02-04-2024",
        pcp: "Dr. Michael Brown",
        facility: "Downtown Health",
        insurance: "SafeHealth",
        newSugg: 2,
        carryForward: 3,
    },
    {
        chartId: "CHT005",
        dos: "02-05-2024",
        pcp: "Dr. Olivia Wilson",
        facility: "Metro Hospital",
        insurance: "PrimeCare",
        newSugg: 6,
        carryForward: 2,
    },
    {
        chartId: "CHT006",
        dos: "02-06-2024",
        pcp: "Dr. William Davis",
        facility: "Northside Clinic",
        insurance: "LifeShield",
        newSugg: 3,
        carryForward: 4,
    },
    {
        chartId: "CHT007",
        dos: "02-07-2024",
        pcp: "Dr. Sophia Martinez",
        facility: "Eastview Health",
        insurance: "CareFirst",
        newSugg: 7,
        carryForward: 1,
    },
    {
        chartId: "CHT008",
        dos: "02-08-2024",
        pcp: "Dr. James Anderson",
        facility: "Westend Medical",
        insurance: "WellCare",
        newSugg: 2,
        carryForward: 0,
    },
    {
        chartId: "CHT009",
        dos: "02-09-2024",
        pcp: "Dr. Ava Thomas",
        facility: "Horizon Health",
        insurance: "MediPlus",
        newSugg: 5,
        carryForward: 3,
    },
    {
        chartId: "CHT010",
        dos: "02-10-2024",
        pcp: "Dr. Benjamin Lee",
        facility: "Central Hospital",
        insurance: "HealthGuard",
        newSugg: 4,
        carryForward: 2,
    },
    {
        chartId: "CHT011",
        dos: "02-11-2024",
        pcp: "Dr. Charlotte White",
        facility: "Evergreen Care",
        insurance: "MediHealth",
        newSugg: 3,
        carryForward: 1,
    },
    {
        chartId: "CHT012",
        dos: "02-12-2024",
        pcp: "Dr. Daniel Wilson",
        facility: "Lakeside Medical",
        insurance: "WellLife",
        newSugg: 6,
        carryForward: 0,
    },
    {
        chartId: "CHT013",
        dos: "02-13-2024",
        pcp: "Dr. Sophia Carter",
        facility: "Highland Hospital",
        insurance: "LifeCare",
        newSugg: 4,
        carryForward: 2,
    },
    {
        chartId: "CHT014",
        dos: "02-14-2024",
        pcp: "Dr. Ethan Johnson",
        facility: "Midtown Clinic",
        insurance: "HealthSecure",
        newSugg: 5,
        carryForward: 3,
    },
    {
        chartId: "CHT015",
        dos: "02-15-2024",
        pcp: "Dr. Lily Adams",
        facility: "Bayview Health",
        insurance: "PrimeCare",
        newSugg: 7,
        carryForward: 2,
    },
    {
        chartId: "CHT016",
        dos: "02-16-2024",
        pcp: "Dr. Henry Brown",
        facility: "Westside Medical",
        insurance: "SafeHealth",
        newSugg: 2,
        carryForward: 4,
    },
    {
        chartId: "CHT017",
        dos: "02-17-2024",
        pcp: "Dr. Grace Parker",
        facility: "Riverside Clinic",
        insurance: "CareFirst",
        newSugg: 3,
        carryForward: 1,
    },
    {
        chartId: "CHT018",
        dos: "02-18-2024",
        pcp: "Dr. Lucas Evans",
        facility: "Northpoint Health",
        insurance: "MediSecure",
        newSugg: 6,
        carryForward: 0,
    },
    {
        chartId: "CHT019",
        dos: "02-19-2024",
        pcp: "Dr. Hannah Scott",
        facility: "Sunset Hospital",
        insurance: "LifeShield",
        newSugg: 5,
        carryForward: 3,
    },
    {
        chartId: "CHT020",
        dos: "02-20-2024",
        pcp: "Dr. Ryan Turner",
        facility: "Summit Medical",
        insurance: "HealthCare Plus",
        newSugg: 4,
        carryForward: 2,
    }
];





