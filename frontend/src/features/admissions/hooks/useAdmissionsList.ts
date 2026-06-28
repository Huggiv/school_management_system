import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { AdmissionRecord } from "@/features/admissions/types";

export function useAdmissionsList(search: string) {
  return useQuery({
    queryKey: ["admissions", search],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: AdmissionRecord[] }>("/api/v1/admissions", {
        params: { page: 1, size: 100, search },
      });
      return data.items;
    },
  });
}
