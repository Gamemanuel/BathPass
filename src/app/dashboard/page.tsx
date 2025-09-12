import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import DashboardTable from "./table";
import NewPassButton from "./new-pass-button";

export default async function DashboardPage() {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Load initial passes for this user
    const { data: passes, error } = await supabase
        .from("passes")
        .select("*")
        .eq("user_id", user.id)
        .order("time_out", { ascending: false })
        .limit(2000); // adjust as needed

    if (error) {
        // You might render a friendly error UI
        throw new Error("Failed to load passes");
    }

    const name =
        (user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "User") as string;
    const avatarUrl = (user.user_metadata?.avatar_url || "") as string;
    const initials = name
        .split(" ")
        .map((s: string) => s[0]?.toUpperCase())
        .slice(0, 2)
        .join("");

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-semibold">Teacher Dashboard</h1>
                        <Separator orientation="vertical" className="h-6" />
                        <span className="text-sm text-muted-foreground">Database</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-sm font-medium">{name}</div>
                            <div className="text-xs text-muted-foreground">
                                {format(new Date(), "MMM d, yyyy")}
                            </div>
                        </div>
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={avatarUrl} alt={name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Manage and export time logs
                    </div>
                    <NewPassButton userId={user.id} />
                </div>

                <DashboardTable initialPasses={passes ?? []} userId={user.id} />
            </main>
        </div>
    );
}
