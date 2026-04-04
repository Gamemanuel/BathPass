import { Badge } from "@/components/ui/badge";
import type { Transaction, TransactionStatus, TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Undo2 } from "lucide-react";

const TYPE_META: Record<
  TransactionType,
  { label: string; icon: React.ElementType; color: string }
> = {
  INCOME: { label: "Income", icon: ArrowDownLeft, color: "text-green-600" },
  EXPENSE: { label: "Expense", icon: ArrowUpRight, color: "text-red-500" },
  TRANSFER: { label: "Transfer", icon: RefreshCw, color: "text-blue-500" },
  REIMBURSEMENT: { label: "Reimbursement", icon: Undo2, color: "text-amber-600" },
};

const STATUS_VARIANT: Record<
  TransactionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  CLEARED: "default",
  PENDING: "secondary",
  DECLINED: "destructive",
};

const STATUS_CLASS: Record<TransactionStatus, string> = {
  CLEARED: "bg-green-50 text-green-700 border-green-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  DECLINED: "bg-red-50 text-red-700 border-red-200",
};

interface TransactionRowProps {
  transaction: Transaction;
  showOrg?: boolean;
}

export function TransactionRow({ transaction, showOrg = true }: TransactionRowProps) {
  const meta = TYPE_META[transaction.type];
  const Icon = meta.icon;
  const isPositive = transaction.type === "INCOME";
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(transaction.amount);

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              isPositive ? "bg-green-50" : "bg-red-50"
            )}
          >
            <Icon className={cn("h-4 w-4", meta.color)} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 line-clamp-1">
              {transaction.description}
            </p>
            {showOrg && transaction.organization && (
              <p className="text-xs text-gray-400">{transaction.organization.name}</p>
            )}
          </div>
        </div>
      </td>
      <td className="hidden px-3 py-3 text-sm text-gray-500 sm:table-cell">
        <Badge variant={STATUS_VARIANT[transaction.status]} className={STATUS_CLASS[transaction.status]}>
          {transaction.status}
        </Badge>
      </td>
      <td className="hidden px-3 py-3 text-sm text-gray-500 md:table-cell">
        {meta.label}
      </td>
      <td className="hidden px-3 py-3 text-sm text-gray-400 lg:table-cell">
        {format(new Date(transaction.date), "MMM d, yyyy")}
      </td>
      <td className="py-3 pl-3 pr-4 text-right">
        <span
          className={cn(
            "text-sm font-semibold",
            isPositive ? "text-green-600" : "text-gray-900"
          )}
        >
          {isPositive ? "+" : "-"}
          {formattedAmount}
        </span>
      </td>
    </tr>
  );
}
