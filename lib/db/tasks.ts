"use server"

import { getSupabaseServer } from "@/lib/supabase/server"

export type DerivedTask = {
  id: string
  contactId: string
  contactName: string
  sequenceId: string
  sequenceName: string
  stepOrder: number
  channel: string
  label: string
  suggestedTiming: string | null
  dueDate: string
  assignedAt: string
  completed: boolean
}

function parseDaysOffset(suggestedTiming: string | null, stepOrder: number): number {
  if (suggestedTiming != null && suggestedTiming !== "") {
    const n = parseInt(suggestedTiming.replace(/\D/g, ""), 10)
    if (!Number.isNaN(n)) return n
  }
  return stepOrder
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export async function getDerivedTasks(
  clerkUserId: string
): Promise<DerivedTask[]> {
  const supabase = getSupabaseServer()
  if (!supabase) return []

  const [contactsRes, sequencesRes] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, name")
      .eq("clerk_user_id", clerkUserId),
    supabase
      .from("sequences")
      .select("id, name")
      .eq("clerk_user_id", clerkUserId),
  ])

  const sequenceIds = (sequencesRes.data ?? []).map((s) => s.id)
  if (sequenceIds.length === 0) return []

  const [assignmentsRes, stepsRes, completedRes] = await Promise.all([
    supabase
      .from("contact_sequence_assignments")
      .select("contact_id, sequence_id, assigned_at")
      .in("sequence_id", sequenceIds),
    supabase
      .from("sequence_steps")
      .select("id, sequence_id, step_order, channel, label, suggested_timing")
      .in("sequence_id", sequenceIds)
      .order("step_order", { ascending: true }),
    supabase
      .from("completed_tasks")
      .select("contact_id, sequence_id, step_order")
      .eq("clerk_user_id", clerkUserId),
  ])

  const contacts = (contactsRes.data ?? []).reduce(
    (acc, c) => {
      acc[c.id] = c.name
      return acc
    },
    {} as Record<string, string>
  )

  const sequences = (sequencesRes.data ?? []).reduce(
    (acc, s) => {
      acc[s.id] = s.name
      return acc
    },
    {} as Record<string, string>
  )

  const assignments = assignmentsRes.data ?? []

  const completedSet = new Set(
    (completedRes.data ?? []).map(
      (c) => `${c.contact_id}-${c.sequence_id}-${c.step_order}`
    )
  )

  const stepsBySequence = (stepsRes.data ?? []).reduce(
    (acc, step) => {
      if (!acc[step.sequence_id]) acc[step.sequence_id] = []
      acc[step.sequence_id].push(step)
      return acc
    },
    {} as Record<string, { id: string; step_order: number; channel: string; label: string; suggested_timing: string | null }[]>
  )

  const tasks: DerivedTask[] = []

  for (const a of assignments) {
    const contactName = contacts[a.contact_id] ?? "Unknown"
    const sequenceName = sequences[a.sequence_id] ?? "Unknown"
    const steps = stepsBySequence[a.sequence_id] ?? []
    const assignedAt = a.assigned_at.slice(0, 10)

    for (const step of steps) {
      const daysOffset = parseDaysOffset(step.suggested_timing, step.step_order)
      const dueDate = addDays(assignedAt, daysOffset)

      const completed = completedSet.has(
        `${a.contact_id}-${a.sequence_id}-${step.step_order}`
      )

      tasks.push({
        id: `${a.contact_id}-${a.sequence_id}-${step.id}`,
        contactId: a.contact_id,
        contactName,
        sequenceId: a.sequence_id,
        sequenceName,
        stepOrder: step.step_order,
        channel: step.channel,
        label: step.label,
        suggestedTiming: step.suggested_timing,
        dueDate,
        assignedAt,
        completed,
      })
    }
  }

  tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  return tasks
}
