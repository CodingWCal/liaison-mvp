"use server"

import { getSupabaseServer } from "@/lib/supabase/server"

export type Contact = {
  id: string
  clerk_user_id: string
  name: string
  role: string | null
  company: string | null
  email: string | null
  notes: string | null
  created_at: string
}

export async function getContacts(clerkUserId: string): Promise<Contact[]> {
  const supabase = getSupabaseServer()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as Contact[]
}

export async function createContact(
  clerkUserId: string,
  input: { name: string; role?: string; company?: string; email?: string; notes?: string }
) {
  const supabase = getSupabaseServer()
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      clerk_user_id: clerkUserId,
      name: input.name.trim() || "Unnamed",
      role: input.role?.trim() ?? null,
      company: input.company?.trim() ?? null,
      email: input.email?.trim() ?? null,
      notes: input.notes?.trim() ?? null,
    })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function updateContact(
  contactId: string,
  clerkUserId: string,
  input: { name?: string; role?: string; company?: string; email?: string; notes?: string }
) {
  const supabase = getSupabaseServer()
  if (!supabase) throw new Error("Supabase not configured")

  const { error } = await supabase
    .from("contacts")
    .update({
      ...(input.name !== undefined && { name: input.name.trim() || "Unnamed" }),
      ...(input.role !== undefined && { role: input.role?.trim() ?? null }),
      ...(input.company !== undefined && { company: input.company?.trim() ?? null }),
      ...(input.email !== undefined && { email: input.email?.trim() ?? null }),
      ...(input.notes !== undefined && { notes: input.notes?.trim() ?? null }),
    })
    .eq("id", contactId)
    .eq("clerk_user_id", clerkUserId)

  if (error) throw error
}

export async function deleteContact(contactId: string, clerkUserId: string) {
  const supabase = getSupabaseServer()
  if (!supabase) throw new Error("Supabase not configured")

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", contactId)
    .eq("clerk_user_id", clerkUserId)

  if (error) throw error
}

export async function getContactById(
  contactId: string,
  clerkUserId: string
): Promise<Contact | null> {
  const supabase = getSupabaseServer()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle()

  if (error) throw error
  return data as Contact | null
}
