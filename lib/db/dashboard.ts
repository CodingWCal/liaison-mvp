"use server"

import { getSupabaseServer } from "@/lib/supabase/server"

export type DashboardStats = {
  totalContacts: number
  activeSequences: number
  assignedContacts: number
}

export async function getDashboardStats(
  clerkUserId: string
): Promise<DashboardStats> {
  const supabase = getSupabaseServer()
  if (!supabase) {
    return { totalContacts: 0, activeSequences: 0, assignedContacts: 0 }
  }

  const [contactsRes, sequencesData] = await Promise.all([
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("clerk_user_id", clerkUserId),
    supabase
      .from("sequences")
      .select("id")
      .eq("clerk_user_id", clerkUserId),
  ])

  const totalContacts = contactsRes.count ?? 0
  const sequenceIds = (sequencesData.data ?? []).map((s) => s.id)
  const activeSequences = sequenceIds.length

  let assignedContacts = 0
  if (sequenceIds.length > 0) {
    const { count } = await supabase
      .from("contact_sequence_assignments")
      .select("*", { count: "exact", head: true })
      .in("sequence_id", sequenceIds)
    assignedContacts = count ?? 0
  }

  return {
    totalContacts,
    activeSequences,
    assignedContacts,
  }
}
