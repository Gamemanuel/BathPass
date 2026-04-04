import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/hcb/sidebar";

export default async function HcbLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isAdmin = false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    // Simple heuristic for demo: mark as admin only when ADMIN_EMAIL env var matches exactly.
    // In production, use a proper role stored in the database (e.g., User.access_level).
    isAdmin = user.email === process.env.ADMIN_EMAIL;
  } catch {
    // Supabase env vars not set — allow demo access
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-0">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
