"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import Papa from "papaparse";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditPassDialog } from "./dialogs/edit-pass-dialog";

type Pass = {
    id: number;
    name: string;
    destination: string | null;
    time_out: string;
    time_in: string | null;
    created_at: string;
    user_id: string;
};

export default function DashboardTable({
                                           initialPasses,
                                           userId,
                                       }: {
    initialPasses: Pass[];
    userId: string;
}) {
    const supabase = createClientComponentClient();
    const router = useRouter();

    const [passes, setPasses] = useState<Pass[]>(initialPasses);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Record<number, boolean>>({});
    const [editing, setEditing] = useState<Pass | null>(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return passes;
        return passes.filter((p) => {
            const fields = [p.name, p.destination || ""].map((s) => s.toLowerCase());
            return fields.some((f) => f.includes(q));
        });
    }, [passes, query]);

    const allSelected =
        filtered.length > 0 && filtered.every((p) => selected[p.id]);
    const someSelected = filtered.some((p) => selected[p.id]);

    function toggleSelectAll(checked: boolean) {
        setSelected((prev) => {
            const next = { ...prev };
            filtered.forEach((p) => (next[p.id] = checked));
            return next;
        });
    }

    function toggleRow(id: number, checked: boolean) {
        setSelected((prev) => ({ ...prev, [id]: checked }));
    }

    function toCSV(rows: Pass[]) {
        const mapped = rows.map((p) => ({
            id: p.id,
            name: p.name,
            destination: p.destination ?? "",
            time_out: p.time_out,
            time_in: p.time_in ?? "",
            total_minutes:
                p.time_in && p.time_out
                    ? Math.round(
                        (new Date(p.time_in).getTime() -
                            new Date(p.time_out).getTime()) / 60000
                    )
                    : "",
            created_at: p.created_at,
        }));
        const csv = Papa.unparse(mapped);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "passes.csv";
        a.click();
        URL.revokeObjectURL(url);
    }

    function handleExportAll() {
        if (filtered.length === 0) {
            toast.error("Nothing to export", {
                description: "No rows match your current filters.",
            });
            return;
        }
        toCSV(filtered);
        toast.success("Export complete", {
            description: `${filtered.length} row${filtered.length === 1 ? "" : "s"} exported.`,
        });
    }

    function handleExportSelected() {
        const rows = passes.filter((p) => selected[p.id]);
        if (rows.length === 0) {
            toast.error("No rows selected", { description: "Select rows to export." });
            return;
        }
        toCSV(rows);
        toast.success("Export complete", {
            description: `${rows.length} row${rows.length === 1 ? "" : "s"} exported.`,
        });
    }

    async function handleTimeAction(p: Pass) {
        const nextTimeIn = p.time_in ? null : new Date().toISOString();
        const prev = p;
        const optimistic = passes.map((row) =>
            row.id === p.id ? { ...row, time_in: nextTimeIn } : row
        );
        setPasses(optimistic);

        const { error } = await supabase
            .from("passes")
            .update({ time_in: nextTimeIn })
            .eq("id", p.id)
            .eq("user_id", userId);

        if (error) {
            setPasses((prevState) =>
                prevState.map((row) => (row.id === p.id ? prev : row))
            );
            toast.error("Update failed", { description: error.message });
        } else {
            toast.success(nextTimeIn ? "Return time set" : "Return time cleared", {
                description: nextTimeIn
                    ? "Marked as returned now."
                    : "Student is marked as still out.",
            });
            router.refresh();
        }
    }

    async function onSaveEdit(updated: Partial<Pass> & { id: number }) {
        const idx = passes.findIndex((x) => x.id === updated.id);
        if (idx === -1) return;

        const nextRow = { ...passes[idx], ...updated };
        const optimistic = [...passes];
        const prevRow = passes[idx];
        optimistic[idx] = nextRow;
        setPasses(optimistic);

        const payload: Partial<Pass> = {
            name: nextRow.name,
            destination: nextRow.destination ?? null,
            time_out: nextRow.time_out,
            time_in: nextRow.time_in,
        };

        const { error } = await supabase
            .from("passes")
            .update(payload)
            .eq("id", nextRow.id)
            .eq("user_id", userId);

        if (error) {
            setPasses((prev) => {
                const copy = [...prev];
                copy[idx] = prevRow;
                return copy;
            });
            toast.error("Save failed", { description: error.message });
        } else {
            toast.success("Pass updated");
            setEditing(null);
            router.refresh();
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search by name or destination"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-[280px]"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={handleExportAll}>
                        Export All
                    </Button>
                    <Button onClick={handleExportSelected} disabled={!someSelected}>
                        Export Selected
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[48px]">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Time Out</TableHead>
                            <TableHead>Time In</TableHead>
                            <TableHead>Total Time</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((p) => {
                            const minutes =
                                p.time_in && p.time_out
                                    ? Math.round(
                                        (new Date(p.time_in).getTime() -
                                            new Date(p.time_out).getTime()) /
                                        60000
                                    )
                                    : null;

                            return (
                                <TableRow key={p.id}>
                                    <TableCell className="w-[48px]">
                                        <Checkbox
                                            checked={!!selected[p.id]}
                                            onCheckedChange={(v) => toggleRow(p.id, Boolean(v))}
                                            aria-label={`Select row ${p.id}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell>{p.destination ?? "—"}</TableCell>
                                    <TableCell>
                                        {p.time_out ? format(new Date(p.time_out), "p") : "—"}
                                    </TableCell>
                                    <TableCell>
                                        {p.time_in ? format(new Date(p.time_in), "p") : "—"}
                                    </TableCell>
                                    <TableCell>
                                        {minutes !== null ? `${minutes} min` : "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="inline-flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleTimeAction(p)}
                                            >
                                                Time
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" variant="ghost">
                                                        •••
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditing(p)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center text-sm text-muted-foreground py-10"
                                >
                                    No results
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <EditPassDialog
                open={!!editing}
                onOpenChange={(o) => !o && setEditing(null)}
                passData={editing}
                onSave={onSaveEdit}
            />
        </div>
    );
}