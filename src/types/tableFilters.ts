import { compareAsc, format, isValid, parse } from "date-fns";

export const dateFilterFn = (
    row: { original: Record<string, string> },
    id: string,
    value: string
): boolean => {
    const dateStr = row.original[id]; // expected as MM/dd/yyyy string
    const filterValue = value?.trim().replace(/-/g, "/"); // normalize to use slashes

    if (!dateStr || !filterValue) return false;

    try {
        // Normalize both dates
        const rowDate = parse(dateStr, "MM/dd/yyyy", new Date());
        if (!isValid(rowDate)) return false;

        const formattedRowDate = format(rowDate, "MM/dd/yyyy");

        // Allow partial match, e.g., "07/09", "2025", etc.
        return formattedRowDate.includes(filterValue);
    } catch {
        return false;
    }
};

/* export const reviewDateFilterFn = (
    row: Row<ReviewDataTypes>,
    id: string,
    value: string
): boolean => {
    const dateStr = row.getValue(id) as string; // expected as MM/dd/yyyy string
    const filterValue = value?.trim().replace(/-/g, "/"); // normalize to use slashes

    if (!dateStr || !filterValue) return false;

    try {
        const rowDate = parse(dateStr, "MM/dd/yyyy", new Date());
        if (!isValid(rowDate)) return false;

        const formattedRowDate = format(rowDate, "MM/dd/yyyy");

        return formattedRowDate.includes(filterValue);
    } catch {
        return false;
    }
}; */

export const NumFilter = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    row: { getValue: (key: string) => any },
    id: string,
    value: string
): boolean => {
    const rowValue = String(row.getValue(id) ?? "").toLowerCase();
    const filterValue = String(value ?? "").trim().toLowerCase();

    return rowValue.includes(filterValue);
};


export const NumShorting = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rowA: { getValue: (columnId: string) => any },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rowB: { getValue: (columnId: string) => any },
    columnId: string
): number => {
    const valueA = rowA.getValue(columnId) as string;
    const valueB = rowB.getValue(columnId) as string;

    const numA = parseInt(valueA?.split("_")[0], 10);
    const numB = parseInt(valueB?.split("_")[0], 10);

    return (isNaN(numA) ? 0 : numA) - (isNaN(numB) ? 0 : numB);
};

export const DateShorting = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rowA: { getValue: (columnId: string) => any },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rowB: { getValue: (columnId: string) => any },
    columnId: string
): number => {
    const rawValueA = rowA.getValue(columnId);
    const rawValueB = rowB.getValue(columnId);

    const dateA = parseDateFlexible(rawValueA);
    const dateB = parseDateFlexible(rawValueB);

    if (!isValid(dateA) && !isValid(dateB)) return 0;
    if (!isValid(dateA)) return 1; // invalid dates pushed to bottom
    if (!isValid(dateB)) return -1;

    return compareAsc(dateA, dateB); // ascending sort
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseDateFlexible = (value: any): Date => {
    if (value instanceof Date && isValid(value)) return value;

    const stringValue = String(value).trim();

    const possibleFormats = ["MM/dd/yyyy", "MM-dd-yyyy", "yyyy-MM-dd", "yyyy/MM/dd"];

    for (const fmt of possibleFormats) {
        const parsed = parse(stringValue, fmt, new Date());
        if (isValid(parsed)) return parsed;
    }

    const fallback = new Date(stringValue);
    return isValid(fallback) ? fallback : new Date("");
};

export const NameFilter = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    row: { original: { [key: string]: any } },
    id: string,
    value: string
): boolean => {
    const firstName = String(row.original.firstName || "").toLowerCase();
    const lastName = String(row.original.lastName || "").toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    const filterValue = String(value ?? "").trim().toLowerCase();

    return fullName.includes(filterValue);
};

export const NameShorting = (
    rowA: { original: { firstName?: string; lastName?: string } },
    rowB: { original: { firstName?: string; lastName?: string } }
): number => {
    const rowAName = `${rowA.original.firstName ?? ""} ${rowA.original.lastName ?? ""}`.trim().toLowerCase();
    const rowBName = `${rowB.original.firstName ?? ""} ${rowB.original.lastName ?? ""}`.trim().toLowerCase();

    return rowAName.localeCompare(rowBName);
};


export const stringFilter = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    row: { getValue: (id: string) => any },
    id: string,
    value: string
): boolean => {
    const rowValue = String(row.getValue(id) ?? "").toLowerCase();
    const filterValue = String(value ?? "").trim().toLowerCase();

    return rowValue.includes(filterValue);
};
