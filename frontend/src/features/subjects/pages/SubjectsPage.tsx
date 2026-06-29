import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TablePagination } from "@/components/data/TablePagination";
import { TableQueryControls } from "@/components/data/TableQueryControls";
import { apiClient } from "@/lib/api/client";

interface SubjectRecord {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  is_active: boolean;
}

interface SubjectForm {
  code: string;
  name: string;
  description: string;
  is_active: boolean;
}

export function SubjectsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("code");
  const [search, setSearch] = useState("");
  const { register, handleSubmit, reset } = useForm<SubjectForm>({
    defaultValues: { is_active: true },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["subjects", page, size, sort, search],
    queryFn: async () => {
      const { data: response } = await apiClient.get<{ items: SubjectRecord[]; total: number }>("/api/v1/subjects/", {
        params: { page, size, sort, search: search || undefined },
      });
      return response;
    },
  });

  const subjects = data?.items ?? [];
  const total = data?.total ?? 0;

  const upsert = useMutation({
    mutationFn: async (payload: SubjectForm) => {
      const body = {
        code: payload.code.trim().toUpperCase(),
        name: payload.name.trim(),
        description: payload.description.trim() || null,
        is_active: payload.is_active,
      };
      if (selectedId) {
        await apiClient.put(`/api/v1/subjects/${selectedId}`, body);
      } else {
        await apiClient.post("/api/v1/subjects/", body);
      }
    },
    onSuccess: () => {
      setSelectedId(null);
      reset({ code: "", name: "", description: "", is_active: true });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/v1/subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Subjects</h1>
        <p>Maintain the academics subject catalog used in exams and reports.</p>
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
          searchPlaceholder="Search code or name"
          size={size}
          sort={sort}
          sortOptions={[
            { value: "code", label: "Code (A-Z)" },
            { value: "-code", label: "Code (Z-A)" },
            { value: "name", label: "Name (A-Z)" },
            { value: "-name", label: "Name (Z-A)" },
            { value: "-id", label: "Newest" },
            { value: "id", label: "Oldest" },
          ]}
        />
        <h2>{selectedId ? `Edit Subject #${selectedId}` : "Create Subject"}</h2>
        <form className="form-grid" onSubmit={handleSubmit((values) => upsert.mutate(values))}>
          <input {...register("code", { required: true })} placeholder="Code" />
          <input {...register("name", { required: true })} placeholder="Name" />
          <input {...register("description")} placeholder="Description" />
          <label className="field-wrap checkbox-wrap">
            <input {...register("is_active")} type="checkbox" />
            <span>Active</span>
          </label>
          <button disabled={upsert.isPending} type="submit">
            {upsert.isPending ? "Saving..." : selectedId ? "Update Subject" : "Create Subject"}
          </button>
        </form>
      </section>

      <section className="panel table-wrap">
        <h2>Subject List {isLoading ? "(loading...)" : `(${total})`}</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td>{item.description ?? "-"}</td>
                <td>{item.is_active ? "Yes" : "No"}</td>
                <td>
                  <div className="grid-row-actions">
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        reset({
                          code: item.code,
                          name: item.name,
                          description: item.description ?? "",
                          is_active: item.is_active,
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
