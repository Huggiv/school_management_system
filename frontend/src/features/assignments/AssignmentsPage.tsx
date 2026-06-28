import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/AuthProvider";
import { apiClient } from "@/lib/api/client";

interface AssignmentRecord {
  id: number;
  title: string;
  description: string;
  due_date: string;
  attachment?: string;
}

interface AssignmentForm {
  teacher_id: number;
  title: string;
  description: string;
  due_date: string;
  attachment?: FileList;
}

export function AssignmentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { register, handleSubmit, reset } = useForm<AssignmentForm>();

  const { data: assignments = [] } = useQuery({
    queryKey: ["assignments"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: AssignmentRecord[] }>("/api/v1/assignments", {
        params: { page: 1, size: 100, sort: "due_date" },
      });
      return data.items;
    },
  });

  const saveAssignment = useMutation({
    mutationFn: async (payload: AssignmentForm) => {
      let attachment = "";
      const file = payload.attachment?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const upload = await apiClient.post<{ path: string }>("/api/v1/files/upload?category=assignments", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        attachment = upload.data.path;
      }

      const body = {
        teacher_id: payload.teacher_id,
        title: payload.title,
        description: payload.description,
        due_date: payload.due_date,
        attachment,
      };
      if (selectedId) {
        return apiClient.put(`/api/v1/assignments/${selectedId}`, body);
      }
      return apiClient.post("/api/v1/assignments", body);
    },
    onSuccess: () => {
      setSelectedId(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });

  const submitHomework = useMutation({
    mutationFn: async ({ assignmentId, file }: { assignmentId: number; file: File }) => {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const upload = await apiClient.post<{ path: string }>("/api/v1/files/upload?category=submissions", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return apiClient.post("/api/v1/submissions", {
        assignment_id: assignmentId,
        student_id: 1,
        uploaded_file: upload.data.path,
        submitted_at: new Date().toISOString(),
      });
    },
  });

  const canManage = user?.role === "teacher" || user?.role === "administrator" || user?.role === "principal";

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Assignments</h1>
      </section>

      {canManage && (
        <section className="panel">
          <h2>{selectedId ? "Edit Assignment" : "Create Assignment"}</h2>
          <form
            className="form-grid"
            onSubmit={handleSubmit((values) => {
              saveAssignment.mutate(values);
            })}
          >
            <input {...register("teacher_id", { required: true, valueAsNumber: true })} placeholder="Teacher ID" type="number" />
            <input {...register("title", { required: true })} placeholder="Title" />
            <input {...register("description", { required: true })} placeholder="Description" />
            <input {...register("due_date", { required: true })} type="datetime-local" />
            <input {...register("attachment")} type="file" />
            <button type="submit">{selectedId ? "Update" : "Publish"} Assignment</button>
          </form>
        </section>
      )}

      <section className="panel">
        <h2>Assignment Board</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.description}</td>
                <td>{new Date(item.due_date).toLocaleString()}</td>
                <td>{new Date(item.due_date).getTime() < Date.now() ? "Closed" : "Open"}</td>
                <td>
                  {canManage ? (
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        reset({
                          teacher_id: 1,
                          title: item.title,
                          description: item.description,
                          due_date: item.due_date.slice(0, 16),
                        });
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                  ) : (
                    <label className="upload-mini">
                      Submit
                      <input
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          submitHomework.mutate({ assignmentId: item.id, file });
                        }}
                        type="file"
                      />
                    </label>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
