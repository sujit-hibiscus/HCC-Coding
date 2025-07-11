"use client";

import { usePreventSave } from "@/hooks/use-prevent-save";
import type { ReactNode } from "react";

interface PreventSaveProviderProps {
    children: ReactNode
}

export function PreventSaveProvider({ children }: PreventSaveProviderProps) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions, react-hooks/rules-of-hooks
    process.env.NEXT_PUBLIC_LOCAL !== "true" && usePreventSave();
    return <>{children}</>;
}
