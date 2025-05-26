"use client";

import { useDndMonitor } from "@dnd-kit/core";
import { useEffect } from "react";

interface DragMonitorProps {
    setActiveId: (id: string | null) => void
}

export function DragMonitor({ setActiveId }: DragMonitorProps) {
    useDndMonitor({
        onDragStart: (event) => {
            document.body.classList.add("cursor-grabbing");
            setActiveId(event.active.id as string);
        },
        onDragEnd: () => {
            document.body.classList.remove("cursor-grabbing");
            setActiveId(null);
        },
        onDragCancel: () => {
            document.body.classList.remove("cursor-grabbing");
            setActiveId(null);
        },
    });

    // Add global styles for dragging
    useEffect(() => {
        // Add a style tag for cursor styles
        const styleTag = document.createElement("style");
        styleTag.innerHTML = `
      .cursor-grabbing {
        cursor: grabbing !important;
      }
      .cursor-grabbing * {
        cursor: grabbing !important;
      }
      
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }
      
      .column-drag-preview {
        animation: pulse 1.5s infinite ease-in-out;
        background-color: var(--selected-text-color, #0ea5e9);
        color: var(--tab-bg-color, white);
        padding: 0.75rem;
        border-radius: 0.375rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        font-weight: 600;
        text-transform: capitalize;
      }
    `;
        document.head.appendChild(styleTag);

        return () => {
            document.head.removeChild(styleTag);
        };
    }, []);

    // This component doesn't render anything visible
    return null;
}
