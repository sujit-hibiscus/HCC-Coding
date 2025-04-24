import AssignedDocumentsTable from "@/components/admin/AssignedTable";
import AuditDocumentsTable from "@/components/admin/AuditTable";
import PendingDocumentsTable from "@/components/admin/PendingTable";
import { ChartTab } from "@/lib/types/chartsTypes";
import { notFound } from "next/navigation";

type LayoutProps = {
    params: Promise<{
        tab: string;
    }>;
};

// Dynamic metadata function
export async function generateMetadata({ params }: LayoutProps) {
    const { tab = "" } = await params;

    const baseUrl = "https://adi-sable.vercel.app/dashboard/charts";
    const imageUrl = "https://images.unsplash.com/photo-1551076803-c50f24c5d0d2";

    const metadataMap: Record<
        string,
        { title: string; description: string; openGraph: object }
    > = {
        pending: {
            title: "Pending Charts Cases - AADI",
            description: "View and manage all pending charts cases efficiently.",
            openGraph: {
                title: "Pending charts Cases - AADI",
                description: "Track and manage pending charts cases seamlessly.",
                url: `${baseUrl}/pending`,
                siteName: "AADI",
                images: [
                    {
                        url: imageUrl,
                        width: 1200,
                        height: 630,
                        alt: "Doctor reviewing patient cases on a digital dashboard",
                    },
                ],
                type: "website",
            },
        },
        draft: {
            title: "Draft charts Cases - AADI",
            description: "Review and edit your saved draft charts cases.",
            openGraph: {
                title: "Draft charts Cases - AADI",
                description: "Save, edit, and manage your draft charts cases efficiently.",
                url: `${baseUrl}/draft`,
                siteName: "AADI",
                images: [
                    {
                        url: imageUrl,
                        width: 1200,
                        height: 630,
                        alt: "Doctor reviewing draft patient cases",
                    },
                ],
                type: "website",
            },
        },
        review: {
            title: "charts Review Cases - AADI",
            description: "Analyze and review charts cases before finalization.",
            openGraph: {
                title: "charts Review Cases - AADI",
                description: "Ensure accurate case reviews before proceeding.",
                url: `${baseUrl}/review`,
                siteName: "AADI",
                images: [
                    {
                        url: imageUrl,
                        width: 1200,
                        height: 630,
                        alt: "Medical professional reviewing patient data",
                    },
                ],
                type: "website",
            },
        },
        "provider-review": {
            title: "Provider Review - AADI",
            description: "View cases requiring provider review before submission.",
            openGraph: {
                title: "Provider Review - AADI",
                description: "Manage provider reviews and finalize charts cases.",
                url: `${baseUrl}/provider-review`,
                siteName: "AADI",
                images: [
                    {
                        url: imageUrl,
                        width: 1200,
                        height: 630,
                        alt: "Doctor reviewing patient documents",
                    },
                ],
                type: "website",
            },
        },
    };

    if (!metadataMap[tab]) {
        return {
            title: "charts Management - AADI",
            description: "Manage charts cases efficiently with AADI.",
            openGraph: {
                title: "charts Management - AADI",
                description: "Streamline charts case management with AADI's secure platform.",
                url: baseUrl,
                siteName: "AADI",
                images: [
                    {
                        url: imageUrl,
                        width: 1200,
                        height: 630,
                        alt: "Healthcare professionals managing patient records",
                    },
                ],
                type: "website",
            },
        };
    }

    return metadataMap[tab];
}


const TabPage: React.FC<LayoutProps> = async ({ params }) => {
    const { tab = "" } = await params;
    const tabs = ["pending", "assigned", "audit"];

    if (!tabs.includes(tab)) {
        notFound();
    }

    return (
        <>
            {/* <APICallForCharts tab={tab} /> */}
            {tab === ChartTab.Pending ? (
                <PendingDocumentsTable />
            ) : tab === ChartTab.Assigned ? (
                <AssignedDocumentsTable />
            ) : tab === ChartTab.Audit ? (
                <>
                    Audit Page
                    {/* // <AuditDocumentsTable /> */}
                </>
            ) : (
                <></>
            )
            }
        </>
    );
};

export default TabPage;
