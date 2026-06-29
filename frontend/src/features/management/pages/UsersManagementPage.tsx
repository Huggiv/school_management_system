import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TablePagination } from "@/components/data/TablePagination";
import { TableQueryControls } from "@/components/data/TableQueryControls";
import { apiClient } from "@/lib/api/client";
import type { UserRole } from "@/types/auth";

interface UserRecord {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  is_active?: boolean;
}

interface UserUpdateForm {
  first_name: string;
  last_name: string;
  role: UserRole;
  phone: string;
}

export function UsersManagementPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("-id");
  const [search, setSearch] = useState("");
  const { register, handleSubmit, reset } = useForm<UserUpdateForm>();

  const { data, isLoading } = useQuery({
    queryKey: ["management-users", page, size, sort, search],
    queryFn: async () => {
      const { data: response } = await apiClient.get<{ items: UserRecord[]; total: number }>("/api/v1/users", {
        params: { page, size, sort, search: search || undefined },
      });
      return response;
    },
  });

  const users = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;

  const updateUser = useMutation({
    mutationFn: async (payload: UserUpdateForm) => {
      if (!selectedId) return;
      await apiClient.put(`/api/v1/users/${selectedId}`, {
        first_name: payload.first_name,
        last_name: payload.last_name,
        role: payload.role,
        phone: payload.phone || null,
      });
    },
    onSuccess: () => {
      setSelectedId(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ["management-users"] });
    },
  });

  const roleStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const user of users) {
      counts[user.role] = (counts[user.role] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [users]);

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Users Management</h1>
        <p>Review registered users and update profile-access fields.</p>
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
          searchPlaceholder="Search by name, email, role"
          size={size}
          sort={sort}
          sortOptions={[
            { value: "-id", label: "Newest" },
            { value: "id", label: "Oldest" },
            { value: "first_name", label: "First Name (A-Z)" },
            { value: "-first_name", label: "First Name (Z-A)" },
            { value: "last_name", label: "Last Name (A-Z)" },
            { value: "-last_name", label: "Last Name (Z-A)" },
            { value: "email", label: "Email (A-Z)" },
            { value: "-email", label: "Email (Z-A)" },
          ]}
        />
        <div className="stats-grid compact">
          {roleStats.map(([role, count]) => (
            <article className="stat-card" key={role}>
              <span>{role}</span>
              <strong>{count}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>{selectedId ? `Edit User #${selectedId}` : "Select a user to edit"}</h2>
        <form className="form-grid" onSubmit={handleSubmit((values) => updateUser.mutate(values))}>
          <input {...register("first_name", { required: true })} placeholder="First name" />
          <input {...register("last_name", { required: true })} placeholder="Last name" />
          <select {...register("role", { required: true })}>
            <option value="administrator">administrator</option>
            <option value="principal">principal</option>
            <option value="teacher">teacher</option>
            <option value="student">student</option>
            <option value="parent">parent</option>
            <option value="guest">guest</option>
          </select>
          <input {...register("phone")} placeholder="Phone" />
          <button disabled={!selectedId || updateUser.isPending} type="submit">
            {updateUser.isPending ? "Updating..." : "Update User"}
          </button>
        </form>
      </section>

      <section className="panel table-wrap">
        <h2>Users {isLoading ? "(loading...)" : `(${total})`}</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  {item.first_name} {item.last_name}
                </td>
                <td>{item.email}</td>
                <td>{item.role}</td>
                <td>{item.phone ?? "-"}</td>
                <td>{item.is_active === false ? "Inactive" : "Active"}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedId(item.id);
                      reset({
                        first_name: item.first_name,
                        last_name: item.last_name,
                        role: item.role,
                        phone: item.phone ?? "",
                      });
                    }}
                    type="button"
                  >
                    Edit
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
