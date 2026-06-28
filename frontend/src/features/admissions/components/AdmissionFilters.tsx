import type { AdmissionStatusOption } from "@/features/admissions/types";

export type AdmissionExportColumn =
  | "id"
  | "application_number"
  | "student_name"
  | "class_name"
  | "status"
  | "reviewer_name"
  | "created_at";

interface AdmissionFiltersProps {
  search: string;
  statusFilter: AdmissionStatusOption;
  classNameFilter: string;
  fromDate: string;
  toDate: string;
  exportColumns: AdmissionExportColumn[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AdmissionStatusOption) => void;
  onClassNameChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onExportColumnsChange: (value: AdmissionExportColumn[]) => void;
  onExport: () => void;
}

export function AdmissionFilters({
  search,
  statusFilter,
  classNameFilter,
  fromDate,
  toDate,
  exportColumns,
  onSearchChange,
  onStatusChange,
  onClassNameChange,
  onFromDateChange,
  onToDateChange,
  onExportColumnsChange,
  onExport,
}: AdmissionFiltersProps) {
  const columnOptions: Array<{ value: AdmissionExportColumn; label: string }> = [
    { value: "id", label: "ID" },
    { value: "application_number", label: "Application" },
    { value: "student_name", label: "Student" },
    { value: "class_name", label: "Class" },
    { value: "status", label: "Status" },
    { value: "reviewer_name", label: "Reviewer" },
    { value: "created_at", label: "Submitted At" },
  ];

  return (
    <div className="toolbar">
      <input
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by student or application"
        value={search}
      />
      <select
        onChange={(event) => onStatusChange(event.target.value as AdmissionStatusOption)}
        value={statusFilter}
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="under_review">Under Review</option>
        <option value="waitlisted">Waitlisted</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
      </select>
      <input
        onChange={(event) => onClassNameChange(event.target.value)}
        placeholder="Class / Grade"
        value={classNameFilter}
      />
      <input type="date" value={fromDate} onChange={(event) => onFromDateChange(event.target.value)} />
      <input type="date" value={toDate} onChange={(event) => onToDateChange(event.target.value)} />

      <label className="export-columns-wrap" htmlFor="admission-export-columns">
        <span>CSV Columns</span>
        <select
          id="admission-export-columns"
          multiple
          value={exportColumns}
          onChange={(event) => {
            const selected = Array.from(event.target.selectedOptions).map(
              (option) => option.value as AdmissionExportColumn,
            );
            onExportColumnsChange(selected);
          }}
        >
          {columnOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button onClick={onExport} type="button">
        Export CSV
      </button>
    </div>
  );
}
