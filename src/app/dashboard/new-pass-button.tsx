"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"

export default function NewPassButton({ userId }: { userId: string }) {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [destination, setDestination] = useState("");

    async function createPass() {
        if (!name.trim()) {
            toast.error("Name required");
            return;
        }
        const { error } = await supabase.from("passes").insert({
            name: name.trim(),
            destination: destination.trim() || null,
            user_id: userId,
        });

        if (error) {
            toast.error("Failed to create pass", { description: error.message });
        } else {
            toast.success("Pass created");
            setOpen(false);
            setName("");
            setDestination("");
            router.refresh();
        }
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>New Pass</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New pass</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Student name" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Destination</Label>
                        <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g., Restroom" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={createPass}>Create</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
