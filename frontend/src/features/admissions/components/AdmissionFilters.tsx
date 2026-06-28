import type { AdmissionStatusOption } from "@/features/admissions/types";

interface AdmissionFiltersProps {
  search: string;
  statusFilter: AdmissionStatusOption;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AdmissionStatusOption) => void;
  onExport: () => void;
}

export function AdmissionFilters({
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onExport,
}: AdmissionFiltersProps) {
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
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
      </select>
      <button onClick={onExport} type="button">
        Export CSV
      </button>
    </div>
  );
}
