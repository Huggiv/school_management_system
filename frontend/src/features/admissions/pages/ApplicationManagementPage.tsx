import { useMemo, useState } from "react";

import { AdmissionFilters } from "@/features/admissions/components/AdmissionFilters";
import { AdmissionsTable } from "@/features/admissions/components/AdmissionsTable";
import { useAdmissionExport } from "@/features/admissions/hooks/useAdmissionExport";
import { useAdmissionsList } from "@/features/admissions/hooks/useAdmissionsList";
import type { AdmissionStatusOption } from "@/features/admissions/types";

export function ApplicationManagementPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdmissionStatusOption>("all");

  const { data: admissions = [] } = useAdmissionsList(search);
  const exportAdmissions = useAdmissionExport();

  const filtered = useMemo(
    () => admissions.filter((item) => statusFilter === "all" || item.status === statusFilter),
    [admissions, statusFilter],
  );

  return (
    <section className="panel">
      <h1>Application Management</h1>
      <AdmissionFilters
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onExport={() => exportAdmissions(filtered)}
      />
      <AdmissionsTable items={filtered} />
    </section>
  );
}
