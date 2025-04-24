"use client"
import { useState, useCallback } from "react"
import type { Props } from "react-select"
import CreatableReactSelect from "react-select/creatable"
import { cn } from "@/lib/utils"
import { components } from "react-select"
import type { GroupBase, OptionProps } from "react-select"
import { ChevronDown } from 'lucide-react'

export interface Option {
    label: string
    value: string
}

export interface CreatableSelectProps extends Props {
    isMulti?: boolean
}

// Custom Option component to handle the "+X more" indicator
const CustomOption = (props: OptionProps<any, boolean, GroupBase<any>>) => {
    // Check if this is our special "more options" option
    if (props.data.__isMoreOptions) {
        return (
            <div
                className="cursor-pointer px-3 py-2 text-sm font-medium text-center bg-muted hover:bg-muted/80 flex items-center justify-center gap-1"
                onClick={props.data.onClick}
            >
                Show all {props.data.totalCount} options
                <ChevronDown className="h-3 w-3" />
            </div>
        )
    }

    // Otherwise render the standard option
    return <components.Option {...props} />
}

export const CreatableSelect = ({ className, isMulti = false, ...props }: CreatableSelectProps) => {
    const [showAllOptions, setShowAllOptions] = useState(false)
    const MAX_VISIBLE_OPTIONS = 10

    // Function to filter and limit options
    const filterOptions = useCallback((options: any[]) => {
        if (!options || showAllOptions) return options

        if (options.length <= MAX_VISIBLE_OPTIONS) return options

        // Create a "more options" option
        const moreOptionsItem = {
            label: `+${options.length - MAX_VISIBLE_OPTIONS} more`,
            value: "__more_options__",
            __isMoreOptions: true,
            totalCount: options.length,
            onClick: (e: React.MouseEvent) => {
                e.preventDefault()
                e.stopPropagation()
                setShowAllOptions(true)
            }
        }

        // Return limited options plus the "more" indicator
        return [...options.slice(0, MAX_VISIBLE_OPTIONS), moreOptionsItem]
    }, [showAllOptions])

    return (
        <CreatableReactSelect
            isMulti={isMulti}
            className={cn("w-full", className)}
            classNames={{
                control: (state) =>
                    cn(
                        "border !border-input-border border-input bg-background !rounded-none py-1 text-sm ring-offset-background",
                        state.isFocused ? "ring-2 ring-ring ring-offset-2" : "",
                        state.isDisabled ? "opacity-50 cursor-not-allowed" : "",
                    ),
                placeholder: () => "text-muted-foreground",
                input: () => "text-foreground",
                option: (state) =>
                    cn(
                        "cursor-pointer px-3 py-2 text-sm",
                        state.isFocused ? "bg-accent" : "",
                        state.isSelected ? "bg-primary text-primary-foreground" : "",
                    ),
                multiValue: () => "bg-accent rounded-md px-1 py-0.5 mr-1",
                multiValueLabel: () => "text-sm",
                multiValueRemove: () => "ml-1 text-muted-foreground hover:text-foreground",
                menu: () => "bg-background border border-input rounded-md mt-1 overflow-hidden",
                menuList: () => "p-1 max-h-[200px] overflow-y-auto scrollbar-thin",
                noOptionsMessage: () => "text-muted-foreground p-2 text-sm",
            }}
            components={{
                Option: CustomOption,
                ...props.components
            }}
            filterOption={(option, inputValue) => {
                // Don't filter out our special "more options" item
                if ((option.data as any).__isMoreOptions) return true

                // Default filtering behavior for other options
                return option.label.toLowerCase().includes(inputValue.toLowerCase())
            }}
            onMenuOpen={() => {
                // Reset the show all flag when menu opens
                setShowAllOptions(false)
            }}
            {...props}
        />
    )
}
