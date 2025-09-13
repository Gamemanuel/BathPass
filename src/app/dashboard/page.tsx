"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import { TimePicker, TimeValue } from "@/components/time-picker";

type Pass = {
    id: number;
    name: string;
    time_out: string;
    time_in: string | null;
};

export default function DashboardPage() {
    const supabase = createClient();
    const [passes, setPasses] = useState<Pass[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [user, setUser] = useState<any>(null);
    const [editingTime, setEditingTime] = useState<{ id: number; field: "time_out" | "time_in" } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            const { data } = await supabase
                .from("passes")
                .select("id, name, time_out, time_in")
                .order("time_out", { ascending: false });

            if (data) setPasses(data);
        };
        fetchData();
    }, []);

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
        const base = new Date(field === "time_out" ? passes.find(p => p.id === id)!.time_out : passes.find(p => p.id === id)!.time_in || new Date());
        base.setHours(val.period === "PM" ? val.hour + 12 : val.hour, val.minute);
        const iso = base.toISOString();

        await supabase.from("passes").update({ [field]: iso }).eq("id", id);
        setPasses(prev => prev.map(p => p.id === id ? { ...p, [field]: iso } : p));
        setEditingTime(null);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Navbar */}
            <div className="flex justify-between items-center p-4 border-b">
                <ModeToggle />
                {user && (
                    <Image
                        src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                        alt="User avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                )}
            </div>

            {/* Controls */}
            <div className="flex justify-end gap-2 p-4">
                <Button onClick={() => {/* add pass logic */}}>New Pass</Button>
                <Button variant="outline" onClick={() => {/* export all */}}>Export All</Button>
                <Button variant="outline" onClick={() => {/* export selected */}}>Export Selected</Button>
            </div>

            {/* Table */}
            <div className="p-4 overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-muted">
                        <th className="p-2"></th>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Time Out</th>
                        <th className="p-2 text-left">Time In</th>
                        <th className="p-2 text-left">Total Time</th>
                        <th className="p-2 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {passes.map(pass => (
                        <tr key={pass.id} className="border-b">
                            <td className="p-2">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(pass.id)}
                                    onChange={() => toggleSelect(pass.id)}
                                />
                            </td>
                            <td className="p-2">{pass.name}</td>
                            <td className="p-2">
                  <span
                      className="cursor-pointer text-blue-500"
                      onClick={() => setEditingTime({ id: pass.id, field: "time_out" })}
                  >
                    {new Date(pass.time_out).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </span>
                                {editingTime?.id === pass.id && editingTime.field === "time_out" && (
                                    <TimePicker
                                        onConfirm={(val) => updateTime(pass.id, "time_out", val)}
                                        onCancel={() => setEditingTime(null)}
                                    />
                                )}
                            </td>
                            <td className="p-2">
                  <span
                      className="cursor-pointer text-blue-500"
                      onClick={() => setEditingTime({ id: pass.id, field: "time_in" })}
                  >
                    {pass.time_in
                        ? new Date(pass.time_in).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                        : "—"}
                  </span>
                                {editingTime?.id === pass.id && editingTime.field === "time_in" && (
                                    <TimePicker
                                        onConfirm={(val) => updateTime(pass.id, "time_in", val)}
                                        onCancel={() => setEditingTime(null)}
                                    />
                                )}
                            </td>
                            <td className="p-2">{calcTotalMinutes(pass.time_out, pass.time_in)} min</td>
                            <td className="p-2">
                                <Button size="sm" variant="outline" onClick={() => setEditingTime({ id: pass.id, field: "time_in" })}>
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
