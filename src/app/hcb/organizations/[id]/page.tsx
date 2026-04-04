"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransactionRow } from "@/components/hcb/transaction-row";
import {
  DEMO_CARDS,
  DEMO_ORGANIZATIONS,
  DEMO_TRANSACTIONS,
  DEMO_USERS,
} from "@/lib/demo-data";
import { CreditCard, Users, ReceiptText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

type Tab = "transactions" | "members" | "cards";

export default function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [tab, setTab] = useState<Tab>("transactions");

  const org = DEMO_ORGANIZATIONS.find((o) => o.id === id);
  if (!org) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-lg font-semibold text-gray-700">Organization not found</p>
        <Link href="/hcb/organizations">
          <Button variant="outline">Back to organizations</Button>
        </Link>
      </div>
    );
  }

  const transactions = DEMO_TRANSACTIONS.filter((t) => t.org_id === id);
  const cards = DEMO_CARDS.filter((c) => c.org_id === id);
  // Simulate members from demo users
  const members = DEMO_USERS.slice(0, 3);

  const CARD_STATUS_CLASS: Record<string, string> = {
    ACTIVE: "bg-green-50 text-green-700 border-green-200",
    FROZEN: "bg-amber-50 text-amber-700 border-amber-200",
    CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/hcb/organizations"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to organizations
      </Link>

      {/* Org header */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
              {org.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
              <p className="text-sm text-gray-500">/{org.slug}</p>
              {org.description && (
                <p className="mt-1 text-sm text-gray-600">{org.description}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{fmt(org.balance)}</p>
            <p className="text-sm text-gray-400">Current balance</p>
            <Badge
              className={
                org.status === "ACTIVE"
                  ? "mt-2 bg-green-50 text-green-700 border-green-200"
                  : "mt-2 bg-gray-100 text-gray-500"
              }
            >
              {org.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-100 bg-white p-1 shadow-sm w-fit">
        {(["transactions", "members", "cards"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {tab === "transactions" && (
          <>
            <div className="border-b border-gray-50 px-6 py-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ReceiptText className="h-4 w-4" /> Transactions
              </h2>
            </div>
            {transactions.length === 0 ? (
              <p className="py-12 text-center text-gray-400">No transactions yet.</p>
            ) : (
              <table className="w-full">
                <tbody>
                  {transactions.map((t) => (
                    <TransactionRow key={t.id} transaction={t} showOrg={false} />
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {tab === "members" && (
          <>
            <div className="border-b border-gray-50 px-6 py-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4" /> Members
              </h2>
            </div>
            <ul className="divide-y divide-gray-50">
              {members.map((u) => (
                <li key={u.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                      {(u.full_name ?? u.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {u.full_name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    {u.access_level}
                  </Badge>
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === "cards" && (
          <>
            <div className="border-b border-gray-50 px-6 py-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Cards
              </h2>
            </div>
            {cards.length === 0 ? (
              <p className="py-12 text-center text-gray-400">No cards yet.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {cards.map((c) => (
                  <li key={c.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        •••• {c.last_four}
                      </p>
                      <p className="text-xs text-gray-400">
                        {c.type} · {c.holder_name}
                      </p>
                    </div>
                    <Badge className={CARD_STATUS_CLASS[c.status]}>{c.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
