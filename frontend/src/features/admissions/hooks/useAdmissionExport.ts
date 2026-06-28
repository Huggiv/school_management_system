import type { AdmissionRecord } from "@/features/admissions/types";

function escapeCsv(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function useAdmissionExport() {
  return (items: AdmissionRecord[]) => {
    const header = "id,application_number,student_name,status";
    const rows = items.map((item) =>
      [
        String(item.id),
        escapeCsv(item.application_number),
        escapeCsv(item.student_name),
        escapeCsv(item.status),
      ].join(","),
    );

    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admissions-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
}
