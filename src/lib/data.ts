import { Activity, AlertCircle, BriefcaseMedical, Calendar, Clipboard, FileText, Heart, Hospital, Mail, MapPin, Phone, Stethoscope, User } from "lucide-react";
import { HCCEntry } from "./types/PrevisitTypes";
import { Note } from "./types/dashboardTypes";


export const camelCaseToReadable = (text: string) => {
    return text
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (match) => match.toUpperCase());
};

export const mockHccEntries: HCCEntry[] = [];
/* export const mockHccEntries: HCCEntry[] = [
    {
        id: "1",
        condition: "Secondary state - due to melanoma, aspirin in current",
        isExpanded: false,
        status: "pending",
        code: {
            v24: 4,
            v28: 0
        },
        references: [
            {
                id: "ref1",
                title: "Lab Report - Coagulation Panel",
                type: "Clinical",
                dated: "2024-01-15",
                pdfUrl: "https://example.com/lab-report.pdf",
            },
            {
                id: "ref2",
                title: "Progress Note - Oncology Follow-up",
                type: "Medical",
                dated: "2024-01-16",
                pdfUrl: "https://example.com/progress-note.pdf",
            }
        ],
    },
]; */


export const mockDccEntries: HCCEntry[] = [];
/* export const mockDccEntries: HCCEntry[] = [
    {
        id: "101",
        condition: "Secondary state - due to melanoma, aspirin in current Med",
        isExpanded: false,
        status: "pending",
        code: {
            v24: 0,
            v28: 0
        },
        references: [
            {
                id: "HCC",
                title: "Lab Report - Coagulation Panel",
                type: "Clinical",
                dated: "2024-01-15",
                pdfUrl: "https://example.com/lab-report1.pdf",
            },
            {
                id: "HCC2",
                title: "Progress Note - Oncology Follow-up",
                type: "Medical",
                dated: "2024-01-16",
                pdfUrl: "https://example.com/progress-note2.pdf",
            }
        ],
    }
]; */



export const P_patient = {
    name: "Sarah Johnson",
    id: "PT-2024-001",
    age: 32,
    gender: "Female",
    bloodType: "O+",
    primaryPhysician: "Dr. Michael Chen",
    medicalRecordNumber: "MRN-456789",
    nextAppointment: "March 15, 2024",
    allergies: "Penicillin",
    medications: "Metformin, Lisinopril",
    chronicConditions: "Diabetes, Hypertension",
    emergencyContact: {
        name: "John Johnson",
        relation: "Husband",
        phone: "+1 (555) 987-6543",
    },
    documentCount: 5,
    phone: "+1 (555) 123-4567",
    email: "sarah.j@example.com",
    address: "123 Healthcare Ave, Medical City, MC 12345",

};

export const P_patientInfo = [
    {
        icon: User,
        title: "Demographics",
        description: `${P_patient.age}y • ${P_patient.gender} • ${P_patient.bloodType}`,
    },
    {
        icon: FileText,
        title: "Documents",
        description: `${P_patient.documentCount} files`,
    },
    {
        icon: Calendar,
        title: "Next Visit",
        description: P_patient.nextAppointment || "Not Scheduled",
    },
    {
        icon: Activity,
        title: "Last Visit",
        description: "Feb 28, 2024",
    },
    {
        icon: Heart,
        title: "Physician",
        description: P_patient.primaryPhysician || "Not Assigned",
    }
];

export const P_tabs = [
    { value: "charts", disabled: false, label: "Charts", icon: Hospital },
    { value: "progressNotes", disabled: false, label: "Progress Notes", icon: Calendar },
    { value: "labResults", disabled: true, label: "Lab Results", icon: FileText },
    { value: "other-document", disabled: false, label: "Other Document", icon: FileText },
    { value: "medications", disabled: true, label: "Medications", icon: FileText },
    { value: "chronic-conditions", disabled: true, label: "Chronic Conditions", icon: FileText },
];

export const P_contactDetails = [
    { icon: Phone, label: "Phone", value: P_patient.phone },
    { icon: Mail, label: "Email", value: P_patient.email },
    { icon: MapPin, label: "Address", value: P_patient.address }
];

export const P_patientDetails = P_patient ? [
    { icon: User, label: "Full Name", value: P_patient.name },
    { icon: User, label: "Gender", value: P_patient.gender },
    { icon: Calendar, label: "Age", value: P_patient.age ? `${P_patient.age} years` : "N/A" },
    { icon: Heart, label: "Blood Type", value: P_patient.bloodType || "N/A" },
    { icon: Stethoscope, label: "Primary Doctor", value: P_patient.primaryPhysician || "N/A" },
    { icon: Clipboard, label: "Medical Record No.", value: P_patient.medicalRecordNumber || "N/A" },
    { icon: FileText, label: "Allergies", value: P_patient.allergies || "None" },
    { icon: BriefcaseMedical, label: "Current Medications", value: P_patient.medications || "None" },
    { icon: Activity, label: "Chronic Conditions", value: P_patient.chronicConditions || "None" },
    {
        icon: AlertCircle,
        label: "Emergency Contact",
        value: P_patient?.emergencyContact
            ? `${P_patient.emergencyContact.name} (${P_patient.emergencyContact.relation}) - ${P_patient.emergencyContact.phone}`
            : "N/A"
    },
] : [];

export const P_staticProgressData: Note[] = [
    {
        id: "1",
        date: "02-20-2024",
        title: "Initial Consultation",
        path: "Patient reported ongoing symptoms...",
    },
    {
        id: "2",
        date: "03-20-2025",
        title: "Follow-up Session",
        path: "Improvement in previous symptoms...",
    },
    {
        id: "3",
        date: "05-05-2025",
        title: "Progress Review",
        path: "Notable progress in treatment goals...",
    },
];

export const P_otherDocument: Note[] = [
    {
        id: "1",
        date: "01-10-2024",
        title: "Medical History",
        path: "Patient provided a detailed medical history...",
    },
    {
        id: "2",
        date: "02-15-2024",
        title: "Lab Results",
        path: "Recent lab results reviewed and discussed...",
    },
    {
        id: "3",
        date: "03-22-2024",
        title: "Prescription Update",
        path: "New medications prescribed based on symptoms...",
    },
    {
        id: "4",
        date: "04-18-2024",
        title: "Diagnostic Report",
        path: "MRI scan results indicate mild abnormalities...",
    },
    {
        id: "5",
        date: "05-30-2024",
        title: "Referral Letter",
        path: "Patient referred to a specialist for further evaluation...",
    },
    {
        id: "6",
        date: "06-12-2024",
        title: "Insurance Claim",
        path: "Submitted claim for recent medical expenses...",
    },
    {
        id: "7",
        date: "07-25-2024",
        title: "Treatment Plan",
        path: "Updated treatment plan with new therapy sessions...",
    },
    {
        id: "8",
        date: "08-14-2024",
        title: "Physical Therapy Notes",
        path: "Patient showed improvement in mobility...",
    },
    {
        id: "9",
        date: "09-05-2024",
        title: "Annual Checkup",
        path: "Routine checkup conducted, no major concerns...",
    },
    {
        id: "10",
        date: "10-20-2024",
        title: "Discharge Summary",
        path: "Patient discharged with recovery recommendations...",
    },
];
