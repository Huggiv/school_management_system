import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TablePagination } from "@/components/data/TablePagination";
import { TableQueryControls } from "@/components/data/TableQueryControls";
import { apiClient } from "@/lib/api/client";

interface StudentParentLink {
  id: number;
  student_id: number;
  parent_id: number;
  relationship_type?: string | null;
  is_primary: boolean;
}

interface LinkForm {
  student_id: number;
  parent_id: number;
  relationship_type: string;
  is_primary: boolean;
}

export function StudentParentLinksPage() {
  const queryClient = useQueryClient();
  const [studentLookupId, setStudentLookupId] = useState<number>(1);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("-id");
  const [search, setSearch] = useState("");
  const { register, handleSubmit, reset } = useForm<LinkForm>({
    defaultValues: {
      student_id: 1,
      parent_id: 1,
      relationship_type: "guardian",
      is_primary: false,
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["student-parent-links", studentLookupId],
    queryFn: async () => {
      const { data: response } = await apiClient.get<{ items: StudentParentLink[]; total: number }>(
        `/api/v1/student-parents/student/${studentLookupId}`,
      );
      return response;
    },
  });

  const links = data?.items ?? [];

  const filteredLinks = links
    .filter((item) => {
      if (!search.trim()) return true;
      const haystack = `${item.student_id} ${item.parent_id} ${item.relationship_type ?? ""}`.toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    })
    .sort((a, b) => {
      if (sort === "id") return a.id - b.id;
      if (sort === "student_id") return a.student_id - b.student_id;
      if (sort === "-student_id") return b.student_id - a.student_id;
      if (sort === "parent_id") return a.parent_id - b.parent_id;
      if (sort === "-parent_id") return b.parent_id - a.parent_id;
      return b.id - a.id;
    });

  const total = filteredLinks.length;
  const pageStart = (page - 1) * size;
  const pageRows = filteredLinks.slice(pageStart, pageStart + size);

  const linkMutation = useMutation({
    mutationFn: async (payload: LinkForm) => {
      await apiClient.post("/api/v1/student-parents/link", payload);
    },
    onSuccess: (_, payload) => {
      setStudentLookupId(payload.student_id);
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["student-parent-links", payload.student_id] });
      reset({ ...payload, parent_id: payload.parent_id + 1, is_primary: false });
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: async ({ linkId }: { linkId: number }) => {
      await apiClient.delete(`/api/v1/student-parents/${linkId}`);
    },
    onSuccess: () => {
      setPage(1);
      queryClient.invalidateQueries({ queryKey: ["student-parent-links", studentLookupId] });
    },
  });

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Student Parent Links</h1>
        <p>Create and maintain student-parent relationships with a primary guardian flag.</p>
      </section>

      <section className="panel">
        <h2>Find Links</h2>
        <div className="toolbar">
          <input
            min={1}
            onChange={(event) => setStudentLookupId(Number(event.target.value) || 1)}
            placeholder="Student ID"
            type="number"
            value={studentLookupId}
          />
        </div>
      </section>

      <section className="panel">
        <h2>Link Parent</h2>
        <form className="form-grid" onSubmit={handleSubmit((values) => linkMutation.mutate(values))}>
          <input {...register("student_id", { required: true, valueAsNumber: true })} min={1} placeholder="Student ID" type="number" />
          <input {...register("parent_id", { required: true, valueAsNumber: true })} min={1} placeholder="Parent ID" type="number" />
          <input {...register("relationship_type")} placeholder="Relationship (mother/father/guardian)" />
          <label className="field-wrap checkbox-wrap">
            <input {...register("is_primary")} type="checkbox" />
            <span>Set as primary guardian</span>
          </label>
          <button disabled={linkMutation.isPending} type="submit">
            {linkMutation.isPending ? "Linking..." : "Link Parent"}
          </button>
        </form>
      </section>

      <section className="panel table-wrap">
        <h2>Current Links {isLoading ? "(loading...)" : `(${total})`}</h2>
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
          searchPlaceholder="Filter by student, parent, relationship"
          size={size}
          sort={sort}
          sortOptions={[
            { value: "-id", label: "Newest" },
            { value: "id", label: "Oldest" },
            { value: "student_id", label: "Student ID (Asc)" },
            { value: "-student_id", label: "Student ID (Desc)" },
            { value: "parent_id", label: "Parent ID (Asc)" },
            { value: "-parent_id", label: "Parent ID (Desc)" },
          ]}
        />
        <table className="table">
          <thead>
            <tr>
              <th>Link ID</th>
              <th>Student</th>
              <th>Parent</th>
              <th>Relationship</th>
              <th>Primary</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.student_id}</td>
                <td>{item.parent_id}</td>
                <td>{item.relationship_type ?? "-"}</td>
                <td>{item.is_primary ? "Yes" : "No"}</td>
                <td>
                  <button
                    onClick={() => unlinkMutation.mutate({ linkId: item.id })}
                    type="button"
                  >
                    Unlink
                  </button>
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
