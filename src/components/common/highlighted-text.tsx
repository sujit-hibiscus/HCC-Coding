/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface Entity {
    Id: number
    Text: string
    Category: string
    Type: string
    BeginOffset: number
    EndOffset: number
    Traits: { Name: string; Score: number }[]

    Attributes: any[]
    ICD10CMConcepts?: {
        Description: string
        Code: string
        Score: number
    }[]
}

interface DocumentViewerProps {
    textData: string

    jsonData: any
}

const getTraitStyles = (
    traits: { Name: string; Score: number }[],
): { styles: Array<{ color: string; traitName: string; backgroundColor: string }> } => {
    if (!traits || traits.length === 0) return { styles: [] };

    const styles = traits.map((trait) => {
        const traitName = trait.Name;
        let color;
        let backgroundColor;

        switch (traitName) {
            case "SYMPTOM":
                color = "red";
                backgroundColor = "rgba(255, 0, 0, 0.15)";
                break;
            case "DIAGNOSIS":
                color = "blue";
                backgroundColor = "rgba(0, 0, 255, 0.15)";
                break;
            case "SIGN":
                color = "green";
                backgroundColor = "rgba(0, 128, 0, 0.15)";
                break;
            default:
                color = "gray";
                backgroundColor = "rgba(128, 128, 128, 0.15)";
        }

        return { color, traitName, backgroundColor };
    });

    return { styles };
};

const getBackgroundForAttribute = (attributeType: string): { color: string; label: string } => {
    switch (attributeType) {
        case "DIRECTION":
            return { color: "#ADD8E6", label: "Direction" }; // Light blue
        case "QUALITY":
            return { color: "#90EE90", label: "Quality" }; // Light green
        case "SYSTEM_ORGAN_SITE":
            return { color: "#F08080", label: "Organ" }; // Light red - Changed label from System_Organ_Site to Organ
        case "DX_NAME":
            return { color: "#FFA07A", label: "Diagnosis Name" }; // Light salmon
        default:
            return { color: "#D3D3D3", label: attributeType }; // Light gray
    }
};

const shouldIncludeEntity = (entity: Entity, filterValue: string): boolean => {
    if (filterValue === "all") return true;

    const traitFilters = ["SYMPTOM", "DIAGNOSIS", "SIGN", "HYPOTHETICAL"];
    if (traitFilters.includes(filterValue)) {
        return entity.Traits?.some((trait) => trait.Name === filterValue);
    }

    const attributeFilters = ["DIRECTION", "QUALITY", "SYSTEM_ORGAN_SITE", "DX_NAME"];
    if (attributeFilters.includes(filterValue)) {
        if (entity.Category === "ATTRIBUTE") {
            return entity.Type === filterValue;
        }
        return entity.Attributes?.some((attr) => attr.Type === filterValue);
    }

    return true;
};

