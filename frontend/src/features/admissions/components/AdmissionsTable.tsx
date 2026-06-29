import { useEffect, useMemo, useRef } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import type { AdmissionRecord } from "@/features/admissions/types";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([AllCommunityModule]);

interface AdmissionsTableProps {
  items: AdmissionRecord[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onUpdateRow: (item: AdmissionRecord) => void;
  onDeleteRow: (item: AdmissionRecord) => void;
  onDownloadDoc: (item: AdmissionRecord) => void;
  onPrintApplication: (item: AdmissionRecord) => void;
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3a1 1 0 0 1 1 1v9.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 3.98a1 1 0 0 1-1.4 0l-4-3.98a1 1 0 1 1 1.4-1.42l2.3 2.3V4a1 1 0 0 1 1-1Z" />
      <path d="M5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M15.9 3.5a2 2 0 0 1 2.82 0l1.78 1.78a2 2 0 0 1 0 2.82l-9.96 9.96a1 1 0 0 1-.46.26l-4.4 1.1a1 1 0 0 1-1.22-1.22l1.1-4.4a1 1 0 0 1 .26-.46l9.96-9.96Zm1.4 1.42L7.55 14.67l-.66 2.63 2.63-.66 9.75-9.75-1.97-1.97Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9 3a1 1 0 0 0-1 1v1H5a1 1 0 1 0 0 2h.6l.8 11.2A2 2 0 0 0 8.4 20h7.2a2 2 0 0 0 2-1.8L18.4 7H19a1 1 0 1 0 0-2h-3V4a1 1 0 0 0-1-1H9Zm1 2V5h4V5h-4Zm-1.6 2 .77 10.8a.5.5 0 0 0 .5.45h4.66a.5.5 0 0 0 .5-.45L15.6 7H8.4Z" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 3a1 1 0 0 0-1 1v3h12V4a1 1 0 0 0-1-1H7Zm11 6H6a3 3 0 0 0-3 3v4h3v4a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-4h3v-4a3 3 0 0 0-3-3Zm-2 10H8v-5h8v5Zm2-5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </svg>
  );
}

function formatMoney(value: number | null | undefined): string {
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value ?? 0);
}

export function AdmissionsTable({
  items,
  selectedIds,
  onSelectionChange,
  onUpdateRow,
  onDeleteRow,
  onDownloadDoc,
  onPrintApplication,
}: AdmissionsTableProps) {
  const gridRef = useRef<AgGridReact<AdmissionRecord>>(null);

  const statusOptions = useMemo(
    () => ["pending", "under_review", "waitlisted", "accepted", "rejected"],
    [],
  );

  const columnDefs = useMemo<ColDef<AdmissionRecord>[]>(
    () => [
      {
        headerName: "Select",
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        filter: false,
        floatingFilter: false,
        width: 96,
        pinned: "left",
      },
      {
        field: "application_number",
        headerName: "Application",
        filter: "agTextColumnFilter",
        minWidth: 170,
      },
      {
        field: "student_name",
        headerName: "Student",
        filter: "agTextColumnFilter",
        minWidth: 180,
      },
      {
        field: "class_name",
        headerName: "Class",
        filter: "agTextColumnFilter",
        valueFormatter: ({ value }) => value || "-",
        minWidth: 140,
      },
      {
        field: "status",
        headerName: "Status",
        filter: "agSetColumnFilter",
        filterParams: {
          values: statusOptions,
        },
        valueGetter: ({ data }) => data?.status ?? "",
        cellRenderer: (params: ICellRendererParams<AdmissionRecord>) => {
          const statusValue = String(params.value ?? "");
          return (
            <span className={`ag-status-pill ${statusValue === "accepted" ? "accepted" : "other"}`}>
              {statusValue.replace(/_/g, " ") || "-"}
            </span>
          );
        },
        minWidth: 150,
      },
      {
        field: "created_at",
        headerName: "Submitted",
        filter: "agDateColumnFilter",
        valueFormatter: ({ value }) => (value ? new Date(value).toLocaleDateString() : "-"),
        minWidth: 150,
      },
      {
        field: "fee_total",
        headerName: "Total",
        filter: "agNumberColumnFilter",
        valueFormatter: ({ value }) => `Rs. ${formatMoney(value as number | undefined)}`,
        minWidth: 150,
      },
      {
        field: "fee_paid",
        headerName: "Paid",
        filter: "agNumberColumnFilter",
        valueFormatter: ({ value }) => `Rs. ${formatMoney(value as number | undefined)}`,
        minWidth: 150,
      },
      {
        field: "fee_pending",
        headerName: "Pending",
        filter: "agNumberColumnFilter",
        valueFormatter: ({ value }) => `Rs. ${formatMoney(value as number | undefined)}`,
        cellClass: (params) => ((Number(params.value ?? 0) > 0 ? "fee-pending-highlight" : "")),
        minWidth: 170,
      },
      {
        headerName: "Actions",
        filter: false,
        floatingFilter: false,
        sortable: false,
        minWidth: 220,
        cellRenderer: (params: ICellRendererParams<AdmissionRecord>) => {
          const row = params.data;
          const hasDoc = Boolean(row?.document_path);
          return (
            <div className="grid-row-actions">
              <button
                type="button"
                className="icon-action-button"
                title="Print application"
                aria-label="Print application"
                onClick={() => row && onPrintApplication(row)}
              >
                <PrintIcon />
              </button>
              <button
                type="button"
                className="icon-action-button"
                title="Update"
                aria-label="Update application"
                onClick={() => row && onUpdateRow(row)}
              >
                <EditIcon />
              </button>
              <button
                type="button"
                className="icon-action-button"
                title={hasDoc ? "Download document" : "No document uploaded"}
                aria-label="Download document"
                disabled={!hasDoc}
                onClick={() => row && onDownloadDoc(row)}
              >
                <DownloadIcon />
              </button>
              <button
                type="button"
                className="icon-action-button danger"
                title="Delete"
                aria-label="Delete application"
                onClick={() => row && onDeleteRow(row)}
              >
                <DeleteIcon />
              </button>
            </div>
          );
        },
      },
    ],
    [onDeleteRow, onDownloadDoc, onPrintApplication, onUpdateRow, statusOptions],
  );

  useEffect(() => {
    const api = gridRef.current?.api;
    if (!api) {
      return;
    }

    api.forEachNode((node) => {
      const nodeId = node.data?.id;
      if (typeof nodeId === "number") {
        node.setSelected(selectedIds.includes(nodeId));
      }
    });
  }, [selectedIds]);

  return (
    <div className="admissions-grid-wrap ag-theme-quartz">
      <AgGridReact<AdmissionRecord>
        ref={gridRef}
        rowData={items}
        columnDefs={columnDefs}
        rowSelection="multiple"
        suppressMenuHide={false}
        suppressRowClickSelection
        pagination
        paginationPageSize={10}
        animateRows
        getRowId={(params) => String(params.data.id)}
        defaultColDef={{
          sortable: true,
          filter: true,
          floatingFilter: false,
          resizable: true,
        }}
        overlayNoRowsTemplate="No admission applications found."
        onSelectionChanged={() => {
          const selected = gridRef.current?.api.getSelectedRows() ?? [];
          onSelectionChange(selected.map((row) => row.id));
        }}
      />
    </div>
  );
}
