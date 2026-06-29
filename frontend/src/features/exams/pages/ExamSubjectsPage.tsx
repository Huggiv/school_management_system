import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TablePagination } from "@/components/data/TablePagination";
import { TableQueryControls } from "@/components/data/TableQueryControls";
import { apiClient } from "@/lib/api/client";

interface ExamSubjectRecord {
  id: number;
  exam_session_id: number;
  subject_id: number;
  class_name: string;
  max_marks: number;
  exam_date: string;
}

interface ExamSubjectForm {
  exam_session_id: number;
  subject_id: number;
  class_name: string;
  max_marks: number;
  exam_date: string;
}

export function ExamSubjectsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("-id");
  const [search, setSearch] = useState("");
  const { register, handleSubmit, reset } = useForm<ExamSubjectForm>();

  const { data } = useQuery({
    queryKey: ["exam-subjects", page, size, sort, search],
    queryFn: async () => {
      const { data: response } = await apiClient.get<{ items: ExamSubjectRecord[]; total: number }>(
        "/api/v1/exam-subjects/",
        { params: { page, size, sort, search: search || undefined } },
      );
      return response;
    },
  });

  const records = data?.items ?? [];
  const total = data?.total ?? 0;

  const upsert = useMutation({
    mutationFn: async (payload: ExamSubjectForm) => {
      const body = {
        exam_session_id: payload.exam_session_id,
        subject_id: payload.subject_id,
        class_name: payload.class_name,
        max_marks: payload.max_marks,
        exam_date: payload.exam_date,
      };
      if (selectedId) {
        await apiClient.put(`/api/v1/exam-subjects/${selectedId}`, body);
      } else {
        await apiClient.post("/api/v1/exam-subjects/", body);
      }
    },
    onSuccess: () => {
      setSelectedId(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ["exam-subjects"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/api/v1/exam-subjects/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exam-subjects"] }),
  });

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Exam Subjects</h1>
        <p>Map session + subject + class combinations and paper schedules.</p>
      </section>

      <section className="panel">
        <TableQueryControls
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onSizeChange={(value) => {
            setSize(value);
            setPage(1);
          }}
          onSortChange={(value) => {
            setSort(value);
            setPage(1);
          }}
          search={search}
          searchPlaceholder="Search by class"
          size={size}
          sort={sort}
          sortOptions={[
            { value: "-id", label: "Newest" },
            { value: "id", label: "Oldest" },
            { value: "class_name", label: "Class (A-Z)" },
            { value: "-class_name", label: "Class (Z-A)" },
            { value: "exam_date", label: "Exam Date (Asc)" },
            { value: "-exam_date", label: "Exam Date (Desc)" },
          ]}
        />
        <h2>{selectedId ? `Edit Paper #${selectedId}` : "Create Paper"}</h2>
        <form className="form-grid" onSubmit={handleSubmit((values) => upsert.mutate(values))}>
          <input {...register("exam_session_id", { required: true, valueAsNumber: true })} min={1} placeholder="Exam session ID" type="number" />
          <input {...register("subject_id", { required: true, valueAsNumber: true })} min={1} placeholder="Subject ID" type="number" />
          <input {...register("class_name", { required: true })} placeholder="Class" />
          <input {...register("max_marks", { required: true, valueAsNumber: true })} min={1} placeholder="Max marks" step="0.01" type="number" />
          <input {...register("exam_date", { required: true })} type="date" />
          <button disabled={upsert.isPending} type="submit">
            {upsert.isPending ? "Saving..." : selectedId ? "Update Paper" : "Create Paper"}
          </button>
        </form>
      </section>

      <section className="panel table-wrap">
        <h2>Exam Papers ({total})</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Session ID</th>
              <th>Subject ID</th>
              <th>Class</th>
              <th>Max Marks</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.exam_session_id}</td>
                <td>{item.subject_id}</td>
                <td>{item.class_name}</td>
                <td>{item.max_marks}</td>
                <td>{item.exam_date}</td>
                <td>
                  <div className="grid-row-actions">
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        reset({
                          exam_session_id: item.exam_session_id,
                          subject_id: item.subject_id,
                          class_name: item.class_name,
                          max_marks: Number(item.max_marks),
                          exam_date: item.exam_date,
                        });
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button onClick={() => remove.mutate(item.id)} type="button">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <TablePagination onPageChange={setPage} page={page} size={size} total={total} />
      </section>
    </main>
  );
}
