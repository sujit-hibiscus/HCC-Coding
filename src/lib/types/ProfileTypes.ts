export type DocumentItem = {
    id: number;
    title: string;
    date: string;
    type: string;
    status: string;
};

export interface AppointmentItemType {
    doctor: string;
    date: string;
    time: string;
    type: string;
    status: string;
}

const titles: string[] = [
    "Medical Report 2024", "Lab Results Q1", "Insurance Claims", "Prescription 2024",
    "Annual Health Check", "Blood Test Report", "Dental Records", "MRI Scan Report",
    "Vaccination History", "Discharge Summary", "X-Ray Report", "Ultrasound Report",
    "Allergy Test", "Cardiology Report", "Diabetes Screening", "Physiotherapy Notes",
    "Eye Test Results", "Hearing Test", "COVID-19 Test", "Mental Health Assessment"
];

// Function to generate random dates within a given range
const getRandomDate = (): string => {
    const start = new Date(2023, 0, 1); // Start date: Jan 1, 2023
    const end = new Date(); // End date: Today
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
};

// Function to generate a random document list (between 10-30 unique items)
export const getRandomDocuments = (): DocumentItem[] => {
    const uniqueTitles = [...titles].sort(() => Math.random() - 0.5); // Shuffle titles
    const numDocuments = Math.floor(Math.random() * (30 - 10 + 1)) + 10; // Random between 10-30

    return uniqueTitles.slice(0, numDocuments).map((title, index) => ({
        id: index + 1,
        title,
        date: getRandomDate(),
        type: Math.random() > 0.5 ? "PDF" : "DOC", // Randomly choose type
        status: ["Verified", "Pending", "Reviewed"][Math.floor(Math.random() * 3)] // Random status
    }));
};