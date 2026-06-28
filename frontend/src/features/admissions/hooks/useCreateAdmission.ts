import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { AdmissionFormValues } from "@/features/admissions/types";

function normalizeContactNumber(value: string): string {
  return value.replace(/[\s()-]/g, "");
}

export function useCreateAdmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AdmissionFormValues) => {
      let uploadedPath = "";
      const documentFile = payload.document?.[0];
      if (documentFile) {
        const formData = new FormData();
        formData.append("file", documentFile);
        const upload = await apiClient.post<{ path: string }>(
          "/api/v1/files/upload?category=admissions",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        uploadedPath = upload.data.path;
      }

      const appNumber = `APP-${Date.now()}`;
      return apiClient.post("/api/v1/admissions", {
        application_number: appNumber,
        student_name: payload.student_name,
        class_name: payload.grade_applying_for,
        email: payload.email,
        contact_number: normalizeContactNumber(payload.contact_number),
        status: "pending",
        notes_json: JSON.stringify([
          {
            author: "system",
            note: `Application submitted${uploadedPath ? " with supporting document" : ""}`,
            document_path: uploadedPath || undefined,
            timestamp: new Date().toISOString(),
          },
        ]),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });
}
