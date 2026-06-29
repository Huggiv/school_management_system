import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TablePagination } from "@/components/data/TablePagination";
import { TableQueryControls } from "@/components/data/TableQueryControls";
import { apiClient } from "@/lib/api/client";

interface ExamSessionRecord {
  id: number;
  name: string;
  academic_year: number;
  term?: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_by_user_id?: number | null;
}

interface ExamSessionForm {
  name: string;
  academic_year: number;
  term: string;
  start_date: string;
  end_date: string;
  status: string;
  created_by_user_id?: number;
}

export function ExamSessionsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("-id");
  const [search, setSearch] = useState("");
  const { register, handleSubmit, reset } = useForm<ExamSessionForm>({
    defaultValues: { status: "draft" },
  });

  const { data } = useQuery({
    queryKey: ["exam-sessions", page, size, sort, search],
    queryFn: async () => {
      const { data: response } = await apiClient.get<{ items: ExamSessionRecord[]; total: number }>(
        "/api/v1/exam-sessions/",
        { params: { page, size, sort, search: search || undefined } },
      );
      return response;
    },
  });

  const sessions = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;

  const upsert = useMutation({
    mutationFn: async (payload: ExamSessionForm) => {
      const body = {
        name: payload.name.trim(),
        academic_year: payload.academic_year,
        term: payload.term.trim() || null,
        start_date: payload.start_date,
        end_date: payload.end_date,
        status: payload.status,
        created_by_user_id: payload.created_by_user_id || null,
      };
      if (selectedId) {
        await apiClient.put(`/api/v1/exam-sessions/${selectedId}`, body);
      } else {
        await apiClient.post("/api/v1/exam-sessions/", body);
      }
    },
    onSuccess: () => {
      setSelectedId(null);
      reset({ status: "draft" });
      queryClient.invalidateQueries({ queryKey: ["exam-sessions"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/api/v1/exam-sessions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exam-sessions"] }),
  });

  const statusSummary = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of sessions) {
      map[item.status] = (map[item.status] ?? 0) + 1;
    }
    return Object.entries(map);
  }, [sessions]);

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Exam Sessions</h1>
        <p>Create and manage periodic exam windows across academic years.</p>
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
          searchPlaceholder="Search name, term, status"
          size={size}
          sort={sort}
          sortOptions={[
            { value: "-id", label: "Newest" },
            { value: "id", label: "Oldest" },
            { value: "academic_year", label: "Academic Year (Asc)" },
            { value: "-academic_year", label: "Academic Year (Desc)" },
            { value: "start_date", label: "Start Date (Asc)" },
            { value: "-start_date", label: "Start Date (Desc)" },
          ]}
        />
        <div className="stats-grid compact">
          {statusSummary.map(([status, count]) => (
            <article className="stat-card" key={status}>
              <span>{status}</span>
              <strong>{count}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>{selectedId ? `Edit Session #${selectedId}` : "Create Session"}</h2>
        <form className="form-grid" onSubmit={handleSubmit((values) => upsert.mutate(values))}>
          <input {...register("name", { required: true })} placeholder="Session name" />
          <input {...register("academic_year", { required: true, valueAsNumber: true })} placeholder="Academic year" type="number" />
          <input {...register("term")} placeholder="Term" />
          <input {...register("start_date", { required: true })} type="date" />
          <input {...register("end_date", { required: true })} type="date" />
          <select {...register("status", { required: true })}>
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="closed">closed</option>
          </select>
          <input {...register("created_by_user_id", { valueAsNumber: true })} placeholder="Created by user ID" type="number" />
          <button disabled={upsert.isPending} type="submit">
            {upsert.isPending ? "Saving..." : selectedId ? "Update Session" : "Create Session"}
          </button>
        </form>
      </section>

      <section className="panel table-wrap">
        <h2>Sessions ({total})</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Year</th>
              <th>Term</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.academic_year}</td>
                <td>{item.term ?? "-"}</td>
                <td>{item.start_date}</td>
                <td>{item.end_date}</td>
                <td>{item.status}</td>
                <td>
                  <div className="grid-row-actions">
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        reset({
                          name: item.name,
                          academic_year: item.academic_year,
                          term: item.term ?? "",
                          start_date: item.start_date,
                          end_date: item.end_date,
                          status: item.status,
                          created_by_user_id: item.created_by_user_id ?? undefined,
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
