"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEMO_ORGANIZATIONS } from "@/lib/demo-data";
import type { Organization } from "@/lib/types";
import { Building2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const STATUS_CLASS: Record<Organization["status"], string> = {
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  SUSPENDED: "bg-amber-50 text-amber-700 border-amber-200",
  CLOSED: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function OrganizationsPage() {
  const [search, setSearch] = useState("");

  const filtered = DEMO_ORGANIZATIONS.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="mt-1 text-sm text-gray-500">
            {DEMO_ORGANIZATIONS.length} total organizations
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          New organization
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search organizations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-6 py-3">Organization</th>
              <th className="hidden px-6 py-3 sm:table-cell">Status</th>
              <th className="hidden px-6 py-3 md:table-cell">Members</th>
              <th className="px-6 py-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-400">
                  <Building2 className="mx-auto mb-2 h-8 w-8" />
                  No organizations found
                </td>
              </tr>
            ) : (
              filtered.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/hcb/organizations/${org.id}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                        {org.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{org.name}</p>
                        <p className="text-xs text-gray-400">/{org.slug}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="hidden px-6 py-4 sm:table-cell">
                    <Badge className={STATUS_CLASS[org.status]}>{org.status}</Badge>
                  </td>
                  <td className="hidden px-6 py-4 text-gray-600 md:table-cell">
                    {org.member_count ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    {fmt(org.balance)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
