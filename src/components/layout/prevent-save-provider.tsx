"use client";

import { usePreventSave } from "@/hooks/use-prevent-save";
import type { ReactNode } from "react";

interface PreventSaveProviderProps {
    children: ReactNode
}

export function PreventSaveProvider({ children }: PreventSaveProviderProps) {
    usePreventSave();
    return <>{children}</>;
}
