"use server"

import { getSupabaseServer } from "@/lib/supabase/server"

export async function ensureUserInSupabase(
  clerkUserId: string,
  email: string | null
) {
  const supabase = getSupabaseServer()
  if (!supabase) return

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle()

  if (existing) return

  await supabase.from("users").insert({
    clerk_user_id: clerkUserId,
    email: email ?? "",
    created_at: new Date().toISOString(),
  })
}
