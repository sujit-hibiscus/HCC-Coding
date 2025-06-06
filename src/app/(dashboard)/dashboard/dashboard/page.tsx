"use client";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { AnalystDashboard } from "@/components/dashboard/analyst-dashboard";
import { useRedux } from "@/hooks/use-redux";
import { useEffect, useState } from "react";
import DocumentSkeleton from "../loading";

export default function Dashboard3Page() {
    const { selector } = useRedux();
    const userType = selector((state) => state.user.userType);

    const [isClient, setIsClient] = useState(false);
    // Ensure refs are only used on client-side
    useEffect(() => {
        // This empty effect ensures refs are only accessed on client
    }, []);

    useEffect(() => {
        setIsClient(true);
    }, []);



    if (!isClient) {
        return <DocumentSkeleton />;
    }

    const renderDashboard = () => {
        switch (userType) {
            case "Admin":
            case "Super Admin":
                return <AdminDashboard />;
            case "Analyst":
            case "Auditor":
                return <AnalystDashboard />;
            default:
                return <AdminDashboard />;
        }
    };

    return <div className="mx-auto px-3 pb-2">{renderDashboard()}</div>;
}
