import { useMemo, useState } from "react";

import {
  AdmissionFilters,
  type AdmissionExportColumn,
} from "@/features/admissions/components/AdmissionFilters";
import { AdmissionsTable } from "@/features/admissions/components/AdmissionsTable";
import { useAdmissionExport } from "@/features/admissions/hooks/useAdmissionExport";
import {
  useAddAdmissionNote,
  useAdmissionDecisionLog,
  useAdmissionNotes,
} from "@/features/admissions/hooks/useAdmissionNotes";
import { useAdmissionsManagement } from "@/features/admissions/hooks/useAdmissionsManagement";
import { useAssignAdmissionReviewer } from "@/features/admissions/hooks/useAssignAdmissionReviewer";
import { useBulkUpdateAdmissionsStatus } from "@/features/admissions/hooks/useBulkUpdateAdmissionsStatus";
import type { AdmissionRecord, AdmissionStatusOption } from "@/features/admissions/types";

export function ApplicationManagementPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdmissionStatusOption>("all");
  const [classNameFilter, setClassNameFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<Exclude<AdmissionStatusOption, "all">>("pending");
  const [decisionReason, setDecisionReason] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [activeAdmission, setActiveAdmission] = useState<AdmissionRecord | null>(null);
  const [noteText, setNoteText] = useState("");
  const [exportColumns, setExportColumns] = useState<AdmissionExportColumn[]>([
    "application_number",
    "student_name",
    "class_name",
    "status",
  ]);

  const managementFilters = useMemo(
    () => ({
      search,
      status: statusFilter,
      className: classNameFilter,
      fromDate,
      toDate,
    }),
    [search, statusFilter, classNameFilter, fromDate, toDate],
  );

  const { data } = useAdmissionsManagement(managementFilters);
  const filtered = data?.items ?? [];
  const exportAdmissions = useAdmissionExport();
  const bulkStatusMutation = useBulkUpdateAdmissionsStatus();
  const assignReviewerMutation = useAssignAdmissionReviewer();
  const { data: notes = [] } = useAdmissionNotes(activeAdmission?.id ?? null);
  const { data: decisionLog = [] } = useAdmissionDecisionLog(activeAdmission?.id ?? null);
  const addNoteMutation = useAddAdmissionNote(activeAdmission?.id ?? null);

  const hasSelection = selectedIds.length > 0;

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
        <AdmissionFilters
          search={search}
          statusFilter={statusFilter}
          classNameFilter={classNameFilter}
          fromDate={fromDate}
          toDate={toDate}
          exportColumns={exportColumns}
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
          onClassNameChange={setClassNameFilter}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onExportColumnsChange={setExportColumns}
          onExport={() => exportAdmissions(filtered, exportColumns)}
        />

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
            disabled={!hasSelection || !decisionReason.trim() || bulkStatusMutation.isPending}
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

          <input
            type="text"
            placeholder="Reviewer name"
            value={reviewerName}
            onChange={(event) => setReviewerName(event.target.value)}
          />
          <button
            type="button"
            disabled={!hasSelection || !reviewerName.trim() || assignReviewerMutation.isPending}
            onClick={() => {
              assignReviewerMutation.mutate(
                { ids: selectedIds, reviewer_name: reviewerName.trim() },
                {
                  onSuccess: () => {
                    setSelectedIds([]);
                  },
                },
              );
            }}
          >
            Assign Reviewer to Selected
          </button>
        </div>

        <div className="table-wrap">
          <AdmissionsTable
            items={filtered}
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
