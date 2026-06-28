import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";

interface AssignReviewerPayload {
  ids: number[];
  reviewer_name: string;
}

export function useAssignAdmissionReviewer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AssignReviewerPayload) => {
      await apiClient.patch("/api/v1/admissions/assign-reviewer", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions-management"] });
    },
  });
}
