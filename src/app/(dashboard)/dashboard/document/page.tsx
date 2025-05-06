"use client";

import DocumentReviewSystem from "@/components/document-management/document-review-system";
import { useRedux } from "@/hooks/use-redux";
import { redirect } from "next/navigation";


export default function DocumentPage() {
    const { selector } = useRedux();
    const { userType = "" } = selector((state) => state.user);

    if ((userType?.toLowerCase()?.includes("admin"))) {
        redirect("/unauthorized");
    }
    return (
        <DocumentReviewSystem />
    );
}
