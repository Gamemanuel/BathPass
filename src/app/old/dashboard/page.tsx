import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { DataTable } from './data-table'
import { Pass } from './columns'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { handleSignOut } from './actions'

export default async function DashboardPage() {
    const supabase = await createServerSupabaseClient()

    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
        redirect('/auth/login')
    }

    const { data } = await supabase
        .from('passes')
        .select('*')
        .order('created_at', { ascending: false })

    const passes: Pass[] = data || []

    return (
        <div className="container mx-auto py-10">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold">Bath Pass Dashboard</h1>
                    <p className="text-lg text-gray-300">
                        Manage all student passes from here.
                    </p>
                </div>
                <form action={handleSignOut}>
                    <Button type="submit" variant="destructive">
                        Sign Out
                    </Button>
                </form>
            </header>

            <DataTable data={passes} />

            <div className="mt-8 flex justify-start">
                <Button
                    asChild
                    className="inline-flex items-center gap-2 px-8 py-4 font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition-colors"
                >
                    <Link
                        href="https://example.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Go to Forms Page (opens in a new tab)"
                    >
                        Go to Forms Page
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </Button>
            </div>
        </div>
    )
}