"use server"

import { getSupabaseServer } from "@/lib/supabase/server"

export async function markTaskComplete(
  clerkUserId: string,
  contactId: string,
  sequenceId: string,
  stepOrder: number
) {
  const supabase = getSupabaseServer()
  if (!supabase) throw new Error("Supabase not configured")

  const { error } = await supabase.from("completed_tasks").upsert(
    {
      clerk_user_id: clerkUserId,
      contact_id: contactId,
      sequence_id: sequenceId,
      step_order: stepOrder,
    },
    {
      onConflict: "clerk_user_id,contact_id,sequence_id,step_order",
    }
  )

  if (error) throw error
}

export async function unmarkTaskComplete(
  clerkUserId: string,
  contactId: string,
  sequenceId: string,
  stepOrder: number
) {
  const supabase = getSupabaseServer()
  if (!supabase) throw new Error("Supabase not configured")

  const { error } = await supabase
    .from("completed_tasks")
    .delete()
    .eq("clerk_user_id", clerkUserId)
    .eq("contact_id", contactId)
    .eq("sequence_id", sequenceId)
    .eq("step_order", stepOrder)

  if (error) throw error
}
