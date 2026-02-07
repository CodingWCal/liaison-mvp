"use server"

import { getSupabaseServer } from "@/lib/supabase/server"

export type SequenceStepRow = {
  id: string
  sequence_id: string
  step_order: number
  channel: string
  label: string
  suggested_timing: string | null
  created_at: string
}

export type SequenceRow = {
  id: string
  clerk_user_id: string
  name: string
  created_at: string
}

export type SequenceWithSteps = SequenceRow & {
  steps: SequenceStepRow[]
}

export type SequenceWithStepsAndAssignment = {
  sequence: SequenceRow
  steps: SequenceStepRow[]
}

export async function getSequences(clerkUserId: string): Promise<SequenceWithSteps[]> {
  const supabase = getSupabaseServer()
  if (!supabase) return []

  const { data: sequences, error: seqError } = await supabase
    .from("sequences")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .order("created_at", { ascending: false })

  if (seqError) throw seqError
  if (!sequences?.length) return []

  const { data: steps, error: stepsError } = await supabase
    .from("sequence_steps")
    .select("*")
    .in(
      "sequence_id",
      sequences.map((s) => s.id)
    )
    .order("step_order", { ascending: true })

  if (stepsError) throw stepsError

  const stepsBySeq = (steps ?? []).reduce(
    (acc, step) => {
      if (!acc[step.sequence_id]) acc[step.sequence_id] = []
      acc[step.sequence_id].push(step as SequenceStepRow)
      return acc
    },
    {} as Record<string, SequenceStepRow[]>
  )

  return sequences.map((s) => ({
    ...s,
    steps: stepsBySeq[s.id] ?? [],
  })) as SequenceWithSteps[]
}

export async function getSequenceById(
  sequenceId: string,
  clerkUserId: string
): Promise<SequenceWithSteps | null> {
  const supabase = getSupabaseServer()
  if (!supabase) return null

  const { data: seq, error: seqError } = await supabase
    .from("sequences")
    .select("*")
    .eq("id", sequenceId)
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle()

  if (seqError || !seq) return null

  const { data: steps, error: stepsError } = await supabase
    .from("sequence_steps")
    .select("*")
    .eq("sequence_id", sequenceId)
    .order("step_order", { ascending: true })

  if (stepsError) return { ...seq, steps: [] } as SequenceWithSteps

  return {
    ...seq,
    steps: (steps ?? []) as SequenceStepRow[],
  } as SequenceWithSteps
}

export type CreateStepInput = {
  step_order: number
  channel: string
  label: string
  suggested_timing?: string
}

export async function createSequence(
  clerkUserId: string,
  name: string,
  steps: CreateStepInput[]
) {
  const supabase = getSupabaseServer()
  if (!supabase) throw new Error("Supabase not configured")

  const { data: seq, error: seqError } = await supabase
    .from("sequences")
    .insert({
      clerk_user_id: clerkUserId,
      name: name.trim() || "Unnamed",
    })
    .select("id")
    .single()

  if (seqError) throw seqError

  if (steps.length > 0) {
    const rows = steps.map((s) => ({
      sequence_id: seq.id,
      step_order: s.step_order,
      channel: s.channel,
      label: s.label,
      suggested_timing: s.suggested_timing ?? null,
    }))
    const { error: stepsInsertError } = await supabase
      .from("sequence_steps")
      .insert(rows)

    if (stepsInsertError) throw stepsInsertError
  }

  return seq.id as string
}

export async function getAssignedSequencesForContact(
  contactId: string,
  clerkUserId: string
): Promise<SequenceWithStepsAndAssignment[]> {
  const supabase = getSupabaseServer()
  if (!supabase) return []

  const { data: assignments, error: assignError } = await supabase
    .from("contact_sequence_assignments")
    .select("sequence_id")
    .eq("contact_id", contactId)

  if (assignError || !assignments?.length) return []

  const sequenceIds = assignments.map((a) => a.sequence_id)

  const { data: sequences, error: seqError } = await supabase
    .from("sequences")
    .select("*")
    .in("id", sequenceIds)
    .eq("clerk_user_id", clerkUserId)

  if (seqError || !sequences?.length) return []

  const { data: steps, error: stepsError } = await supabase
    .from("sequence_steps")
    .select("*")
    .in("sequence_id", sequenceIds)
    .order("step_order", { ascending: true })

  if (stepsError) {
    return sequences.map((s) => ({ sequence: s, steps: [] })) as SequenceWithStepsAndAssignment[]
  }

  const stepsBySeq = (steps ?? []).reduce(
    (acc, step) => {
      if (!acc[step.sequence_id]) acc[step.sequence_id] = []
      acc[step.sequence_id].push(step as SequenceStepRow)
      return acc
    },
    {} as Record<string, SequenceStepRow[]>
  )

  return sequences.map((s) => ({
    sequence: s as SequenceRow,
    steps: stepsBySeq[s.id] ?? [],
  }))
}
