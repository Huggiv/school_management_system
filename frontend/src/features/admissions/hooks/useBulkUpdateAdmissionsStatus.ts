import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AdmissionStatusOption } from "@/features/admissions/types";
import { apiClient } from "@/lib/api/client";

interface BulkStatusPayload {
  ids: number[];
  status: Exclude<AdmissionStatusOption, "all">;
  actor: string;
  reason: string;
}

export function useBulkUpdateAdmissionsStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkStatusPayload) => {
      const { data } = await apiClient.patch<{ updated: number }>("/api/v1/admissions/bulk-status", payload);
      return data.updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions-management"] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });
}
