import React from "react"
import { auth, currentUser } from "@clerk/nextjs/server"

export const dynamic = "force-dynamic"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ensureUserInSupabase } from "@/lib/db/users"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (userId) {
    try {
      const user = await currentUser()
      await ensureUserInSupabase(
        userId,
        user?.primaryEmailAddress?.emailAddress ?? null
      )
    } catch {
      // Supabase not configured or insert failed; do not block render
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
