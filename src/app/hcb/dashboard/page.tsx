import { StatsCard } from "@/components/hcb/stats-card";
import { TransactionRow } from "@/components/hcb/transaction-row";
import { DEMO_ORGANIZATIONS, DEMO_STATS, DEMO_TRANSACTIONS } from "@/lib/demo-data";
import {
  Building2,
  CreditCard,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function HcbDashboardPage() {
  const recentTransactions = DEMO_TRANSACTIONS.slice(0, 6);
  const activeOrgs = DEMO_ORGANIZATIONS.filter((o) => o.status === "ACTIVE").slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back. Here&apos;s an overview of your platform.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Balance"
          value={fmt(DEMO_STATS.total_balance)}
          subtitle={`Across ${DEMO_STATS.organization_count} organizations`}
          icon={DollarSign}
        />
        <StatsCard
          title="Monthly Income"
          value={fmt(DEMO_STATS.monthly_income)}
          icon={TrendingUp}
          trend={{ value: "12% vs last month", positive: true }}
        />
        <StatsCard
          title="Monthly Expenses"
          value={fmt(DEMO_STATS.monthly_expenses)}
          icon={TrendingDown}
          trend={{ value: "3% vs last month", positive: false }}
        />
        <StatsCard
          title="Active Cards"
          value={String(DEMO_STATS.active_cards)}
          subtitle={`${DEMO_STATS.pending_transactions} pending transactions`}
          icon={CreditCard}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent transactions */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
              <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
              <Link
                href="/hcb/transactions"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            </div>
            <table className="w-full">
              <tbody>
                {recentTransactions.map((t) => (
                  <TransactionRow key={t.id} transaction={t} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Organizations list */}
        <div>
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4">
              <h2 className="font-semibold text-gray-900">Organizations</h2>
              <Link
                href="/hcb/organizations"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            </div>
            <ul className="divide-y divide-gray-50">
              {activeOrgs.map((org) => (
                <li key={org.id}>
                  <Link
                    href={`/hcb/organizations/${org.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{org.name}</p>
                        <p className="text-xs text-gray-400">
                          {org.member_count} members
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {fmt(org.balance)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-50 px-6 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Building2 className="h-4 w-4" />
                <span>
                  {DEMO_STATS.organization_count} active organizations
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
