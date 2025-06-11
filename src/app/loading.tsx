export default function Loading() {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
            style={{
                willChange: "opacity",
                contain: "layout style paint"
            }}
        >
            <div
                className="relative"
                style={{
                    willChange: "transform",
                    contain: "layout style paint"
                }}
            >
                <div
                    className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
                    style={{
                        willChange: "transform",
                        contain: "layout style paint"
                    }}
                />
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                        willChange: "opacity",
                        contain: "layout style paint"
                    }}
                >
                    <div
                        className="h-8 w-8 animate-pulse rounded-full bg-primary/20"
                        style={{
                            willChange: "opacity",
                            contain: "layout style paint"
                        }}
                    />
                </div>
            </div>
        </div>
    );
} 