"use client";

import type { ReactNode } from "react";
import { usePreventSave } from "@/hooks/use-prevent-save";

interface PreventSaveProviderProps {
    children: ReactNode
}

export function PreventSaveProvider({ children }: PreventSaveProviderProps) {
    usePreventSave();

    return <>{children}</>;
}
