import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/hcb/stats-card";
import {
  DEMO_CARDS,
  DEMO_ORGANIZATIONS,
  DEMO_TRANSACTIONS,
  DEMO_USERS,
} from "@/lib/demo-data";
import { Building2, CreditCard, DollarSign, Users } from "lucide-react";
import Link from "next/link";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function AdminPage() {
  const pendingTxns = DEMO_TRANSACTIONS.filter((t) => t.status === "PENDING");
  const totalBalance = DEMO_ORGANIZATIONS.reduce((s, o) => s + o.balance, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform-wide statistics and management.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Balance"
          value={fmt(totalBalance)}
          icon={DollarSign}
          subtitle="All organizations"
        />
        <StatsCard
          title="Organizations"
          value={String(DEMO_ORGANIZATIONS.length)}
          icon={Building2}
          subtitle={`${DEMO_ORGANIZATIONS.filter((o) => o.status === "ACTIVE").length} active`}
        />
        <StatsCard
          title="Users"
          value={String(DEMO_USERS.length)}
          icon={Users}
        />
        <StatsCard
          title="Active Cards"
          value={String(DEMO_CARDS.filter((c) => c.status === "ACTIVE").length)}
          icon={CreditCard}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* All organizations */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 px-6 py-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">All Organizations</h2>
            <Link href="/hcb/organizations" className="text-sm text-indigo-600 hover:text-indigo-700">
              Manage
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DEMO_ORGANIZATIONS.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-medium text-gray-900">{org.name}</td>
                  <td className="px-6 py-3">
                    <Badge
                      className={
                        org.status === "ACTIVE"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-500"
                      }
                    >
                      {org.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900">
                    {fmt(org.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pending transactions */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-50 px-6 py-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              Pending Transactions
              {pendingTxns.length > 0 && (
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  {pendingTxns.length}
                </span>
              )}
            </h2>
            <Link href="/hcb/transactions" className="text-sm text-indigo-600 hover:text-indigo-700">
              View all
            </Link>
          </div>
          {pendingTxns.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              No pending transactions 🎉
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-gray-900">
                      <p className="font-medium">{t.description}</p>
                      <p className="text-xs text-gray-400">{t.organization?.name}</p>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-900">
                      {fmt(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Users list */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden lg:col-span-2">
          <div className="border-b border-gray-50 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Users</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3">User</th>
                <th className="hidden px-6 py-3 sm:table-cell">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="hidden px-6 py-3 md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DEMO_USERS.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 font-medium text-gray-900">
                    {u.full_name ?? "—"}
                  </td>
                  <td className="hidden px-6 py-3 text-gray-500 sm:table-cell">
                    {u.email}
                  </td>
                  <td className="px-6 py-3">
                    <Badge
                      className={
                        u.access_level === "ADMIN"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-gray-100 text-gray-500"
                      }
                    >
                      {u.access_level}
                    </Badge>
                  </td>
                  <td className="hidden px-6 py-3 text-gray-400 md:table-cell">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
