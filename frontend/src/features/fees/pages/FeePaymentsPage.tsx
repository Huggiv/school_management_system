import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TablePagination } from "@/components/data/TablePagination";
import { TableQueryControls } from "@/components/data/TableQueryControls";
import { apiClient } from "@/lib/api/client";

interface FeePaymentRecord {
  id: number;
  ledger_id: number;
  amount: number;
  paid_on: string;
  mode: string;
  reference_no?: string | null;
  collected_by_user_id?: number | null;
}

interface FeePaymentForm {
  ledger_id: number;
  amount: number;
  paid_on: string;
  mode: string;
  reference_no: string;
  collected_by_user_id?: number;
}

export function FeePaymentsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("-paid_on");
  const [search, setSearch] = useState("");
  const { register, handleSubmit, reset } = useForm<FeePaymentForm>({
    defaultValues: {
      paid_on: new Date().toISOString().slice(0, 10),
      mode: "cash",
    },
  });

  const { data } = useQuery({
    queryKey: ["fee-payments", page, size, sort, search],
    queryFn: async () => {
      const { data: response } = await apiClient.get<{ items: FeePaymentRecord[]; total: number }>("/api/v1/fee-payments/", {
        params: { page, size, sort, search: search || undefined },
      });
      return response;
    },
  });

  const records = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;

  const upsert = useMutation({
    mutationFn: async (payload: FeePaymentForm) => {
      const body = {
        ledger_id: payload.ledger_id,
        amount: payload.amount,
        paid_on: payload.paid_on,
        mode: payload.mode,
        reference_no: payload.reference_no.trim() || null,
        collected_by_user_id: payload.collected_by_user_id || null,
      };
      if (selectedId) {
        await apiClient.put(`/api/v1/fee-payments/${selectedId}`, body);
      } else {
        await apiClient.post("/api/v1/fee-payments/", body);
      }
    },
    onSuccess: () => {
      setSelectedId(null);
      reset({
        paid_on: new Date().toISOString().slice(0, 10),
        mode: "cash",
        ledger_id: undefined,
        amount: undefined,
        reference_no: "",
        collected_by_user_id: undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["fee-payments"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/api/v1/fee-payments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["fee-payments"] }),
  });

  const summary = useMemo(() => {
    const totalCollected = records.reduce((sum, row) => sum + Number(row.amount), 0);
    const modeMap: Record<string, number> = {};
    for (const row of records) {
      modeMap[row.mode] = (modeMap[row.mode] ?? 0) + Number(row.amount);
    }

    return {
      totalCollected: totalCollected.toFixed(2),
      byMode: Object.entries(modeMap).sort((a, b) => b[1] - a[1]),
    };
  }, [records]);

  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>Fee Payments</h1>
        <p>Capture payment entries and monitor collection channels.</p>
      </section>

      <section className="stats-grid compact">
        <article className="stat-card">
          <span>Total Collected</span>
          <strong>{summary.totalCollected}</strong>
        </article>
        {summary.byMode.map(([mode, amount]) => (
          <article className="stat-card" key={mode}>
            <span>{mode}</span>
            <strong>{amount.toFixed(2)}</strong>
          </article>
        ))}
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
          searchPlaceholder="Search by mode/reference"
          size={size}
          sort={sort}
          sortOptions={[
            { value: "-paid_on", label: "Latest Payment Date" },
            { value: "paid_on", label: "Oldest Payment Date" },
            { value: "-amount", label: "Amount (High to Low)" },
            { value: "amount", label: "Amount (Low to High)" },
            { value: "mode", label: "Mode (A-Z)" },
            { value: "-mode", label: "Mode (Z-A)" },
          ]}
        />
        <h2>{selectedId ? `Edit Payment #${selectedId}` : "Create Payment"}</h2>
        <form className="form-grid" onSubmit={handleSubmit((values) => upsert.mutate(values))}>
          <input {...register("ledger_id", { required: true, valueAsNumber: true })} min={1} placeholder="Ledger ID" type="number" />
          <input {...register("amount", { required: true, valueAsNumber: true })} min={0} placeholder="Amount" step="0.01" type="number" />
          <input {...register("paid_on", { required: true })} type="date" />
          <select {...register("mode", { required: true })}>
            <option value="cash">cash</option>
            <option value="card">card</option>
            <option value="upi">upi</option>
            <option value="bank">bank</option>
          </select>
          <input {...register("reference_no")} placeholder="Reference number" />
          <input {...register("collected_by_user_id", { valueAsNumber: true })} min={1} placeholder="Collected by user ID" type="number" />
          <button disabled={upsert.isPending} type="submit">
            {upsert.isPending ? "Saving..." : selectedId ? "Update Payment" : "Create Payment"}
          </button>
        </form>
      </section>

      <section className="panel table-wrap">
        <h2>Payment Entries ({total})</h2>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ledger</th>
              <th>Amount</th>
              <th>Paid On</th>
              <th>Mode</th>
              <th>Reference</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.ledger_id}</td>
                <td>{item.amount}</td>
                <td>{item.paid_on}</td>
                <td>{item.mode}</td>
                <td>{item.reference_no ?? "-"}</td>
                <td>
                  <div className="grid-row-actions">
                    <button
                      onClick={() => {
                        setSelectedId(item.id);
                        reset({
                          ledger_id: item.ledger_id,
                          amount: Number(item.amount),
                          paid_on: item.paid_on,
                          mode: item.mode,
                          reference_no: item.reference_no ?? "",
                          collected_by_user_id: item.collected_by_user_id ?? undefined,
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
