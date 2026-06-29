import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TablePagination } from "@/components/data/TablePagination";
import { TableQueryControls } from "@/components/data/TableQueryControls";
import { apiClient } from "@/lib/api/client";

interface FeeStructureRecord {
  id: number;
  class_name: string;
  academic_year: number;
  amount_total: number;
  due_schedule_json?: string | null;
}

interface FeeStructureForm {
  class_name: string;
  academic_year: number;
  amount_total: number;
  due_schedule_json: string;
}

export function FeeStructuresPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("-id");
  const [search, setSearch] = useState("");
  const { register, handleSubmit, reset } = useForm<FeeStructureForm>();

  const { data } = useQuery({
    queryKey: ["fee-structures", page, size, sort, search],
    queryFn: async () => {
      const { data: response } = await apiClient.get<{ items: FeeStructureRecord[]; total: number }>(
        "/api/v1/fee-structures/",
        { params: { page, size, sort, search: search || undefined } },
      );
      return response;
    },
  });

  const records = data?.items ?? [];
  const total = data?.total ?? 0;

  const upsert = useMutation({
    mutationFn: async (payload: FeeStructureForm) => {
      const body = {
        class_name: payload.class_name.trim(),
        academic_year: payload.academic_year,
        amount_total: payload.amount_total,
        due_schedule_json: payload.due_schedule_json.trim() || null,
      };
      if (selectedId) {
        await apiClient.put(`/api/v1/fee-structures/${selectedId}`, body);
      } else {
        await apiClient.post("/api/v1/fee-structures/", body);
      }
    },
    onSuccess: () => {
      setSelectedId(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/api/v1/fee-structures/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fee-structures"] }),
  });

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Fee Structures</h1>
        <p>Define annual class-wise fee structures and payment schedules.</p>
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
          searchPlaceholder="Search class"
          size={size}
          sort={sort}
          sortOptions={[
            { value: "-id", label: "Newest" },
            { value: "id", label: "Oldest" },
            { value: "class_name", label: "Class (A-Z)" },
            { value: "-class_name", label: "Class (Z-A)" },
            { value: "academic_year", label: "Academic Year (Asc)" },
            { value: "-academic_year", label: "Academic Year (Desc)" },
          ]}
        />
        <h2>{selectedId ? `Edit Structure #${selectedId}` : "Create Structure"}</h2>
        <form className="form-grid" onSubmit={handleSubmit((values) => upsert.mutate(values))}>
          <input {...register("class_name", { required: true })} placeholder="Class" />
          <input {...register("academic_year", { required: true, valueAsNumber: true })} placeholder="Academic year" type="number" />
          <input {...register("amount_total", { required: true, valueAsNumber: true })} min={0} placeholder="Total amount" step="0.01" type="number" />
          <input {...register("due_schedule_json")} placeholder="Due schedule JSON" />
          <button disabled={upsert.isPending} type="submit">
            {upsert.isPending ? "Saving..." : selectedId ? "Update Structure" : "Create Structure"}
          </button>
        </form>
      </section>

      <section className="panel table-wrap">
        <h2>Structures ({total})</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Class</th>
              <th>Year</th>
              <th>Total Amount</th>
              <th>Due Schedule</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.class_name}</td>
                <td>{item.academic_year}</td>
                <td>{item.amount_total}</td>
                <td>{item.due_schedule_json ?? "-"}</td>
                <td>
                  <div className="grid-row-actions">
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        reset({
                          class_name: item.class_name,
                          academic_year: item.academic_year,
                          amount_total: Number(item.amount_total),
                          due_schedule_json: item.due_schedule_json ?? "",
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
