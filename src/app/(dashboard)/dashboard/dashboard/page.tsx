"use client";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { AnalystDashboard } from "@/components/dashboard/analyst-dashboard";
import { useRedux } from "@/hooks/use-redux";

export default function Dashboard3Page() {
    const { selector } = useRedux();
    const userType = selector((state) => state.user.userType);

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
