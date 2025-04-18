import ProcessTimeline from "@/components/previsit/ProcessTimeline";
import { Card } from "@/components/ui/card";
import { ChartLogMetaData } from "@/lib/MetaData";
import { stringToFormattedDate } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = ChartLogMetaData;

interface ChartLogProps {
    searchParams: Promise<{ chartId?: string }>;
}

const ChartLogContent = async ({ searchParams }: ChartLogProps) => {
    const params = await searchParams;
    const chartId = params.chartId || "Unknown";
    console.info("🚀 ~ ChartLogContent ~ chartId:", chartId);

    const patientInfo = {
        dos: stringToFormattedDate("2025-05-01"),
        memberId: "202212345678",
        memberName: "John Doe",
        memberDob: stringToFormattedDate("1992-05-01"),
        providerId: "P123456",
        providerName: "Dr. Smith",
        facility: "Freedom Health",
        status: "Active",
        assignedTo: "Jane Smith",
    };

    const patientDetails = [
        { label: "DOS", value: patientInfo.dos },
        { label: "Member ID", value: patientInfo.memberId },
        { label: "Member Name", value: patientInfo.memberName },
        { label: "Member DOB", value: patientInfo.memberDob },
        { label: "Provider ID", value: patientInfo.providerId },
        { label: "Provider Name", value: patientInfo.providerName },
        { label: "Facility", value: patientInfo.facility },
        { label: "Status", value: patientInfo.status },
    ];

    return (
        <>
            <div className="h-full p-2">
                <div className="mx-auto h-full flex flex-col gap-2">
                    <Card className="mb-3 p-4 rounded-none  bg-white dark:bg-gray-800 shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {patientDetails.map(({ label, value }) => (
                                <div key={label}>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{label}:</p>
                                    <p className="text-gray-900 dark:text-white">{value}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <ProcessTimeline />
                </div>
            </div>
        </>
    );
};

export default ChartLogContent;
