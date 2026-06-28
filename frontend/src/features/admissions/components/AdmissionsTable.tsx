import { AdmissionStatusBadge } from "@/features/admissions/components/AdmissionStatusBadge";
import type { AdmissionRecord } from "@/features/admissions/types";

interface AdmissionsTableProps {
  items: AdmissionRecord[];
}

export function AdmissionsTable({ items }: AdmissionsTableProps) {
  if (!items.length) {
    return <p>No admission applications found.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Application</th>
          <th>Student</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.application_number}</td>
            <td>{item.student_name}</td>
            <td>
              <AdmissionStatusBadge status={item.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
