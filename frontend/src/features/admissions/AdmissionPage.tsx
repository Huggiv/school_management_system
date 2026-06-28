import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/AuthProvider";
import { apiClient } from "@/lib/api/client";

interface AdmissionForm {
  student_name: string;
  dob: string;
  gender: string;
  parent_name: string;
  address: string;
  previous_school: string;
  grade_applying_for: string;
  contact_number: string;
  email: string;
  document?: FileList;
}

interface AdmissionRecord {
  id: number;
  application_number: string;
  student_name: string;
  status: string;
}

export function AdmissionPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { register, handleSubmit, reset } = useForm<AdmissionForm>();

  const createAdmission = useMutation({
    mutationFn: async (payload: AdmissionForm) => {
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
          previous_school: payload.previous_school,
          grade_applying_for: payload.grade_applying_for,
          contact_number: payload.contact_number,
          email: payload.email,
          document_path: uploadedPath,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      reset();
    },
  });

  const { data: admissions = [] } = useQuery({
    queryKey: ["admissions", search],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: AdmissionRecord[] }>("/api/v1/admissions", {
        params: { page: 1, size: 100, search },
      });
      return data.items;
    },
  });

  const filtered = useMemo(() => {
    return admissions.filter((item) => statusFilter === "all" || item.status === statusFilter);
  }, [admissions, statusFilter]);

  function exportCsv(): void {
    const header = "id,application_number,student_name,status";
    const rows = filtered.map((item) => `${item.id},${item.application_number},${item.student_name},${item.status}`);
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admissions-export.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Admission</h1>
        <form
          className="form-grid"
          onSubmit={handleSubmit((values) => {
            createAdmission.mutate(values);
          })}
        >
          <input {...register("student_name", { required: true })} placeholder="Student Name" />
          <input {...register("dob", { required: true })} placeholder="Date of Birth" type="date" />
          <input {...register("gender", { required: true })} placeholder="Gender" />
          <input {...register("parent_name", { required: true })} placeholder="Parent Name" />
          <input {...register("address", { required: true })} placeholder="Address" />
          <input {...register("previous_school")} placeholder="Previous School" />
          <input {...register("grade_applying_for", { required: true })} placeholder="Grade Applying For" />
          <input {...register("contact_number", { required: true })} placeholder="Contact Number" />
          <input {...register("email", { required: true })} placeholder="Email" type="email" />
          <input {...register("document")} type="file" />
          <button type="submit">Submit Application</button>
        </form>
      </section>

      {(user?.role === "administrator" || user?.role === "principal") && (
        <section className="panel">
          <h2>Applications Management</h2>
          <div className="toolbar">
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student or application"
              value={search}
            />
            <select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <button onClick={exportCsv} type="button">
              Export CSV
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Student</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.application_number}</td>
                  <td>{item.student_name}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
