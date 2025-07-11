interface IcdSuggestionIconProps {
    className?: string
    size?: number
    strokeWidth?: number
}

// Simplified version focusing on add + code concept
export function IcdSuggestionIconSimple({ className = "h-10 w-10", size = 30, strokeWidth = 3 }: IcdSuggestionIconProps) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 22 22"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Code brackets */}
            <path d="m7 8-4 4 4 4" />
            <path d="m17 8 4 4-4 4" />

            {/* Plus in center with slight offset for better visual balance */}
            <path d="M12 9v6" />
            <path d="M9 12h6" />
        </svg>
    );
}

