import DocumentReviewSystem from "@/components/document-management/document-review-system";
import { DashboardPageMetaData } from "@/lib/MetaData";
import { Metadata } from "next";
import DocumentSkeleton from "./loading";


export const metadata: Metadata = DashboardPageMetaData;



const HomePage = () => {
  return (<DocumentReviewSystem />);
};

export default HomePage;