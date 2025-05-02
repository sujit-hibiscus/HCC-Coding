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
                return <AnalystDashboard />; // Auditors see the same view as analysts
            default:
                return <AdminDashboard />; // Default to admin dashboard
        }
    };

    return <div className="mx-auto px-3 py-2">{renderDashboard()}</div>;
}
