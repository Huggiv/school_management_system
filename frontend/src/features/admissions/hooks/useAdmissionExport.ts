import type { AdmissionExportColumn } from "@/features/admissions/components/AdmissionFilters";
import type { AdmissionRecord } from "@/features/admissions/types";

function escapeCsv(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function useAdmissionExport() {
  return (items: AdmissionRecord[], columns: AdmissionExportColumn[]) => {
    const selectedColumns = columns.length
      ? columns
      : (["id", "application_number", "student_name", "status"] as AdmissionExportColumn[]);

    const header = selectedColumns.join(",");
    const rows = items.map((item) => {
      const values = selectedColumns.map((column) => {
        const value = item[column] ?? "";
        return escapeCsv(String(value));
      });
      return values.join(",");
    });

    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admissions-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
}
