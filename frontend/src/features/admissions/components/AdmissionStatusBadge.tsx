interface AdmissionStatusBadgeProps {
  status: string;
}

export function AdmissionStatusBadge({ status }: AdmissionStatusBadgeProps) {
  const normalized = status.toLowerCase();
  return <span className={`admission-status ${normalized}`}>{status}</span>;
}
