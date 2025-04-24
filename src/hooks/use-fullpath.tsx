import { usePathname, useSearchParams } from "next/navigation";

const useFullPath = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const fullPath = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

    const pathSegments = pathname.split("/").filter(Boolean);
    const first = `${pathSegments.slice(0, 2).join("/")}/`;
    const target = pathSegments[2] || "";

    // Function to get query params with optional formatting
    const getQueryParam = (key: string) => {
        const value = searchParams.get(key);
        return value ? value.replace(/-/g, " ") : null;
    };

    return {
        fullPath,
        path: pathname,
        params: searchParams,
        charts: first,
        target,
        getQueryParam
    };
};

export default useFullPath;
