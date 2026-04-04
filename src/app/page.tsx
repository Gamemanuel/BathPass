import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CreditCard,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold tracking-tight text-indigo-600">HCB</span>
          <nav className="hidden gap-6 text-sm font-medium text-gray-600 sm:flex">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#how" className="hover:text-gray-900">How it works</a>
          </nav>
          <Link href="/hcb/dashboard">
            <Button size="sm">Sign in</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">
        <span className="mb-4 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">
          Fiscal sponsorship, simplified
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Fiscal sponsorship<br />
          <span className="text-indigo-600">made simple.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-500">
          HCB gives student organizations and nonprofits a transparent, easy-to-use
          financial platform — bank accounts, cards, reimbursements, and more under
          one roof.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/hcb/dashboard">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Get started free
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="outline">
              Learn more
            </Button>
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-gray-100 px-6 py-8 sm:grid-cols-4">
          {[
            { label: "Organizations", value: "1,200+" },
            { label: "Funds managed", value: "$9.2M+" },
            { label: "Transactions", value: "45K+" },
            { label: "Cards issued", value: "3,800+" },
          ].map(({ label, value }) => (
            <div key={label} className="px-6 text-center">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="mt-1 text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Everything your organization needs
        </h2>
        <p className="mt-3 text-center text-gray-500">
          A complete financial toolkit built for transparency and speed.
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Transparent finances",
              description:
                "Every transaction is logged and visible to your team. No hidden fees, no surprises.",
            },
            {
              icon: CreditCard,
              title: "Instant virtual cards",
              description:
                "Issue virtual Visa cards to team members in seconds. Freeze or cancel with one click.",
            },
            {
              icon: ReceiptText,
              title: "Easy reimbursements",
              description:
                "Submit receipts online and get reimbursed quickly with full audit trails.",
            },
            {
              icon: TrendingUp,
              title: "Real-time analytics",
              description:
                "Live balance updates, monthly income/expense charts, and exportable reports.",
            },
            {
              icon: Users,
              title: "Team management",
              description:
                "Invite members, assign roles, and control who can spend and approve.",
            },
            {
              icon: Building2,
              title: "Multi-org support",
              description:
                "Manage multiple organizations under one account. Perfect for umbrella groups.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                <Icon className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-indigo-50 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { step: "1", title: "Create an organization", body: "Sign up and create your fiscal sponsor account in minutes." },
              { step: "2", title: "Add your team", body: "Invite members and assign roles. Everyone gets visibility." },
              { step: "3", title: "Start spending & earning", body: "Issue cards, log donations, submit reimbursements — all in one place." },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">
                  {step}
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/hcb/dashboard">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Get started now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} HCB — Fiscal Sponsorship Platform
      </footer>
    </div>
  );
}