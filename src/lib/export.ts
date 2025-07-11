import type { Column, Row } from "@tanstack/react-table";

interface ExportOptions {
    filename: string
    excludeColumns?: string[]
}


export function exportFilteredTableToCSV<TData>(
    rows: Row<TData>[],
    columns: Column<TData, unknown>[],
    options: ExportOptions,
) {
    const { filename, excludeColumns = [] } = options;

    const exportColumns = columns.filter((column) => !excludeColumns.includes(column.id));
    const csvContent = [
        exportColumns
            .map((column) => {
                const title = column.id;
                return title && title[0].toUpperCase() + title.slice(1);
            })
            .join(","),
        ...rows.map((row) => {
            return exportColumns
                .map((column) => {
                    const cellValue =
                        column.id === "Name"
                            ? ""
                            : column.accessorFn
                                ? column.accessorFn(row.original, row.index)
                                : row.getValue(column.id);
                    return `"${cellValue}"`;
                })
                .join(",");
        }
        ),
    ].join("\n");

    /* const csvContent = [
        exportColumns
            .map((column) => `"${column.id}"`)
            .join(","),
        ...rows.map((row) =>
            exportColumns
                .map((column) => {
                    const allData = row?.original as DraftDataTypes;
                    const cellValue =
                        column.id === "Name"
                            ? `${allData?.firstName ?? ""} ${allData?.lastName ?? ""}`.trim()
                            : column.accessorFn
                                ? column.accessorFn(row.original, row.index)
                                : row.getValue(column.id);
                    return `"${cellValue}"`;
                })
                .join(","),
        ),
    ].join("\n"); */


    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

