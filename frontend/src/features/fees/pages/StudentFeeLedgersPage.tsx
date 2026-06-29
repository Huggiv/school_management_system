import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TablePagination } from "@/components/data/TablePagination";
import { TableQueryControls } from "@/components/data/TableQueryControls";
import { apiClient } from "@/lib/api/client";

interface StudentFeeLedgerRecord {
  id: number;
  student_id: number;
  fee_structure_id: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: string;
}

interface StudentFeeLedgerForm {
  student_id: number;
  fee_structure_id: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: string;
}

export function StudentFeeLedgersPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("-id");
  const [search, setSearch] = useState("");
  const { register, handleSubmit, reset, watch, setValue } = useForm<StudentFeeLedgerForm>({
    defaultValues: { status: "pending", paid_amount: 0 },
  });

  const totalAmount = watch("total_amount");
  const paidAmount = watch("paid_amount");

  const { data } = useQuery({
    queryKey: ["student-fee-ledgers", page, size, sort, search],
    queryFn: async () => {
      const { data: response } = await apiClient.get<{ items: StudentFeeLedgerRecord[]; total: number }>(
        "/api/v1/student-fee-ledgers/",
        { params: { page, size, sort, search: search || undefined } },
      );
      return response;
    },
  });

  const records = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;

  const upsert = useMutation({
    mutationFn: async (payload: StudentFeeLedgerForm) => {
      const body = {
        student_id: payload.student_id,
        fee_structure_id: payload.fee_structure_id,
        total_amount: payload.total_amount,
        paid_amount: payload.paid_amount,
        pending_amount: payload.pending_amount,
        status: payload.status,
      };
      if (selectedId) {
        await apiClient.put(`/api/v1/student-fee-ledgers/${selectedId}`, body);
      } else {
        await apiClient.post("/api/v1/student-fee-ledgers/", body);
      }
    },
    onSuccess: () => {
      setSelectedId(null);
      reset({ status: "pending", paid_amount: 0 });
      queryClient.invalidateQueries({ queryKey: ["student-fee-ledgers"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/api/v1/student-fee-ledgers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-fee-ledgers"] }),
  });

  const totals = useMemo(() => {
    const total = records.reduce((sum, row) => sum + Number(row.total_amount), 0);
    const paid = records.reduce((sum, row) => sum + Number(row.paid_amount), 0);
    const pending = records.reduce((sum, row) => sum + Number(row.pending_amount), 0);
    return {
      total: total.toFixed(2),
      paid: paid.toFixed(2),
      pending: pending.toFixed(2),
    };
  }, [records]);

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Student Fee Ledgers</h1>
        <p>Track student-level billing, collections, and pending balances.</p>
      </section>

      <section className="stats-grid compact">
        <article className="stat-card">
          <span>Total Billed</span>
          <strong>{totals.total}</strong>
        </article>
        <article className="stat-card">
          <span>Total Paid</span>
          <strong>{totals.paid}</strong>
        </article>
        <article className="stat-card">
          <span>Total Pending</span>
          <strong>{totals.pending}</strong>
        </article>
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
          searchPlaceholder="Search status"
          size={size}
          sort={sort}
          sortOptions={[
            { value: "-id", label: "Newest" },
            { value: "id", label: "Oldest" },
            { value: "status", label: "Status (A-Z)" },
            { value: "-status", label: "Status (Z-A)" },
            { value: "pending_amount", label: "Pending (Low to High)" },
            { value: "-pending_amount", label: "Pending (High to Low)" },
          ]}
        />
        <h2>{selectedId ? `Edit Ledger #${selectedId}` : "Create Ledger"}</h2>
        <form className="form-grid" onSubmit={handleSubmit((values) => upsert.mutate(values))}>
          <input {...register("student_id", { required: true, valueAsNumber: true })} min={1} placeholder="Student ID" type="number" />
          <input {...register("fee_structure_id", { required: true, valueAsNumber: true })} min={1} placeholder="Fee structure ID" type="number" />
          <input
            {...register("total_amount", { required: true, valueAsNumber: true })}
            min={0}
            onBlur={() => setValue("pending_amount", Math.max(0, Number(totalAmount || 0) - Number(paidAmount || 0)))}
            placeholder="Total amount"
            step="0.01"
            type="number"
          />
          <input
            {...register("paid_amount", { required: true, valueAsNumber: true })}
            min={0}
            onBlur={() => setValue("pending_amount", Math.max(0, Number(totalAmount || 0) - Number(paidAmount || 0)))}
            placeholder="Paid amount"
            step="0.01"
            type="number"
          />
          <input {...register("pending_amount", { required: true, valueAsNumber: true })} min={0} placeholder="Pending amount" step="0.01" type="number" />
          <select {...register("status", { required: true })}>
            <option value="pending">pending</option>
            <option value="partial">partial</option>
            <option value="paid">paid</option>
            <option value="overdue">overdue</option>
          </select>
          <button disabled={upsert.isPending} type="submit">
            {upsert.isPending ? "Saving..." : selectedId ? "Update Ledger" : "Create Ledger"}
          </button>
        </form>
      </section>

      <section className="panel table-wrap">
        <h2>Ledgers ({total})</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Structure</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Pending</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.student_id}</td>
                <td>{item.fee_structure_id}</td>
                <td>{item.total_amount}</td>
                <td>{item.paid_amount}</td>
                <td className={Number(item.pending_amount) > 0 ? "fee-pending-highlight" : undefined}>{item.pending_amount}</td>
                <td>{item.status}</td>
                <td>
                  <div className="grid-row-actions">
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        reset({
                          student_id: item.student_id,
                          fee_structure_id: item.fee_structure_id,
                          total_amount: Number(item.total_amount),
                          paid_amount: Number(item.paid_amount),
                          pending_amount: Number(item.pending_amount),
                          status: item.status,
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
