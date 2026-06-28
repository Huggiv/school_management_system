import type { AdmissionStatusOption } from "@/features/admissions/types";

interface AdmissionFiltersProps {
  search: string;
  statusFilter: AdmissionStatusOption;
  classNameFilter: string;
  fromDate: string;
  toDate: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AdmissionStatusOption) => void;
  onClassNameChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
}

export function AdmissionFilters({
  search,
  statusFilter,
  classNameFilter,
  fromDate,
  toDate,
  onSearchChange,
  onStatusChange,
  onClassNameChange,
  onFromDateChange,
  onToDateChange,
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
    </div>
  );
}
