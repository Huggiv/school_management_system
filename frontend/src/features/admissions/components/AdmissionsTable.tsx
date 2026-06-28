import { useEffect, useMemo, useRef } from "react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import type { AdmissionRecord } from "@/features/admissions/types";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

interface AdmissionsTableProps {
  items: AdmissionRecord[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onOpenNotes: (item: AdmissionRecord) => void;
}

export function AdmissionsTable({
  items,
  selectedIds,
  onSelectionChange,
  onOpenNotes,
}: AdmissionsTableProps) {
  const gridRef = useRef<AgGridReact<AdmissionRecord>>(null);
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
        headerName: "Actions",
        filter: false,
        floatingFilter: false,
        sortable: false,
        minWidth: 120,
        cellRenderer: (params: ICellRendererParams<AdmissionRecord>) => (
          <button type="button" onClick={() => params.data && onOpenNotes(params.data)}>
            Notes
          </button>
        ),
      },
    ],
    [onOpenNotes],
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
        suppressRowClickSelection
        pagination
        paginationPageSize={10}
        animateRows
        getRowId={(params) => String(params.data.id)}
        defaultColDef={{
          sortable: true,
          filter: true,
          floatingFilter: true,
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
