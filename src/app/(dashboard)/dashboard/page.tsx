import { DashboardPageMetaData } from "@/lib/MetaData";
import { Metadata } from "next";
import Dashboard2Page from "./dashboard/page";


export const metadata: Metadata = DashboardPageMetaData;

const HomePage = () => {
  return (<Dashboard2Page />);
};

export default HomePage;