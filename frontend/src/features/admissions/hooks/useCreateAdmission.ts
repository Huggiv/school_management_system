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
        status: "pending",
        meta: {
          dob: payload.dob,
          gender: payload.gender,
          parent_name: payload.parent_name,
          address: payload.address,
          previous_school: payload.transfer_student ? payload.previous_school : "",
          grade_applying_for: payload.grade_applying_for,
          contact_number: normalizeContactNumber(payload.contact_number),
          email: payload.email,
          transfer_student: payload.transfer_student,
          document_path: uploadedPath,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });
}
