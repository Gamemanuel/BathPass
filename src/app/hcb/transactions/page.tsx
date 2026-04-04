"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransactionRow } from "@/components/hcb/transaction-row";
import { DEMO_TRANSACTIONS } from "@/lib/demo-data";
import type { Transaction, TransactionStatus, TransactionType } from "@/lib/types";
import { Download, Filter } from "lucide-react";
import { useState, useMemo } from "react";

const TYPES: Array<TransactionType | "ALL"> = [
  "ALL",
  "INCOME",
  "EXPENSE",
  "TRANSFER",
  "REIMBURSEMENT",
];
const STATUSES: Array<TransactionStatus | "ALL"> = ["ALL", "CLEARED", "PENDING", "DECLINED"];

function exportCSV(transactions: Transaction[]) {
  const header = "id,date,type,description,amount,status,organization\n";
  const rows = transactions.map((t) =>
    [
      t.id,
      t.date,
      t.type,
      `"${t.description}"`,
      t.amount,
      t.status,
      t.organization?.name ?? "",
    ].join(",")
  );
  const csv = header + rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "ALL">("ALL");

  const filtered = useMemo(
    () =>
      DEMO_TRANSACTIONS.filter((t) => {
        const matchSearch =
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          (t.organization?.name ?? "").toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "ALL" || t.type === typeFilter;
        const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
        return matchSearch && matchType && matchStatus;
      }),
    [search, typeFilter, statusFilter]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            {filtered.length} of {DEMO_TRANSACTIONS.length} transactions
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => exportCSV(filtered)}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Input
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t as TransactionType | "ALL")}
                className={`rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  typeFilter === t
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t === "ALL" ? "All types" : t.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as TransactionStatus | "ALL")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-indigo-600 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {s === "ALL" ? "All statuses" : s.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Transaction</th>
              <th className="hidden px-4 py-3 sm:table-cell">Status</th>
              <th className="hidden px-4 py-3 md:table-cell">Type</th>
              <th className="hidden px-4 py-3 lg:table-cell">Date</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  No transactions match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((t) => <TransactionRow key={t.id} transaction={t} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
