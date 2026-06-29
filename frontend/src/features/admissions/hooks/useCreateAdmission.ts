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
      const documents = payload.document ? Array.from(payload.document) : [];
      if (documents.length > 0) {
        const formData = new FormData();
        for (const file of documents) {
          formData.append("files", file);
        }

        const upload = await apiClient.post<{ path: string }>(
          `/api/v1/files/upload-bundle?category=admissions&student_key=${encodeURIComponent(payload.student_name)}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        uploadedPath = upload.data.path;
      }

      const appNumber = `APP-${Date.now()}`;
      return apiClient.post("/api/v1/admissions", {
        application_number: appNumber,
        student_name: payload.student_name,
        gender: payload.gender,
        class_name: payload.grade_applying_for,
        email: payload.email,
        contact_number: normalizeContactNumber(payload.contact_number),
        fee_total: payload.fee_total,
        fee_paid: payload.fee_paid,
        fee_pending: payload.fee_pending,
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
