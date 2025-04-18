import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/Typography";
import useFullPath from "@/hooks/use-fullpath";
import { useRedux } from "@/hooks/use-redux";
import { ChartTypeEnum, codingApprovedData, codingReviewData, DraftData, followupData, PrevisitData, ProviderReviewData, ReviewData } from "@/lib/types/PrevisitTypes";
import { formatDOS } from "@/store/slices/previsit-slice";
enum ChartMode {
    SYSTEM = "System Generated",
    MANUAL = "Manual",
}


interface PatientCardProps {
    chart: string;
    chartId: string;
}
export default function PatientCard({ chart, chartId }: PatientCardProps) {
    const { selector } = useRedux();
    const { chart: chartDetails } = selector(state => state.provider);
    const masterData = chartDetails[chartId ?? "0"] || { data: [], status: "FAILED" };
    const isLoading = masterData?.status;
    const { draftData, pendingData, reviewData, providerReview } = selector((state) => state?.previsit);
    const apiStoredData = [...(draftData?.data), ...(pendingData?.data), ...(reviewData?.data), ...(providerReview?.data)];
    const allChartData = [...PrevisitData, ...DraftData, ...ReviewData, ...ProviderReviewData, ...followupData, ...codingApprovedData, ...codingReviewData, ...apiStoredData];
    const targetProvider = allChartData?.find(item => item?.chartId === chartId);
    const { path } = useFullPath();

    const memberData = masterData?.data;
    const patientInfo = isLoading === "FAILED" ? {
        chartId,
        dos: targetProvider?.dos,
        memberId: targetProvider && "memberId" in targetProvider ? targetProvider.memberId : "",
        memberName: `${targetProvider?.firstName} ${targetProvider?.lastName}`,
        memberDob: targetProvider && "dob" in targetProvider ? targetProvider.dob : "",
        providerId: "P123456",
        providerName: targetProvider?.pcp,
        facility: targetProvider?.facility,
        status: "Active",
        assignedTo: targetProvider && "assignTo" in targetProvider ? targetProvider.assignTo : "",
        chartMode: path?.includes("manual") ? ChartMode.MANUAL : ChartMode.SYSTEM,
    } : {
        chartId,
        dos: memberData?.appointment?.DOS ? formatDOS(memberData?.appointment?.DOS) : "",
        memberId: memberData?.member?.id,
        memberName: `${memberData?.member?.first_name} ${memberData?.member?.last_name}`,
        memberDob: memberData?.member?.DOB,
        providerId: "P123456",
        providerName: memberData?.member?.PCP,
        facility: memberData?.appointment?.facility,
        status: "Active",
        assignedTo: memberData?.analyst,
        chartMode: memberData?.chart_type === "System Generated" ? ChartMode.SYSTEM : ChartMode.MANUAL,
    };

    const patientFields = [
        { label: "Chart ID", value: patientInfo.chartId },
        { label: "DOS", value: patientInfo.dos },
        { label: "Member ID", value: patientInfo.memberId },
        { label: "Name", value: patientInfo.memberName },
        { label: "DOB", value: patientInfo.memberDob },
        { label: "Provider ID", value: patientInfo.providerId },
        { label: "Provider Name", value: patientInfo.providerName },
        { label: "Facility", value: patientInfo.facility },
        { label: "Status", value: patientInfo.status },
        ...(chart !== ChartTypeEnum.PROVIDER_REVIEW ? [] : []),
        { label: "Assign To", value: patientInfo.assignedTo },
    ];

    if (isLoading === "PENDING") {
        return (
            <Card className="mb-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                    {Array.from({ length: 13 }).map((_, i) => (
                        <div key={i}>
                            {/* <Skeleton className="h-4 w-24 mb-2" /> */}
                            <Skeleton className="h-6 w-32" />
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="border bg-card text-card-foreground shadow mb-4 p-2 rounded-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-2">
                {patientFields?.filter(item => item?.value).map(({ label, value }) => (
                    <div key={label} className={`flex items-center gap-2 ${label === "Facility" ? "col-span-2" : ""}`}>
                        <Typography variant="label">{label}:</Typography>
                        <Typography variant="value">{value}</Typography>
                    </div>
                ))}
                <div className="flex items-center gap-2">
                    <Typography variant="label">Chart Mode:</Typography>
                    <Badge variant={"accent"} className="rounded-none">
                        {patientInfo.chartMode}
                    </Badge>
                </div>
            </div>
        </Card>
    );
}
