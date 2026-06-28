import { useQuery } from "@tanstack/react-query";

import type { AdmissionManagementFilters, AdmissionRecord } from "@/features/admissions/types";
import { apiClient } from "@/lib/api/client";

export function useAdmissionsManagement(filters: AdmissionManagementFilters) {
  return useQuery({
    queryKey: ["admissions-management", filters],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: AdmissionRecord[]; total: number }>(
        "/api/v1/admissions/management",
        {
          params: {
            page: 1,
            size: 100,
            search: filters.search || undefined,
            status: filters.status,
            class_name: filters.className || "all",
            from_date: filters.fromDate || undefined,
            to_date: filters.toDate || undefined,
          },
        },
      );
      return data;
    },
  });
}
