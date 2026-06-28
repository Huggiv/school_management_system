import { AdmissionStatusBadge } from "@/features/admissions/components/AdmissionStatusBadge";
import type { AdmissionRecord } from "@/features/admissions/types";

interface AdmissionsTableProps {
  items: AdmissionRecord[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onOpenNotes: (item: AdmissionRecord) => void;
}

export function AdmissionsTable({
  items,
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
