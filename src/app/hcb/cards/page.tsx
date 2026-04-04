"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_CARDS } from "@/lib/demo-data";
import type { Card, CardStatus } from "@/lib/types";
import { CreditCard, Plus, Snowflake, XCircle } from "lucide-react";
import { useState } from "react";

const STATUS_CLASS: Record<CardStatus, string> = {
  ACTIVE: "bg-green-50 text-green-700 border-green-200",
  FROZEN: "bg-amber-50 text-amber-700 border-amber-200",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
};

const CARD_BG: Record<string, string> = {
  VIRTUAL: "from-indigo-600 to-violet-700",
  PHYSICAL: "from-gray-800 to-gray-900",
};

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>(DEMO_CARDS);

  function toggleFreeze(id: string) {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id || c.status === "CANCELLED") return c;
        return {
          ...c,
          status: c.status === "ACTIVE" ? "FROZEN" : "ACTIVE",
        };
      })
    );
  }

  const active = cards.filter((c) => c.status === "ACTIVE");
  const frozen = cards.filter((c) => c.status === "FROZEN");
  const cancelled = cards.filter((c) => c.status === "CANCELLED");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cards</h1>
          <p className="mt-1 text-sm text-gray-500">
            {active.length} active · {frozen.length} frozen · {cancelled.length} cancelled
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="h-4 w-4" />
          Issue card
        </Button>
      </div>

      {/* Card grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden"
          >
            {/* Card visual */}
            <div
              className={`bg-gradient-to-br ${CARD_BG[card.type]} p-5 text-white`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest opacity-70">
                    {card.type}
                  </p>
                  <p className="mt-1 text-sm font-medium opacity-90">
                    {card.organization?.name}
                  </p>
                </div>
                <CreditCard className="h-6 w-6 opacity-70" />
              </div>
              <p className="mt-6 font-mono text-lg tracking-widest">
                •••• •••• •••• {card.last_four}
              </p>
              <p className="mt-2 text-sm opacity-80">{card.holder_name}</p>
            </div>

            {/* Card info & actions */}
            <div className="flex items-center justify-between px-5 py-4">
              <Badge className={STATUS_CLASS[card.status]}>{card.status}</Badge>
              <div className="flex gap-2">
                {card.status !== "CANCELLED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFreeze(card.id)}
                    className="gap-1.5 text-xs"
                  >
                    <Snowflake className="h-3.5 w-3.5" />
                    {card.status === "ACTIVE" ? "Freeze" : "Unfreeze"}
                  </Button>
                )}
                {card.status !== "CANCELLED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() =>
                      setCards((prev) =>
                        prev.map((c) =>
                          c.id === card.id ? { ...c, status: "CANCELLED" } : c
                        )
                      )
                    }
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <CreditCard className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-400">No cards yet. Issue your first card.</p>
        </div>
      )}
    </div>
  );
}
