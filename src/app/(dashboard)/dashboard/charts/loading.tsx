import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


const DocumentLoading = () => {
    return <div className="flex relative flex-col items-center justify-center h-full w-full">
        <div className="absolute">
            <div className="flex justify-center flex-col items-center">
                <Loader2 className="h-10 w-10 text-selectedText animate-spin duration-[2000ms] mb-4" />
                <p className="text-selectedText">Loading document...</p>
            </div>
        </div>
        <div className="w-full h-full space-y-3 p-3">
            <Skeleton className="h-full w-full" />
        </div>
    </div>;
};
export default function ChartsLoader() {
    return (
        <div className="w-full h-full p-[1.5rem] space-y-[1rem]">
            loader...
        </div>
    );
}

export { DocumentLoading };