export default function DocumentViewer({ textData, jsonData }: DocumentViewerProps) {
    const [processedText, setProcessedText] = useState<React.ReactNode[]>([]);
    const [filterValue, setFilterValue] = useState<string>("all");
    const [filterOptions, setFilterOptions] = useState<Array<{ value: string; label: string; type: string }>>([]);

    const [hasAnimated, setHasAnimated] = useState<boolean>(false);
    const textContentRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
    const [showAllConcepts, setShowAllConcepts] = useState<boolean>(false);

    const { traitTypes, attributeTypes, legendItems } = useMemo(() => {
        if (!jsonData?.Entities)
            return { traitTypes: new Set<string>(), attributeTypes: new Set<string>(), legendItems: [] };

        const traits = new Set<string>();
        const attributes = new Set<string>();
        const legend: { color: string; label: string; type: string }[] = [];

        const traitColors: Record<string, string> = {
            SYMPTOM: "red",
            DIAGNOSIS: "blue",
            SIGN: "green",
            HYPOTHETICAL: "orange"
        };

        Object.entries(traitColors).forEach(([trait, color]) => {
            const label = trait;
            legend.push({ color, label, type: "trait" });
        });

        const attributeColorMap: Record<string, { color: string; label: string }> = {
            DIRECTION: { color: "#ADD8E6", label: "Direction" },
            QUALITY: { color: "#90EE90", label: "Quality" },
            SYSTEM_ORGAN_SITE: { color: "#F08080", label: "Organ" },
            DX_NAME: { color: "#FFA07A", label: "Diagnosis Name" },
        };

        Object.entries(attributeColorMap).forEach(([attr, { color, label }]) => {
            console.info("🚀 ~ Object.entries ~ attr:", attr);
            legend.push({ color, label, type: "attribute" });
        });

        if (jsonData.Entities) {

            jsonData.Entities.forEach((entity: any) => {
                if (entity.Traits) {

                    entity.Traits.forEach((trait: any) => {
                        if (trait.Name && trait.Name !== "NEGATION") traits.add(trait.Name);
                    });
                }

                if (entity.Attributes) {

                    entity.Attributes.forEach((attr: any) => {
                        if (attr.Type) attributes.add(attr.Type);
                    });
                }
            });
        }

        return {
            traitTypes: traits,
            attributeTypes: attributes,
            legendItems: legend,
        };
    }, [jsonData]);

    useEffect(() => {
        if (!jsonData?.Entities) return;

        const options = [{ value: "all", label: "All", type: "all" }];

        Array.from(traitTypes).forEach((trait) => {
            options.push({
                value: trait,
                label: trait.charAt(0) + trait.slice(1).toLowerCase(),
                type: "trait",
            });
        });

        Array.from(attributeTypes).forEach((attr) => {
            const { label } = getBackgroundForAttribute(attr);
            options.push({
                value: attr,
                label,
                type: "attribute",
            });
        });

        setFilterOptions(options);
    }, [jsonData, traitTypes, attributeTypes]);


    const [allSegments, setAllSegments] = useState<any[]>([]);

    useEffect(() => {
        if (!textContentRef.current || hasAnimated) return;

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                }
            });
        };

        observerRef.current = new IntersectionObserver(handleIntersection, {
            threshold: 0.1,
        });

        observerRef.current.observe(textContentRef.current);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasAnimated]);

    const segments = useMemo(() => {
        if (!textData || !jsonData?.Entities) return [];

        return createTextSegments(textData, jsonData.Entities || []);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [textData, jsonData]);

    useEffect(() => {
        if (segments.length === 0) return;

        setAllSegments([...segments]);

        const filteredSegments = applyFilters(segments, filterValue);
        setProcessedText(convertToReactNodes(filteredSegments));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [segments]);

    useEffect(() => {
        if (allSegments.length === 0) return;

        const filteredSegments = applyFilters([...allSegments], filterValue);
        setProcessedText(convertToReactNodes(filteredSegments));

        if (textContentRef.current) {
            textContentRef.current.classList.add("bg-blue-50/20");
            setTimeout(() => {
                if (textContentRef.current) {
                    textContentRef.current.classList.remove("bg-blue-50/20");
                }
            }, 300);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterValue, allSegments]);

    function createTextSegments(text: string, entities: Entity[]) {
        const positionMap = new Map<
            number,
            {
                traits: Array<{ color: string; traitName: string; backgroundColor: string }>
                background: string | null
                entity: Entity
                tooltipText: string
                isAttribute: boolean
            }[]
        >();

        for (let i = 0; i < text.length; i++) {
            positionMap.set(i, []);
        }

        entities.forEach((entity) => {
            const entityCopy = JSON.parse(JSON.stringify(entity));

            const removedTraits = entityCopy.Traits?.filter((trait: any) => trait.Name !== "NEGATION") || [];
            const begin = entityCopy.BeginOffset || 0;
            const end = entityCopy.EndOffset || 0;
            const { styles } = getTraitStyles(removedTraits || []);
            const tooltipText = styles.length > 0 ? `Traits: ${styles.map((s) => s.traitName).join(", ")}` : "";

            for (let i = begin; i < end; i++) {
                const posStyles = positionMap.get(i) || [];
                posStyles.push({
                    traits: [...styles],
                    background: null,
                    entity: entityCopy,
                    tooltipText,
                    isAttribute: false,
                });
                positionMap.set(i, posStyles);
            }

            if (entityCopy.Attributes && entityCopy.Attributes.length > 0) {

                entityCopy.Attributes.forEach((attr: any) => {
                    if (attr.BeginOffset !== undefined && attr.EndOffset !== undefined && attr.Type) {
                        const attrBegin = attr.BeginOffset;
                        const attrEnd = attr.EndOffset;
                        const { color: bgColor, label } = getBackgroundForAttribute(attr.Type);

                        const attrEntity = {
                            ...attr,
                            Id: `attr-${entityCopy.Id}-${attrBegin}`,
                            Category: "ATTRIBUTE",
                            Traits: [],
                        };

                        for (let i = attrBegin; i < attrEnd; i++) {
                            const posStyles = positionMap.get(i) || [];
                            posStyles.push({
                                traits: [],
                                background: bgColor,
                                entity: attrEntity,
                                tooltipText: `Attributes: ${label}`,
                                isAttribute: true,
                            });
                            positionMap.set(i, posStyles);
                        }
                    }
                });
            }
        });


        const segments: any[] = [];

        let currentStyles: any[] = [];
        let currentStart = 0;
        let currentDesign = "";

        for (let i = 0; i < text.length; i++) {
            const posStyles = positionMap.get(i) || [];
            const designSignature = getDesignSignature(posStyles);
            const stylesChanged = !areStylesEqual(currentStyles, posStyles);
            const designChanged = currentDesign !== designSignature;

            if ((stylesChanged || designChanged) && i > 0) {
                const segmentText = text.substring(currentStart, i);

                if (currentStyles.length > 0) {
                    const mergedTraits = mergeTraits(currentStyles);
                    const mergedBackground = mergeBackgrounds(currentStyles);
                    const mergedEntities = currentStyles.map((s) => s.entity);
                    const mergedTooltips = currentStyles
                        .map((s) => s.tooltipText)
                        .filter(Boolean)
                        .join(", ");
                    const hasAttribute = currentStyles.some((s) => s.isAttribute);

                    segments.push({
                        start: currentStart,
                        end: i,
                        text: segmentText,
                        isHighlighted: true,
                        traits: [...mergedTraits],
                        background: mergedBackground,
                        entity: mergedEntities[0],
                        tooltipText: mergedTooltips,
                        isAttribute: hasAttribute,
                        hasBoth: hasAttribute && mergedTraits.length > 0,
                        designSignature: currentDesign,
                    });
                } else {
                    segments.push({
                        start: currentStart,
                        end: i,
                        text: segmentText,
                        isHighlighted: false,
                    });
                }

                currentStart = i;
                currentDesign = designSignature;
            }

            currentStyles = [...posStyles];
        }

        if (currentStart < text.length) {
            const segmentText = text.substring(currentStart, text.length);

            if (currentStyles.length > 0) {
                const mergedTraits = mergeTraits(currentStyles);
                const mergedBackground = mergeBackgrounds(currentStyles);
                const mergedEntities = currentStyles.map((s) => s.entity);
                const mergedTooltips = currentStyles
                    .map((s) => s.tooltipText)
                    .filter(Boolean)
                    .join(", ");
                const hasAttribute = currentStyles.some((s) => s.isAttribute);

                segments.push({
                    start: currentStart,
                    end: text.length,
                    text: segmentText,
                    isHighlighted: true,
                    traits: [...mergedTraits],
                    background: mergedBackground,
                    entity: mergedEntities[0],
                    tooltipText: mergedTooltips,
                    isAttribute: hasAttribute,
                    hasBoth: hasAttribute && mergedTraits.length > 0,
                    designSignature: currentDesign,
                });
            } else {
                segments.push({
                    start: currentStart,
                    end: text.length,
                    text: segmentText,
                    isHighlighted: false,
                });
            }
        }

        return mergeAdjacentSegments([...segments]);
    }


    function getDesignSignature(styles: any[]): string {
        if (styles.length === 0) return "";
        const traitSignatures = styles
            .filter((s) => !s.isAttribute && s.traits.length > 0)
            .flatMap((s) => s.traits.map((t: any) => `${t.traitName}:${t.color}`))
            .sort()
            .join("|");
        const attrSignatures = styles
            .filter((s) => s.isAttribute && s.background)
            .map((s) => `attr:${s.background}`)
            .sort()
            .join("|");

        return `${traitSignatures}|${attrSignatures}`;
    }


    function mergeAdjacentSegments(segments: any[]): any[] {
        if (segments.length <= 1) return segments;

        const result: any[] = [];
        let current = { ...segments[0] };

        for (let i = 1; i < segments.length; i++) {
            const next = segments[i];
            if (
                current.isHighlighted &&
                next.isHighlighted &&
                current.designSignature &&
                next.designSignature &&
                current.designSignature === next.designSignature
            ) {
                current = {
                    ...current,
                    end: next.end,
                    text: current.text + next.text,
                };
            } else {
                result.push(current);
                current = { ...next };
            }
        }

        result.push(current);
        return result;
    }


    function areStylesEqual(styles1: any[], styles2: any[]) {
        if (styles1.length !== styles2.length) return false;
        const hash1 = styles1
            .map((s) => `${s.entity.Id}-${s.isAttribute}`)
            .sort()
            .join("|");
        const hash2 = styles2
            .map((s) => `${s.entity.Id}-${s.isAttribute}`)
            .sort()
            .join("|");

        return hash1 === hash2;
    }


    function mergeTraits(styles: any[]) {
        const allTraits = styles.filter((s) => !s.isAttribute).flatMap((s) => s.traits || []);
        const uniqueTraits = allTraits.filter(
            (trait, index, self) => index === self.findIndex((t) => t.traitName === trait.traitName),
        );

        return uniqueTraits;
    }


    function mergeBackgrounds(styles: any[]) {
        const backgrounds = styles
            .filter((s) => s.isAttribute)
            .map((s) => s.background)
            .filter(Boolean);

        return backgrounds.length > 0 ? backgrounds[0] : null;
    }


    function applyFilters(segments: any[], filterValue: string) {
        const filteredSegments = segments.map((segment) => {
            if (segment.isHighlighted) {
                const visible = shouldIncludeEntity(segment.entity, filterValue);
                const showTraits =

                    filterValue === "all" || (segment.traits && segment.traits.some((t: any) => t.traitName === filterValue));

                const showBackground =
                    filterValue === "all" ||
                    (segment.entity.Category === "ATTRIBUTE" && segment.entity.Type === filterValue) ||
                    (segment.entity.Attributes && segment.entity.Attributes.some((a: any) => a.Type === filterValue));

                let filteredTraits = segment.traits;
                if (filterValue !== "all") {

                    filteredTraits = segment.traits.filter((trait: any) => trait.traitName === filterValue);
                }

                return {
                    ...segment,
                    visible,
                    showTraits,
                    showBackground,
                    filteredTraits: [...filteredTraits],
                    filterDesignSignature: visible

                        ? `${filterValue}-${showTraits}-${showBackground}-${filteredTraits.map((t: any) => t.traitName).join("|")}`
                        : "not-visible",
                };
            }
            return { ...segment, visible: true, filterDesignSignature: "plain-text" };
        });

        if (filterValue !== "all") {
            return mergeAdjacentFilteredSegments([...filteredSegments]);
        }

        return filteredSegments;
    }


    function mergeAdjacentFilteredSegments(segments: any[]): any[] {
        if (segments.length <= 1) return segments;


        const result: any[] = [];
        let current = { ...segments[0] };

        for (let i = 1; i < segments.length; i++) {
            const next = segments[i];
            if (
                current.isHighlighted &&
                next.isHighlighted &&
                current.visible &&
                next.visible &&
                current.filterDesignSignature &&
                next.filterDesignSignature &&
                current.filterDesignSignature === next.filterDesignSignature
            ) {
                current = {
                    ...current,
                    end: next.end,
                    text: current.text + next.text,
                };
            } else {
                result.push(current);
                current = { ...next };
            }
        }

        result.push(current);
        return result;
    }

    function convertToReactNodes(segments: any[]) {
        const result: React.ReactNode[] = [];

        segments.forEach((segment, index) => {
            if (segment.isHighlighted) {
                if (segment.visible) {
                    const style: React.CSSProperties = {};
                    const traitsToUse = segment.filteredTraits || segment.traits || [];
                    if (segment.showTraits && traitsToUse.length > 0) {
                        style.backgroundColor = traitsToUse[0]?.backgroundColor || "transparent";
                    }
                    const showAttributeBorder = segment.showBackground && segment.background;
                    if ((segment.showTraits && traitsToUse.length > 1) || showAttributeBorder) {
                        style.borderStyle = "solid";
                        style.borderTopWidth = "1px";
                        style.borderRightWidth = "1px";
                        style.borderLeftWidth = "1px";
                        style.borderBottomWidth = "1px";
                        let mainColor;
                        if (segment.showTraits && traitsToUse.length > 0) {
                            mainColor = traitsToUse[0]?.color;
                        } else if (showAttributeBorder) {
                            mainColor = segment.background;
                        }
                        style.borderTopColor = mainColor;
                        style.borderRightColor = mainColor;
                        style.borderLeftColor = mainColor;
                        style.borderBottomColor = mainColor;
                        if (segment.hasBoth && showAttributeBorder) {
                            style.borderBottomColor = segment.background;
                            style.borderBottomWidth = "2px";
                        }
                    }
                    style.position = "relative";

                    const tooltipContent = segment.tooltipText;

                    const hasVisibleStyling =
                        (segment.showTraits && traitsToUse.length > 0) || (segment.showBackground && segment.background);

                    const hasMultipleTraits = segment.showTraits && traitsToUse.length > 1;

                    const highlightedContent = (
                        <motion.span
                            key={`highlight-${segment.start}-${segment.end}`}
                            style={style}
                            initial={hasAnimated ? { opacity: 1 } : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                                duration: 0.3,
                                delay: hasAnimated ? 0 : index * 0.03,
                            }}
                            className={`relative ${hasVisibleStyling
                                ? "hover:ring-2 hover:ring-offset-1 hover:ring-blue-300 rounded px-1 py-0.5 pb-2 mx-0.5 transition-all cursor-help font-medium"
                                : ""
                                }
                    
                    ${hasMultipleTraits && segment.showBackground && segment.background ? "leading-[3rem]" : "leading-[2.5rem]"}
                        `}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedEntity(segment.entity);
                                setShowAllConcepts(true);
                            }}
                        >
                            {segment.text}

                            {segment.showTraits &&
                                traitsToUse.length > 1 &&
                                traitsToUse.map((trait: any, i: number) => (
                                    <motion.div
                                        key={`underline-${i}`}
                                        className="absolute left-0 right-0"
                                        initial={hasAnimated ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                                        animate={{ scaleX: 1, opacity: 1 }}
                                        transition={{
                                            duration: 0.4,
                                            delay: hasAnimated ? 0 : index * 0.03 + i * 0.1,
                                        }}
                                        style={{
                                            height: "3px",
                                            backgroundColor: trait.color,
                                            bottom: `${i * 5 + 1}px`,
                                            display: segment.showTraits ? "block" : "none",
                                            transformOrigin: "left",
                                            borderRadius: "1px",
                                            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                                        }}
                                    />
                                ))}
                        </motion.span>
                    );

                    if (hasVisibleStyling) {
                        result.push(
                            <TooltipProvider key={`tooltip-${segment.start}-${segment.end}`}>
                                <Tooltip>
                                    <TooltipTrigger asChild>{highlightedContent}</TooltipTrigger>
                                    <TooltipContent className="w-64 p-0 overflow-hidden" sideOffset={5} side="top">
                                        <motion.div
                                            className="p-3"
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20,
                                            }}
                                        >
                                            <div className="text-sm mb-2">{tooltipContent}</div>

                                            {segment.entity.ICD10CMConcepts && segment.entity.ICD10CMConcepts.length > 0 && (
                                                <>
                                                    <div className="text-xs font-medium mb-1">Suggested ICD10 Concepts:</div>
                                                    <motion.div
                                                        className="space-y-1"
                                                        initial="hidden"
                                                        animate="visible"
                                                        variants={{
                                                            visible: {
                                                                transition: {
                                                                    staggerChildren: 0.1,
                                                                },
                                                            },
                                                            hidden: {},
                                                        }}
                                                    >
                                                        {segment.entity.ICD10CMConcepts.sort((a: any, b: any) => b.Score - a.Score)
                                                            .slice(0, 2)
                                                            .map((concept: any, i: number) => (
                                                                <motion.div
                                                                    key={`concept-${i}`}
                                                                    className="text-xs p-1 bg-gray-50 text-selectedText rounded"
                                                                    variants={{
                                                                        visible: {
                                                                            opacity: 1,
                                                                            x: 0,
                                                                            transition: {
                                                                                type: "spring",
                                                                                stiffness: 300,
                                                                                damping: 20,
                                                                                duration: 0.3,
                                                                            },
                                                                        },
                                                                        hidden: {
                                                                            opacity: 0,
                                                                            x: -20,
                                                                        },
                                                                    }}
                                                                >
                                                                    <div className="font-medium">{concept.Code}</div>
                                                                    <div className="truncate">{concept.Description}</div>
                                                                </motion.div>
                                                            ))}
                                                    </motion.div>
                                                    <button
                                                        className="text-xs text-tabBG mt-2 underline"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setSelectedEntity(segment.entity);
                                                            setShowAllConcepts(true);
                                                        }}
                                                    >
                                                        View all concepts
                                                    </button>
                                                </>
                                            )}
                                        </motion.div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>,
                        );
                    } else {
                        result.push(highlightedContent);
                    }
                } else {
                    result.push(
                        <span key={`text-${segment.start}-${segment.end}`} className="whitespace-pre-wrap">
                            {segment.text}
                        </span>,
                    );
                }
            } else {
                if (hasAnimated) {
                    result.push(
                        <span key={`text-${segment.start}-${segment.end}`} className="whitespace-pre-wrap">
                            {segment.text}
                        </span>,
                    );
                } else {
                    result.push(
                        <motion.span
                            key={`text-${segment.start}-${segment.end}`}
                            className="whitespace-pre-wrap"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                                duration: 0.3,
                                delay: index * 0.03,
                            }}
                        >
                            {segment.text}
                        </motion.span>,
                    );
                }
            }
        });

        return result;
    }

    const Legend = () => {
        return (
            <div className="flex flex-wrap gap-2 items-center">
                <AnimatePresence mode="wait">
                    {legendItems
                        .filter((item) => {
                            if (filterValue === "all") return true;
                            if (item.type === "trait" && item.label === filterValue) return true;
                            if (item.type === "attribute" && item.label.toUpperCase() === filterValue) return true;
                            return false;
                        })
                        .map((item, index) => (
                            <motion.div
                                key={`${item.label}-${index}`}
                                initial={{ opacity: 0, x: 0 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Badge
                                    variant="outline"
                                    className="text-xs py-0.5 px-2 whitespace-nowrap"
                                    style={{
                                        backgroundColor: item.type === "trait" ? `${item.color}` : "transparent",
                                        borderColor:
                                            item.type === "attribute"
                                                ? item.color
                                                : item.type === "trait"
                                                    ? item.color
                                                    : "transparent",
                                        borderWidth: item.type === "attribute" || item.type === "trait" ? "1px" : "0",
                                        borderBottomWidth: item.type === "attribute" ? "3px" : "1px",
                                        opacity: item.type === "trait" ? 0.8 : 1,
                                        color: item.type === "trait" ? "white" : "inherit",
                                        fontWeight: "500",
                                    }}
                                >
                                    {item.label}
                                </Badge>
                            </motion.div>
                        ))}
                </AnimatePresence>
            </div>
        );
    };

    const filteredConcepts = useMemo(() => {
        if (!selectedEntity?.ICD10CMConcepts) return [];

        const concepts = selectedEntity.ICD10CMConcepts.sort((a, b) => b.Score - a.Score);
        return concepts;
    }, [selectedEntity]);

    const ConceptsSidebar = () => {
        if (!selectedEntity || !selectedEntity.ICD10CMConcepts) return null;

        return (
            <Sheet open={showAllConcepts} onOpenChange={setShowAllConcepts}>
                <SheetContent className="w-full sm:max-w-md md:max-w-lg" side="right">
                    <SheetHeader>
                        <SheetTitle>{`ICD10 Concepts for "${selectedEntity.Text}"`}</SheetTitle>
                    </SheetHeader>

                    <div className="max-h-[calc(100vh-12rem)] mt-3 border overflow-auto">
                        {filteredConcepts.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="!font-semibold text-black">Code</TableHead>
                                        <TableHead className="!font-semibold text-black">Description</TableHead>
                                        <TableHead className="!font-semibold text-black">Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {filteredConcepts.map((concept, i) => (
                                            <motion.tr
                                                key={`concept-row-${concept.Code}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{
                                                    duration: 0.2,
                                                    delay: i < 20 ? i * 0.02 : 0,
                                                }}
                                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                            >
                                                <TableCell className="px-3 py-4 font-medium">{concept.Code}</TableCell>
                                                <TableCell className="px-3 py-4">{concept.Description}</TableCell>
                                                <TableCell className="px-3 py-4">{concept.Score.toFixed(3)}</TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <p className="text-muted-foreground">No matching concepts found</p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        );
    };

    const handleReset = () => {
        setFilterValue("all");
    };
    return (
        <div className="grid grid-cols-1 w-full h-full">
            <div className="h-full">
                <div className="pb-1 border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
                        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                            <div className="space-y-1 w-full sm:w-auto min-w-[200px]">
                                <Select value={filterValue} onValueChange={setFilterValue}>
                                    <SelectTrigger
                                        id="filter-value"
                                        className="h-8 text-xs border-gray-300 focus:ring-2 focus:ring-blue-500"
                                    >
                                        <SelectValue placeholder="Select filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key="filter-options"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {filterOptions
                                                    ?.filter((i) => {
                                                        const availableKeys = [
                                                            "all",
                                                            "SYMPTOM",
                                                            "DIAGNOSIS",
                                                            "SIGN",
                                                            "HYPOTHETICAL",
                                                            "QUALITY",
                                                            "DIRECTION",
                                                        ];
                                                        return availableKeys?.includes(i?.value);
                                                    })
                                                    .map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                            </motion.div>
                                        </AnimatePresence>
                                    </SelectContent>
                                </Select>
                            </div>
                            <AnimatePresence mode="wait">
                                {filterValue !== "all" && (
                                    <motion.div
                                        key="reset-button"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5, ease: "easeInOut" }}
                                    >
                                        <Button
                                            variant="blue"
                                            onClick={handleReset}
                                            className="h-8 px-2 lg:px-3"
                                        >
                                            <span className="hidden md:inline-block">Reset</span>
                                            <X className="md:ml-2 h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="mt-1 lg:mt-0 lg:ml-auto overflow-x-auto pb-1 w-full lg:w-auto">
                            <Legend />
                        </div>
                    </div>
                </div>
                <motion.div
                    ref={textContentRef}
                    className="p-4 overflow-auto max-h-[68vh] h-full text-sm sm:text-xl leading-relaxed sm:leading-[2rem] tracking-wide transition-colors duration-300 ease-in-out bg-white font-sans dark:bg-gray-950 text-gray-800 dark:text-gray-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {processedText}
                </motion.div>
            </div>
            <ConceptsSidebar />
        </div>
    );
}
