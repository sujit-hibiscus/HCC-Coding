import AssignedDocumentsTable from "@/components/admin/AssignedTable";
import AuditDocumentsTable from "@/components/admin/AuditTable";
import PendingDocumentsTable from "@/components/admin/PendingTable";
import { ChartTab } from "@/lib/types/chartsTypes";
import { notFound } from "next/navigation";
import type React from "react";

type LayoutProps = {
    params: Promise<{
        tab: string
    }>
}

// Dynamic metadata function
export async function generateMetadata({ params }: LayoutProps) {
    const { tab = "" } = await params;

    const baseUrl = "https://adi-sable.vercel.app/dashboard/charts";
    const imageUrl = "https://images.unsplash.com/photo-1551076803-c50f24c5d0d2";

    const metadataMap: Record<string, { title: string; description: string; openGraph: object }> = {
        pending: {
            title: "Pending - HCC Coding",
            description: "View and manage all pending charts cases efficiently.",
            openGraph: {
                title: "Pending - HCC Coding",
                description: "Track and manage Pending cases seamlessly.",
                url: `${baseUrl}/pending`,
                siteName: "HCC Coding",
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
        assigned: {
            title: "Assigned - HCC Coding",
            description: "Review and edit your saved Assigned charts cases.",
            openGraph: {
                title: "Assigned charts Cases - HCC Coding",
                description: "Save, edit, and manage your Assigned charts cases efficiently.",
                url: `${baseUrl}/Assigned`,
                siteName: "HCC Coding",
                images: [
                    {
                        url: imageUrl,
                        width: 1200,
                        height: 630,
                        alt: "Doctor reviewing Assigned patient cases",
                    },
                ],
                type: "website",
            },
        },
        audit: {
            title: "Audit - HCC Coding",
            description: "Analyze and review charts cases before finalization.",
            openGraph: {
                title: "Audit - HCC Coding",
                description: "Ensure accurate case reviews before proceeding.",
                url: `${baseUrl}/review`,
                siteName: "HCC Coding",
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
        completed: {
            title: "Completed - HCC Coding",
            description: "View all completed charts cases with processing time.",
            openGraph: {
                title: "Completed - HCC Coding",
                description: "Review completed cases and their processing times.",
                url: `${baseUrl}/completed`,
                siteName: "HCC Coding",
                images: [
                    {
                        url: imageUrl,
                        width: 1200,
                        height: 630,
                        alt: "Medical professional reviewing completed patient data",
                    },
                ],
                type: "website",
            },
        },
    };

    if (!metadataMap[tab]) {
        return {
            title: "Charts - HCC Coding",
            description: "Manage charts cases efficiently with AADI.",
            openGraph: {
                title: "charts - HCC Coding",
                description: "Streamline charts case with HCC Coding's secure platform.",
                url: baseUrl,
                siteName: "HCC Coding",
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
    const tabs = ["pending", "assigned", "audit", "completed"];

    if (!tabs.includes(tab)) {
        notFound();
    }

    return (
        <>
            {tab === ChartTab.Pending ? (
                <PendingDocumentsTable />
            ) : tab === ChartTab.Assigned ? (
                <AssignedDocumentsTable />
            ) : tab === ChartTab.Audit ? (
                <AuditDocumentsTable />
            ) : (
                <div>
                    Completed Table
                    {/* // <CompletedDocumentsTable /> */}
                </div>
            )}
        </>
    );
};

export default TabPage;
