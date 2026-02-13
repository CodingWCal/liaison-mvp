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
  linkedin_url: string | null
  company_website: string | null
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

export type BulkContactInput = {
  first_name?: string
  last_name?: string
  email?: string
  company?: string
  title?: string
  notes?: string
  linkedin_url?: string
  company_website?: string
}

export async function bulkInsertContacts(
  clerkUserId: string,
  contactsArray: BulkContactInput[]
): Promise<number> {
  const supabase = getSupabaseServer()
  if (!supabase) throw new Error("Supabase not configured")
  if (contactsArray.length === 0) return 0

  const rows = contactsArray.map((c) => {
    const name = [c.first_name, c.last_name].filter(Boolean).join(" ").trim() || "Unnamed"
    return {
      clerk_user_id: clerkUserId,
      name,
      role: c.title?.trim() ?? null,
      company: c.company?.trim() ?? null,
      email: c.email?.trim() ?? null,
      notes: c.notes?.trim() ?? null,
      linkedin_url: c.linkedin_url?.trim() ?? null,
      company_website: c.company_website?.trim() ?? null,
    }
  })

  const { data, error } = await supabase
    .from("contacts")
    .insert(rows)
    .select("id")

  if (error) throw error
  return data?.length ?? 0
}

export async function createContact(
  clerkUserId: string,
  input: { name: string; role?: string; company?: string; email?: string; notes?: string; linkedin_url?: string; company_website?: string }
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
      linkedin_url: input.linkedin_url?.trim() ?? null,
      company_website: input.company_website?.trim() ?? null,
    })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function updateContact(
  contactId: string,
  clerkUserId: string,
  input: { name?: string; role?: string; company?: string; email?: string; notes?: string; linkedin_url?: string; company_website?: string }
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
      ...(input.linkedin_url !== undefined && { linkedin_url: input.linkedin_url?.trim() ?? null }),
      ...(input.company_website !== undefined && { company_website: input.company_website?.trim() ?? null }),
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
