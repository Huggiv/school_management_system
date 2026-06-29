import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AdmissionsTable } from "@/features/admissions/components/AdmissionsTable";
import { useAdmissionsManagement } from "@/features/admissions/hooks/useAdmissionsManagement";
import { useBulkUpdateAdmissionsStatus } from "@/features/admissions/hooks/useBulkUpdateAdmissionsStatus";
import type { AdmissionRecord, AdmissionStatusOption } from "@/features/admissions/types";
import { apiClient, mapApiError } from "@/lib/api/client";

const ALLOWED_STATUS_TRANSITIONS: Record<Exclude<AdmissionStatusOption, "all">, Exclude<AdmissionStatusOption, "all">[]> = {
  pending: ["under_review"],
  under_review: ["accepted", "rejected", "waitlisted"],
  waitlisted: ["under_review", "accepted", "rejected"],
  accepted: [],
  rejected: [],
};

export function ApplicationManagementPage() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<Exclude<AdmissionStatusOption, "all">>("pending");
  const [decisionReason, setDecisionReason] = useState("");
  const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);
  const [editAdmission, setEditAdmission] = useState<AdmissionRecord | null>(null);
  const [editStudentName, setEditStudentName] = useState("");
  const [editClassName, setEditClassName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editContact, setEditContact] = useState("");

  const managementFilters = useMemo(() => ({ search: "", status: "all" as const, className: "", fromDate: "", toDate: "" }), []);

  const { data } = useAdmissionsManagement(managementFilters);
  const allItems = useMemo(() => data?.items ?? [], [data?.items]);

  const tableItems = useMemo(
    () =>
      allItems.map((item) => {
        let documentPath: string | undefined;
        try {
          const notes = JSON.parse(item.notes_json ?? "[]") as Array<{ document_path?: string }>;
          for (let idx = notes.length - 1; idx >= 0; idx -= 1) {
            const path = notes[idx]?.document_path;
            if (path && typeof path === "string") {
              documentPath = path;
              break;
            }
          }
        } catch {
          documentPath = undefined;
        }
        return {
          ...item,
          document_path: documentPath,
        };
      }),
    [allItems],
  );

  const updateAdmissionMutation = useMutation({
    mutationFn: async ({ itemId, payload }: { itemId: number; payload: Record<string, string | null> }) => {
      await apiClient.put(`/api/v1/admissions/${itemId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions-management"] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });

  const deleteAdmissionMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await apiClient.delete(`/api/v1/admissions/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions-management"] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });

  const bulkStatusMutation = useBulkUpdateAdmissionsStatus();

  const hasSelection = selectedIds.length > 0;
  const selectedRows = useMemo(
    () => tableItems.filter((item) => selectedIds.includes(item.id)),
    [tableItems, selectedIds],
  );
  const eligibleSelectedIds = useMemo(
    () =>
      selectedRows
        .filter((item) => {
          const current = item.status as Exclude<AdmissionStatusOption, "all">;
          const allowedTargets = ALLOWED_STATUS_TRANSITIONS[current];
          if (!allowedTargets) {
            return true;
          }
          return current === bulkStatus || allowedTargets.includes(bulkStatus);
        })
        .map((item) => item.id),
    [bulkStatus, selectedRows],
  );
  const blockedTransitionCount = selectedRows.length - eligibleSelectedIds.length;

  function formatMoney(value: number | undefined): string {
    return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value ?? 0);
  }

  function printApplication(item: AdmissionRecord): void {
    const popup = window.open("", "_blank", "width=1000,height=800");
    if (!popup) {
      return;
    }
    popup.document.write(`
      <html>
        <head>
          <title>Application ${item.application_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 28px; color: #102236; }
            h1 { margin-bottom: 4px; }
            .school-meta { margin-bottom: 18px; color: #254b72; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #d2deed; padding: 9px; text-align: left; }
            th { width: 34%; background: #f2f8ff; }
            .footer { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
            .sig { border-top: 1px solid #333; padding-top: 8px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Sunrise Public School</h1>
          <div class="school-meta">123 Education Street, Bengaluru, Karnataka 560001 | +91 80 1234 5678</div>
          <h2>Admission Application</h2>
          <table>
            <tr><th>Application Number</th><td>${item.application_number}</td></tr>
            <tr><th>Student Name</th><td>${item.student_name}</td></tr>
            <tr><th>Class / Grade</th><td>${item.class_name ?? "-"}</td></tr>
            <tr><th>Email</th><td>${item.email ?? "-"}</td></tr>
            <tr><th>Contact Number</th><td>${item.contact_number ?? "-"}</td></tr>
            <tr><th>Status</th><td>${item.status}</td></tr>
            <tr><th>Total Fee</th><td>Rs. ${formatMoney(item.fee_total)}</td></tr>
            <tr><th>Paid Fee</th><td>Rs. ${formatMoney(item.fee_paid)}</td></tr>
            <tr><th>Pending Fee</th><td>Rs. ${formatMoney(item.fee_pending)}</td></tr>
          </table>
          <div class="footer">
            <div class="sig">Date: ${new Date().toLocaleDateString()}</div>
            <div class="sig">Student Signature</div>
            <div class="sig">Parent Signature</div>
          </div>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
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
            disabled={!hasSelection || !decisionReason.trim() || eligibleSelectedIds.length === 0 || bulkStatusMutation.isPending}
            onClick={() => {
              setBulkFeedback(null);
              bulkStatusMutation.mutate(
                {
                  ids: eligibleSelectedIds,
                  status: bulkStatus,
                  actor: "admin",
                  reason: decisionReason.trim(),
                },
                {
                  onSuccess: (updatedCount) => {
                    setSelectedIds([]);
                    setDecisionReason("");
                    const updatedMessage =
                      updatedCount > 0
                        ? `Bulk status update completed for ${updatedCount} application${updatedCount === 1 ? "" : "s"}.`
                        : "Bulk status update finished with no record changes.";
                    const skippedMessage =
                      blockedTransitionCount > 0
                        ? ` Skipped ${blockedTransitionCount} application${blockedTransitionCount === 1 ? "" : "s"} due to invalid status transition.`
                        : "";
                    setBulkFeedback(`${updatedMessage}${skippedMessage}`);
                  },
                  onError: (error) => {
                    setBulkFeedback(`Bulk status update failed. ${mapApiError(error).message}`);
                  },
                },
              );
            }}
          >
            Apply Status to Selected
          </button>
          {blockedTransitionCount > 0 && hasSelection ? (
            <small className="field-error">
              {blockedTransitionCount} selected application{blockedTransitionCount === 1 ? "" : "s"} cannot move to this status and will be skipped.
            </small>
          ) : null}
          {bulkFeedback ? <small className="bulk-feedback">{bulkFeedback}</small> : null}
        </div>

        <div className="table-wrap">
          <AdmissionsTable
            items={tableItems}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onUpdateRow={(item) => {
              setEditAdmission(item);
              setEditStudentName(item.student_name);
              setEditClassName(item.class_name ?? "");
              setEditEmail(item.email ?? "");
              setEditContact(item.contact_number ?? "");
            }}
            onDeleteRow={(item) => {
              const confirmed = window.confirm(`Delete admission ${item.application_number}? This cannot be undone.`);
              if (!confirmed) {
                return;
              }
              deleteAdmissionMutation.mutate(item.id, {
                onSuccess: () => {
                  setBulkFeedback(`Deleted application ${item.application_number}.`);
                },
                onError: (error) => {
                  setBulkFeedback(`Delete failed. ${mapApiError(error).message}`);
                },
              });
            }}
            onDownloadDoc={async (item) => {
              if (!item.document_path) {
                setBulkFeedback("No uploaded document found for this application.");
                return;
              }
              try {
                const { data: blob } = await apiClient.get(
                  `/api/v1/files/download/${item.document_path}`,
                  { responseType: "blob" },
                );
                const objectUrl = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = objectUrl;
                link.download = item.document_path.split("/").pop() || `${item.application_number}-document`;
                link.click();
                URL.revokeObjectURL(objectUrl);
              } catch (error) {
                setBulkFeedback(`Document download failed. ${mapApiError(error).message}`);
              }
            }}
            onPrintApplication={printApplication}
          />
        </div>
      </section>

      {editAdmission ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit admission record">
          <section className="panel modal-panel">
            <h2>Edit Application: {editAdmission.application_number}</h2>
            <div className="form-grid">
              <label className="field-wrap" htmlFor="edit_student_name">
                <span>Student Name</span>
                <input id="edit_student_name" value={editStudentName} onChange={(event) => setEditStudentName(event.target.value)} />
              </label>
              <label className="field-wrap" htmlFor="edit_class_name">
                <span>Class / Grade</span>
                <input id="edit_class_name" value={editClassName} onChange={(event) => setEditClassName(event.target.value)} />
              </label>
              <label className="field-wrap" htmlFor="edit_email">
                <span>Email</span>
                <input id="edit_email" type="email" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} />
              </label>
              <label className="field-wrap" htmlFor="edit_contact">
                <span>Contact Number</span>
                <input id="edit_contact" value={editContact} onChange={(event) => setEditContact(event.target.value)} />
              </label>
            </div>
            <div className="toolbar">
              <button
                type="button"
                onClick={() => {
                  updateAdmissionMutation.mutate(
                    {
                      itemId: editAdmission.id,
                      payload: {
                        student_name: editStudentName.trim(),
                        class_name: editClassName.trim() || null,
                        email: editEmail.trim() || null,
                        contact_number: editContact.trim() || null,
                      },
                    },
                    {
                      onSuccess: () => {
                        setBulkFeedback(`Updated application ${editAdmission.application_number}.`);
                        setEditAdmission(null);
                      },
                      onError: (error) => {
                        setBulkFeedback(`Update failed. ${mapApiError(error).message}`);
                      },
                    },
                  );
                }}
              >
                Save Changes
              </button>
              <button type="button" onClick={() => setEditAdmission(null)}>
                Cancel
              </button>
            </div>
          </section>
        </div>
      ) : null}

    </main>
  );
}
