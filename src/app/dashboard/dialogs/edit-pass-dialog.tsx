"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Pass = {
    id: number;
    name: string;
    destination: string | null;
    time_out: string;
    time_in: string | null;
    created_at: string;
    user_id: string;
};

export function EditPassDialog({
                                   open,
                                   onOpenChange,
                                   passData,
                                   onSave,
                               }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    passData: Pass | null;
    onSave: (updated: Partial<Pass> & { id: number }) => void;
}) {
    const [name, setName] = useState("");
    const [destination, setDestination] = useState("");
    const [timeOut, setTimeOut] = useState("");
    const [timeIn, setTimeIn] = useState("");

    useEffect(() => {
        if (!passData) return;
        setName(passData.name ?? "");
        setDestination(passData.destination ?? "");
        setTimeOut(passData.time_out ? new Date(passData.time_out).toISOString().slice(0, 16) : "");
        setTimeIn(passData.time_in ? new Date(passData.time_in).toISOString().slice(0, 16) : "");
    }, [passData]);

    function handleSave() {
        if (!passData) return;
        onSave({
            id: passData.id,
            name: name.trim(),
            destination: destination.trim() || null,
            time_out: timeOut ? new Date(timeOut).toISOString() : passData.time_out,
            time_in: timeIn ? new Date(timeIn).toISOString() : null,
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit pass</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Destination</Label>
                        <Input value={destination} onChange={(e) => setDestination(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Time out</Label>
                        <Input
                            type="datetime-local"
                            value={timeOut}
                            onChange={(e) => setTimeOut(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Time in</Label>
                        <Input
                            type="datetime-local"
                            value={timeIn}
                            onChange={(e) => setTimeIn(e.target.value)}
                            placeholder="Leave empty if not returned"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
