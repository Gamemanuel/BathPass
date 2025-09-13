"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import { TimePicker, TimeValue } from "@/components/time-picker";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { saveAs } from "file-saver";

type Pass = {
    id: number;
    name: string;
    destination: string | null;
    time_out: string;
    time_in: string | null;
    created_at: string;
    user_id: string;
};

export default function DashboardPage() {
    const supabase = createClient();
    const [passes, setPasses] = useState<Pass[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            const { data } = await supabase
                .from("passes")
                .select("*")
                .order("time_out", { ascending: false });

            if (data) setPasses(data);
        };
        fetchData().then();
    }, [supabase]);

    const toggleSelect = (id: number) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const calcTotalMinutes = (out: string, inn: string | null) => {
        if (!inn) return 0;
        const diff = new Date(inn).getTime() - new Date(out).getTime();
        return Math.max(Math.round(diff / 60000), 0);
    };

    const updateTime = async (id: number, field: "time_out" | "time_in", val: TimeValue) => {
        const base = new Date(field === "time_out"
            ? passes.find(p => p.id === id)!.time_out
            : passes.find(p => p.id === id)!.time_in || new Date()
        );
        base.setHours(val.period === "PM" ? val.hour + 12 : val.hour, val.minute);
        const iso = base.toISOString();

        await supabase.from("passes").update({ [field]: iso }).eq("id", id);
        setPasses(prev => prev.map(p => p.id === id ? { ...p, [field]: iso } : p));
    };

    const addPass = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from("passes")
            .insert([{ name: "New Pass", user_id: user.id }])
            .select()
            .single();

        if (!error && data) {
            setPasses(prev => [data, ...prev]);
        }
    };

    const exportCSV = (rows: Pass[]) => {
        const headers = ["id", "name", "destination", "time_out", "time_in", "created_at", "user_id"];
        const csv = [
            headers.join(","),
            ...rows.map(r =>
                headers.map(h => `"${(r as any)[h] ?? ""}"`).join(",")
            ),
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "passes.csv");
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navbar */}
            <div className="flex justify-end items-end p-4 border-b">
                <ModeToggle/>
                {user && (
                    <Image
                        src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                        alt="User avatar"
                        width={50}
                        height={50}
                        className="rounded-full pl-3"
                    />
                )}
            </div>

            {/* Controls */}
            <div className="flex justify-end gap-2 p-4">
                <Button onClick={addPass}>New Pass</Button>
                <Button variant="outline" onClick={() => exportCSV(passes)}>Export All</Button>
                <Button
                    variant="outline"
                    disabled={selected.length === 0}
                    onClick={() => exportCSV(passes.filter(p => selected.includes(p.id)))}
                >
                    Export Selected
                </Button>
            </div>

            {/* Table */}
            <div className="p-4 overflow-x-auto">
                <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
                    <thead>
                    <tr className="bg-muted">
                        <th className="p-2"></th>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Destination</th>
                        <th className="p-2 text-left">Time Out</th>
                        <th className="p-2 text-left">Time In</th>
                        <th className="p-2 text-left">Total Time</th>
                        <th className="p-2 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {passes.map(pass => (
                        <tr key={pass.id} className="border-b hover:bg-accent/50 transition-colors">
                            <td className="p-4">
                                <div className="inline-flex items-center">
                                    <label className="flex items-center cursor-pointer relative">
                                        <input type="checkbox"
                                               checked={selected.includes(pass.id)}
                                               onChange={() => toggleSelect(pass.id)}
                                               className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-[#3094FF] checked:border-[#3094FF]"
                                               id="check"/>
                                        <span
                                            className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"
                                                stroke="currentColor" strokeWidth="1">
                                        <path fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"></path>
                                      </svg>
                                    </span>
                                    </label>
                                </div>
                            </td>

                            <td className="p-2">{pass.name}</td>
                            <td className="p-2">{pass.destination || "—"}</td>

                            {/* Time Out */}
                            <td className="p-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="rounded-full px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                                        >
                                            {new Date(pass.time_out).toLocaleTimeString([], {
                                                hour: "numeric",
                                                minute: "2-digit",
                                            })}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="start"
                                        sideOffset={8}
                                        className="bg-transparent border-none shadow-none p-0"
                                    >
                                        <TimePicker
                                            value={{
                                                hour: new Date(pass.time_out).getHours() % 12 || 12,
                                                minute: new Date(pass.time_out).getMinutes(),
                                                period: new Date(pass.time_out).getHours() >= 12 ? "PM" : "AM",
                                            }}
                                            onConfirm={(val) => updateTime(pass.id, "time_out", val)}
                                            onCancel={() => {}}
                                        />
                                    </PopoverContent>

                                </Popover>
                            </td>

                            {/* Time In */}
                            <td className="p-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="rounded-full px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                                        >
                                            {pass.time_in
                                                ? new Date(pass.time_in).toLocaleTimeString([], {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                })
                                                : "—"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="start"
                                        sideOffset={8}
                                        className="bg-transparent border-none shadow-none p-0"
                                    >
                                        <TimePicker
                                            value={{
                                                hour: new Date(pass.time_out).getHours() % 12 || 12,
                                                minute: new Date(pass.time_out).getMinutes(),
                                                period: new Date(pass.time_out).getHours() >= 12 ? "PM" : "AM",
                                            }}
                                            onConfirm={(val) => updateTime(pass.id, "time_in", val)}
                                            onCancel={() => {}}
                                        />
                                    </PopoverContent>

                                </Popover>
                            </td>

                            <td className="p-2">{calcTotalMinutes(pass.time_out, pass.time_in)} min</td>

                            <td className="p-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {}}
                                >
                                    Edit Time In
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
