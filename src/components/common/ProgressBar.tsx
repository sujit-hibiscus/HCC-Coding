"use client";
import { useRedux } from "@/hooks/use-redux";
import { setPageLoading } from "@/store/slices/DashboardSlice";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";

export default function ProgressBar({ loading }: { loading: boolean }) {
    const { dispatch } = useRedux();
    useEffect(() => {
        if (loading) NProgress.start();
        else {
            NProgress.done();
            dispatch(setPageLoading(false));
        }
    }, [dispatch, loading]);
    return null;
} 