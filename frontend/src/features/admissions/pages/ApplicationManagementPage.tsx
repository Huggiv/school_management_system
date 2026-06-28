import { useMemo, useState } from "react";

import { AdmissionsTable } from "@/features/admissions/components/AdmissionsTable";
import {
  useAddAdmissionNote,
  useAdmissionDecisionLog,
  useAdmissionNotes,
} from "@/features/admissions/hooks/useAdmissionNotes";
import { useAdmissionsManagement } from "@/features/admissions/hooks/useAdmissionsManagement";
import { useBulkUpdateAdmissionsStatus } from "@/features/admissions/hooks/useBulkUpdateAdmissionsStatus";
import type { AdmissionRecord, AdmissionStatusOption } from "@/features/admissions/types";

const ALLOWED_STATUS_TRANSITIONS: Record<Exclude<AdmissionStatusOption, "all">, Exclude<AdmissionStatusOption, "all">[]> = {
  pending: ["under_review"],
  under_review: ["accepted", "rejected", "waitlisted"],
  waitlisted: ["under_review", "accepted", "rejected"],
  accepted: [],
  rejected: [],
};

export function ApplicationManagementPage() {
  const [applicationFilter, setApplicationFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdmissionStatusOption>("all");
  const [classNameFilter, setClassNameFilter] = useState("");
  const [submittedDateFilter, setSubmittedDateFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<Exclude<AdmissionStatusOption, "all">>("pending");
  const [decisionReason, setDecisionReason] = useState("");
  const [activeAdmission, setActiveAdmission] = useState<AdmissionRecord | null>(null);
  const [noteText, setNoteText] = useState("");

  const managementFilters = useMemo(() => ({ search: "", status: "all" as const, className: "", fromDate: "", toDate: "" }), []);

  const { data } = useAdmissionsManagement(managementFilters);
  const filtered = useMemo(() => {
    const applicationTerm = applicationFilter.trim().toLowerCase();
    const studentTerm = studentFilter.trim().toLowerCase();
    const classTerm = classNameFilter.trim().toLowerCase();

    return (data?.items ?? []).filter((item) => {
      const applicationMatches =
        !applicationTerm || item.application_number.toLowerCase().includes(applicationTerm);
      const studentMatches = !studentTerm || item.student_name.toLowerCase().includes(studentTerm);
      const statusMatches = statusFilter === "all" || item.status === statusFilter;
      const classMatches = !classTerm || (item.class_name ?? "").toLowerCase().includes(classTerm);
      const submittedDateMatches =
        !submittedDateFilter ||
        (item.created_at ? item.created_at.slice(0, 10) === submittedDateFilter : false);

      return applicationMatches && studentMatches && statusMatches && classMatches && submittedDateMatches;
    });
  }, [applicationFilter, studentFilter, statusFilter, classNameFilter, submittedDateFilter, data?.items]);

  const bulkStatusMutation = useBulkUpdateAdmissionsStatus();
  const { data: notes = [] } = useAdmissionNotes(activeAdmission?.id ?? null);
  const { data: decisionLog = [] } = useAdmissionDecisionLog(activeAdmission?.id ?? null);
  const addNoteMutation = useAddAdmissionNote(activeAdmission?.id ?? null);

  const hasSelection = selectedIds.length > 0;
  const selectedRows = useMemo(
    () => (data?.items ?? []).filter((item) => selectedIds.includes(item.id)),
    [data?.items, selectedIds],
  );
  const canApplySelectedStatus = useMemo(
    () =>
      selectedRows.every((item) => {
        const current = item.status as Exclude<AdmissionStatusOption, "all">;
        return current === bulkStatus || ALLOWED_STATUS_TRANSITIONS[current]?.includes(bulkStatus);
      }),
    [bulkStatus, selectedRows],
  );

  function toggleSelect(id: number): void {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function toggleSelectAll(): void {
    const visibleIds = filtered.map((item) => item.id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  }

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Application Management</h1>

        <div className="toolbar management-actions">
          <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value as Exclude<AdmissionStatusOption, "all">)}>
            <option value="pending">Set Pending</option>
            <option value="under_review">Set Under Review</option>
            <option value="waitlisted">Set Waitlisted</option>
            <option value="accepted">Set Accepted</option>
            <option value="rejected">Set Rejected</option>
          </select>
          <input
            type="text"
            placeholder="Decision reason (required for audit)"
            value={decisionReason}
            onChange={(event) => setDecisionReason(event.target.value)}
          />
          <button
            type="button"
            disabled={!hasSelection || !decisionReason.trim() || !canApplySelectedStatus || bulkStatusMutation.isPending}
            onClick={() => {
              bulkStatusMutation.mutate(
                {
                  ids: selectedIds,
                  status: bulkStatus,
                  actor: "admin",
                  reason: decisionReason.trim(),
                },
                {
                  onSuccess: () => {
                    setSelectedIds([]);
                    setDecisionReason("");
                  },
                },
              );
            }}
          >
            Apply Status to Selected
          </button>
          {!canApplySelectedStatus && hasSelection ? (
            <small className="field-error">Some selected applications cannot move to this status. Choose a valid transition.</small>
          ) : null}
        </div>

        <div className="table-wrap">
          <AdmissionsTable
            items={filtered}
            filters={{
              application: applicationFilter,
              student: studentFilter,
              status: statusFilter,
              className: classNameFilter,
              submittedDate: submittedDateFilter,
            }}
            onFilterChange={{
              application: setApplicationFilter,
              student: setStudentFilter,
              status: setStatusFilter,
              className: setClassNameFilter,
              submittedDate: setSubmittedDateFilter,
            }}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onOpenNotes={(item) => {
              setActiveAdmission(item);
              setNoteText("");
            }}
          />
        </div>
      </section>

      {activeAdmission && (
        <section className="panel notes-panel">
          <h2>Note History: {activeAdmission.application_number}</h2>
          {notes.length === 0 ? <p>No notes yet.</p> : null}
          {notes.map((note, index) => (
            <article key={`${note.timestamp}-${index}`} className="note-item">
              <strong>{note.author}</strong>
              <p>{note.note}</p>
              <small>{note.timestamp}</small>
            </article>
          ))}
          <div className="toolbar">
            <input
              type="text"
              placeholder="Add a decision or review note"
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
            />
            <button
              type="button"
              disabled={!noteText.trim() || addNoteMutation.isPending}
              onClick={() => {
                addNoteMutation.mutate(
                  { note: noteText.trim(), author: "admin" },
                  {
                    onSuccess: () => {
                      setNoteText("");
                    },
                  },
                );
              }}
            >
              Add Note
            </button>
            <button type="button" onClick={() => setActiveAdmission(null)}>
              Close
            </button>
          </div>

          <h3>Decision Audit Log</h3>
          {decisionLog.length === 0 ? <p>No decision transitions recorded yet.</p> : null}
          {decisionLog.map((entry, index) => (
            <article key={`${entry.timestamp}-${index}`} className="note-item">
              <strong>
                {entry.from_status}
                {" -> "}
                {entry.to_status}
              </strong>
              <p>
                Actor: {entry.actor} | Source: {entry.source}
              </p>
              <p>{entry.reason || "No reason provided"}</p>
              <small>{entry.timestamp}</small>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
