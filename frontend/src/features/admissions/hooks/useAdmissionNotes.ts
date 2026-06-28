import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AdmissionNote } from "@/features/admissions/types";
import { apiClient } from "@/lib/api/client";

export function useAdmissionNotes(admissionId: number | null) {
  return useQuery({
    queryKey: ["admission-notes", admissionId],
    enabled: Boolean(admissionId),
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: AdmissionNote[] }>(`/api/v1/admissions/${admissionId}/notes`);
      return data.items;
    },
  });
}

export function useAddAdmissionNote(admissionId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { note: string; author: string }) => {
      if (!admissionId) {
        return;
      }
      await apiClient.post(`/api/v1/admissions/${admissionId}/notes`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admission-notes", admissionId] });
      queryClient.invalidateQueries({ queryKey: ["admissions-management"] });
    },
  });
}
