"use server"

import { getSupabaseServer } from "@/lib/supabase/server"

export async function getAssignmentCountBySequence(
  sequenceId: string
): Promise<number> {
  const supabase = getSupabaseServer()
  if (!supabase) return 0

  const { count, error } = await supabase
    .from("contact_sequence_assignments")
    .select("*", { count: "exact", head: true })
    .eq("sequence_id", sequenceId)

  if (error) return 0
  return count ?? 0
}

export async function getAssignedContactIdsForSequence(
  sequenceId: string
): Promise<string[]> {
  const supabase = getSupabaseServer()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("contact_sequence_assignments")
    .select("contact_id")
    .eq("sequence_id", sequenceId)

  if (error) return []
  return (data ?? []).map((r) => r.contact_id)
}

export type AssignedContact = { contact_id: string; contact_name: string }

export async function getAssignedContactsForSequence(
  sequenceId: string
): Promise<AssignedContact[]> {
  const supabase = getSupabaseServer()
  if (!supabase) return []

  const { data: assignments, error: assignError } = await supabase
    .from("contact_sequence_assignments")
    .select("contact_id")
    .eq("sequence_id", sequenceId)

  if (assignError || !assignments?.length) return []

  const ids = assignments.map((a) => a.contact_id)
  const { data: contacts, error: contactError } = await supabase
    .from("contacts")
    .select("id, name")
    .in("id", ids)

  if (contactError) return []

  const byId = (contacts ?? []).reduce(
    (acc, c) => {
      acc[c.id] = c.name
      return acc
    },
    {} as Record<string, string>
  )

  return ids.map((id) => ({
    contact_id: id,
    contact_name: byId[id] ?? "Unknown",
  }))
}

export async function assignContactsToSequence(
  sequenceId: string,
  contactIds: string[],
  clerkUserId: string
) {
  const supabase = getSupabaseServer()
  if (!supabase) throw new Error("Supabase not configured")

  const { count } = await supabase
    .from("sequences")
    .select("id", { count: "exact", head: true })
    .eq("id", sequenceId)
    .eq("clerk_user_id", clerkUserId)

  if (count === 0) throw new Error("Sequence not found")

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id")
    .in("id", contactIds)
    .eq("clerk_user_id", clerkUserId)

  const validIds = (contacts ?? []).map((c) => c.id)

  const rows = validIds.map((contact_id) => ({
    contact_id,
    sequence_id: sequenceId,
  }))

  if (rows.length === 0) return

  const { error } = await supabase
    .from("contact_sequence_assignments")
    .upsert(rows, { onConflict: "contact_id,sequence_id", ignoreDuplicates: true })

  if (error) throw error
}

export async function unassignContactFromSequence(
  contactId: string,
  sequenceId: string,
  clerkUserId: string
) {
  const supabase = getSupabaseServer()
  if (!supabase) throw new Error("Supabase not configured")

  const { error } = await supabase
    .from("contact_sequence_assignments")
    .delete()
    .eq("contact_id", contactId)
    .eq("sequence_id", sequenceId)

  if (error) throw error
}
