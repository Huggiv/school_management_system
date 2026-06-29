import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TablePagination } from "@/components/data/TablePagination";
import { TableQueryControls } from "@/components/data/TableQueryControls";
import { apiClient } from "@/lib/api/client";

interface ExamResultRecord {
  id: number;
  exam_subject_id: number;
  student_id: number;
  obtained_marks: number;
  grade_label?: string | null;
  remarks?: string | null;
  entered_by_user_id?: number | null;
}

interface ExamResultForm {
  exam_subject_id: number;
  student_id: number;
  obtained_marks: number;
  grade_label: string;
  remarks: string;
  entered_by_user_id?: number;
}

export function ExamResultsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("-id");
  const [search, setSearch] = useState("");
  const { register, handleSubmit, reset } = useForm<ExamResultForm>();

  const { data } = useQuery({
    queryKey: ["exam-results", page, size, sort, search],
    queryFn: async () => {
      const { data: response } = await apiClient.get<{ items: ExamResultRecord[]; total: number }>(
        "/api/v1/exam-results/",
        { params: { page, size, sort, search: search || undefined } },
      );
      return response;
    },
  });

  const results = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;

  const upsert = useMutation({
    mutationFn: async (payload: ExamResultForm) => {
      const body = {
        exam_subject_id: payload.exam_subject_id,
        student_id: payload.student_id,
        obtained_marks: payload.obtained_marks,
        grade_label: payload.grade_label.trim() || null,
        remarks: payload.remarks.trim() || null,
        entered_by_user_id: payload.entered_by_user_id || null,
      };
      if (selectedId) {
        await apiClient.put(`/api/v1/exam-results/${selectedId}`, body);
      } else {
        await apiClient.post("/api/v1/exam-results/", body);
      }
    },
    onSuccess: () => {
      setSelectedId(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ["exam-results"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/api/v1/exam-results/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exam-results"] }),
  });

  const reportRows = useMemo(() => {
    const grouped: Record<number, { exam_subject_id: number; count: number; total: number; top: number }> = {};
    for (const item of results) {
      const key = item.exam_subject_id;
      if (!grouped[key]) {
        grouped[key] = { exam_subject_id: key, count: 0, total: 0, top: Number(item.obtained_marks) };
      }
      grouped[key].count += 1;
      grouped[key].total += Number(item.obtained_marks);
      grouped[key].top = Math.max(grouped[key].top, Number(item.obtained_marks));
    }

    return Object.values(grouped)
      .map((row) => ({
        ...row,
        average: Number((row.total / row.count).toFixed(2)),
      }))
      .sort((a, b) => a.exam_subject_id - b.exam_subject_id);
  }, [results]);

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Exam Results</h1>
        <p>Enter marks per student and monitor class-level performance.</p>
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
          searchPlaceholder="Search by grade label or remarks"
          size={size}
          sort={sort}
          sortOptions={[
            { value: "-id", label: "Newest" },
            { value: "id", label: "Oldest" },
            { value: "obtained_marks", label: "Marks (Low to High)" },
            { value: "-obtained_marks", label: "Marks (High to Low)" },
            { value: "student_id", label: "Student ID (Asc)" },
            { value: "-student_id", label: "Student ID (Desc)" },
          ]}
        />
        <h2>{selectedId ? `Edit Result #${selectedId}` : "Create Result"}</h2>
        <form className="form-grid" onSubmit={handleSubmit((values) => upsert.mutate(values))}>
          <input {...register("exam_subject_id", { required: true, valueAsNumber: true })} min={1} placeholder="Exam subject ID" type="number" />
          <input {...register("student_id", { required: true, valueAsNumber: true })} min={1} placeholder="Student ID" type="number" />
          <input {...register("obtained_marks", { required: true, valueAsNumber: true })} min={0} placeholder="Obtained marks" step="0.01" type="number" />
          <input {...register("grade_label")} placeholder="Grade label" />
          <input {...register("remarks")} placeholder="Remarks" />
          <input {...register("entered_by_user_id", { valueAsNumber: true })} min={1} placeholder="Entered by user ID" type="number" />
          <button disabled={upsert.isPending} type="submit">
            {upsert.isPending ? "Saving..." : selectedId ? "Update Result" : "Create Result"}
          </button>
        </form>
      </section>

      <section className="panel table-wrap">
        <h2>Result Report by Exam Subject</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Exam Subject ID</th>
              <th>Entries</th>
              <th>Average Marks</th>
              <th>Top Marks</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map((row) => (
              <tr key={row.exam_subject_id}>
                <td>{row.exam_subject_id}</td>
                <td>{row.count}</td>
                <td>{row.average}</td>
                <td>{row.top}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel table-wrap">
        <h2>Result Entries ({total})</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Exam Subject</th>
              <th>Student</th>
              <th>Marks</th>
              <th>Grade</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.exam_subject_id}</td>
                <td>{item.student_id}</td>
                <td>{item.obtained_marks}</td>
                <td>{item.grade_label ?? "-"}</td>
                <td>{item.remarks ?? "-"}</td>
                <td>
                  <div className="grid-row-actions">
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        reset({
                          exam_subject_id: item.exam_subject_id,
                          student_id: item.student_id,
                          obtained_marks: Number(item.obtained_marks),
                          grade_label: item.grade_label ?? "",
                          remarks: item.remarks ?? "",
                          entered_by_user_id: item.entered_by_user_id ?? undefined,
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
