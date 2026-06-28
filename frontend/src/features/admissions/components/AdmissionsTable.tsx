import { AdmissionStatusBadge } from "@/features/admissions/components/AdmissionStatusBadge";
import type { AdmissionRecord, AdmissionStatusOption } from "@/features/admissions/types";

interface AdmissionsTableFilters {
  application: string;
  student: string;
  status: AdmissionStatusOption;
  className: string;
  submittedDate: string;
}

interface AdmissionsTableFilterHandlers {
  application: (value: string) => void;
  student: (value: string) => void;
  status: (value: AdmissionStatusOption) => void;
  className: (value: string) => void;
  submittedDate: (value: string) => void;
}

interface AdmissionsTableProps {
  items: AdmissionRecord[];
  filters: AdmissionsTableFilters;
  onFilterChange: AdmissionsTableFilterHandlers;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onOpenNotes: (item: AdmissionRecord) => void;
}

export function AdmissionsTable({
  items,
  filters,
  onFilterChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onOpenNotes,
}: AdmissionsTableProps) {
  if (!items.length) {
    return <p>No admission applications found.</p>;
  }

  const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  return (
    <table className="table">
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              aria-label="Select all admissions"
              checked={allSelected}
              onChange={onToggleSelectAll}
            />
          </th>
          <th>Application</th>
          <th>Student</th>
          <th>Class</th>
          <th>Status</th>
          <th>Submitted</th>
          <th>Actions</th>
        </tr>
        <tr className="table-filter-row">
          <th></th>
          <th>
            <input
              type="text"
              placeholder="Filter application"
              value={filters.application}
              onChange={(event) => onFilterChange.application(event.target.value)}
            />
          </th>
          <th>
            <input
              type="text"
              placeholder="Filter student"
              value={filters.student}
              onChange={(event) => onFilterChange.student(event.target.value)}
            />
          </th>
          <th>
            <input
              type="text"
              placeholder="Filter class"
              value={filters.className}
              onChange={(event) => onFilterChange.className(event.target.value)}
            />
          </th>
          <th>
            <select
              value={filters.status}
              onChange={(event) => onFilterChange.status(event.target.value as AdmissionStatusOption)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </th>
          <th>
            <input
              type="date"
              value={filters.submittedDate}
              onChange={(event) => onFilterChange.submittedDate(event.target.value)}
            />
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>
              <input
                type="checkbox"
                aria-label={`Select admission ${item.application_number}`}
                checked={selectedIds.includes(item.id)}
                onChange={() => onToggleSelect(item.id)}
              />
            </td>
            <td>{item.application_number}</td>
            <td>{item.student_name}</td>
            <td>{item.class_name || "-"}</td>
            <td>
              <AdmissionStatusBadge status={item.status} />
            </td>
            <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}</td>
            <td>
              <button type="button" onClick={() => onOpenNotes(item)}>
                Notes
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
