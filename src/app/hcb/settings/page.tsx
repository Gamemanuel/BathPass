"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_USERS } from "@/lib/demo-data";
import { useState } from "react";

export default function SettingsPage() {
  const demo = DEMO_USERS[0];
  const [form, setForm] = useState({
    full_name: demo.full_name ?? "",
    email: demo.email,
    phone: demo.phone ?? "",
  });
  const [notifications, setNotifications] = useState({
    email_transactions: true,
    email_summaries: false,
    email_card_activity: true,
  });
  const [saved, setSaved] = useState(false);

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your profile and preferences.</p>
      </div>

      {/* Profile */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-6">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
              {(form.full_name || form.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{form.full_name || "No name"}</p>
              <p className="text-sm text-gray-500">{form.email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 555-0100"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Save changes
            </Button>
            {saved && (
              <span className="text-sm font-medium text-green-600">
                ✓ Saved successfully
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-6">Notifications</h2>
        <div className="space-y-4">
          {(
            [
              {
                key: "email_transactions" as const,
                label: "Transaction alerts",
                description: "Get emailed when a transaction is created or updated.",
              },
              {
                key: "email_summaries" as const,
                label: "Monthly summaries",
                description: "Receive a monthly financial summary for your organizations.",
              },
              {
                key: "email_card_activity" as const,
                label: "Card activity",
                description: "Be notified when a card is issued, frozen, or cancelled.",
              },
            ] as const
          ).map(({ key, label, description }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifications[key]}
                onClick={() =>
                  setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  notifications[key] ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    notifications[key] ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-100 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-red-600 mb-4">Danger zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
          Delete account
        </Button>
      </div>
    </div>
  );
}
