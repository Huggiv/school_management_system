import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/AuthProvider";
import { apiClient } from "@/lib/api/client";

interface GradeRecord {
  id: number;
  student_id: number;
  subject: string;
  marks: number;
  grade: string;
  remarks?: string;
}

interface GradeForm {
  student_id: number;
  subject: string;
  marks: number;
  grade: string;
  remarks: string;
}

export function GradePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<GradeForm>();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: grades = [] } = useQuery({
    queryKey: ["grades"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: GradeRecord[] }>("/api/v1/grades", {
        params: { page: 1, size: 100, sort: "-id" },
      });
      return data.items;
    },
  });

  const upsert = useMutation({
    mutationFn: async (payload: GradeForm) => {
      if (selectedId) {
        return apiClient.put(`/api/v1/grades/${selectedId}`, payload);
      }
      return apiClient.post("/api/v1/grades", payload);
    },
    onSuccess: () => {
      setSelectedId(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
  });

  const canManage = user?.role === "teacher" || user?.role === "administrator" || user?.role === "principal";
  const gpa = useMemo(() => {
    if (!grades.length) return 0;
    const total = grades.reduce((sum, item) => sum + Number(item.marks), 0);
    return Number((total / grades.length / 25).toFixed(2));
  }, [grades]);

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Grade Management</h1>
        <p>Current GPA snapshot: {gpa}</p>
      </section>

      {canManage && (
        <section className="panel">
          <h2>{selectedId ? "Edit Grade" : "Add Grade"}</h2>
          <form
            className="form-grid"
            onSubmit={handleSubmit((values) => {
              upsert.mutate(values);
            })}
          >
            <input {...register("student_id", { required: true, valueAsNumber: true })} placeholder="Student ID" type="number" />
            <input {...register("subject", { required: true })} placeholder="Subject" />
            <input {...register("marks", { required: true, valueAsNumber: true })} placeholder="Marks" type="number" />
            <input {...register("grade", { required: true })} placeholder="Grade" />
            <input {...register("remarks")} placeholder="Remarks" />
            <button type="submit">{selectedId ? "Update" : "Publish"} Grade</button>
          </form>
        </section>
      )}

      <section className="panel">
        <h2>Published Grades</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Subject</th>
              <th>Marks</th>
              <th>Grade</th>
              <th>Remarks</th>
              {canManage && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {grades.map((item) => (
              <tr key={item.id}>
                <td>{item.student_id}</td>
                <td>{item.subject}</td>
                <td>{item.marks}</td>
                <td>{item.grade}</td>
                <td>{item.remarks}</td>
                {canManage && (
                  <td>
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        reset({
                          student_id: item.student_id,
                          subject: item.subject,
                          marks: Number(item.marks),
                          grade: item.grade,
                          remarks: item.remarks ?? "",
                        });
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
