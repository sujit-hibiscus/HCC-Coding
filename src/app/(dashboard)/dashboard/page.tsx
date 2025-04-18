import Dashboard from "@/components/charts/Dashboard";
import { DashboardPageMetaData } from "@/lib/MetaData";
import { Metadata } from "next";

export const metadata: Metadata = DashboardPageMetaData;

const HomePage = () => {
  return (
    <Dashboard />
  );
};

export default HomePage;