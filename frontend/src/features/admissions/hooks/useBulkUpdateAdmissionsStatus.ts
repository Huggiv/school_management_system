import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AdmissionStatusOption } from "@/features/admissions/types";
import { apiClient } from "@/lib/api/client";

interface BulkStatusPayload {
  ids: number[];
  status: Exclude<AdmissionStatusOption, "all">;
}

export function useBulkUpdateAdmissionsStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkStatusPayload) => {
      await apiClient.patch("/api/v1/admissions/bulk-status", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions-management"] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });
}
