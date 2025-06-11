"use client";
import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export default function ProgressBar({ loading }: { loading: boolean }) {
    useEffect(() => {
        if (loading) NProgress.start();
        else NProgress.done();
    }, [loading]);
    return null;
} 