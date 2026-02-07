"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import {
  Plus,
  Workflow,
  Users,
  ArrowRight,
  Mail,
  Linkedin,
  Phone,
  MapPin,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { SequenceWithSteps } from "@/lib/db/sequences"
import { createSequence } from "@/lib/db/sequences"
import type { CreateStepInput } from "@/lib/db/sequences"

const CHANNELS = ["Email", "LinkedIn", "Phone", "In Person"] as const

const channelIcons: Record<string, React.ElementType> = {
  Email: Mail,
  LinkedIn: Linkedin,
  Phone: Phone,
  "In Person": MapPin,
}

export function SequencesList({
  sequences,
  clerkUserId,
  assignmentCounts,
}: {
  sequences: SequenceWithSteps[]
  clerkUserId: string
  assignmentCounts: Record<string, number>
}) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [steps, setSteps] = useState<CreateStepInput[]>([
    { step_order: 1, channel: "Email", label: "", suggested_timing: "" },
  ])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.elements.namedItem("name") as HTMLInputElement).value
    const validSteps = steps
      .map((s, i) => ({
        step_order: i + 1,
        channel: s.channel,
        label: s.label.trim() || `Step ${i + 1}`,
        suggested_timing: s.suggested_timing?.trim() || undefined,
      }))
      .filter((s) => s.channel && s.label)
    try {
      const id = await createSequence(clerkUserId, name, validSteps)
      toast.success("Sequence created")
      setDialogOpen(false)
      setSteps([{ step_order: 1, channel: "Email", label: "", suggested_timing: "" }])
      router.refresh()
      router.push(`/sequences/${id}`)
    } catch {
      toast.error("Failed to create sequence")
    }
  }

  function addStep() {
    setSteps((prev) => [
      ...prev,
      {
        step_order: prev.length + 1,
        channel: "Email",
        label: "",
        suggested_timing: "",
      },
    ])
  }

  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateStep(i: number, field: keyof CreateStepInput, value: string | number) {
    setSteps((prev) =>
      prev.map((s, idx) =>
        idx === i ? { ...s, [field]: value } : s
      )
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Reusable outreach cadences made of ordered touchpoints. Read-only after
          creation.
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs">
              <Plus className="mr-1 h-3.5 w-3.5" /> New Sequence
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Sequence</DialogTitle>
            </DialogHeader>
            <form className="flex flex-col gap-4 pt-2" onSubmit={handleCreate}>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Name</Label>
                <Input
                  name="name"
                  placeholder="e.g. New Partner Intro"
                  className="h-8 text-xs"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Steps</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={addStep}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add Step
                  </Button>
                </div>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto rounded-md border border-border p-2">
                  {steps.map((step, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-2 rounded border border-border/60 bg-muted/30 p-2"
                    >
                      <span className="w-6 text-xs font-medium text-muted-foreground">
                        {i + 1}.
                      </span>
                      <Select
                        value={step.channel}
                        onValueChange={(v) => updateStep(i, "channel", v)}
                      >
                        <SelectTrigger className="h-7 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CHANNELS.map((ch) => (
                            <SelectItem key={ch} value={ch}>
                              {ch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Label"
                        className="h-7 flex-1 min-w-0 text-xs"
                        value={step.label}
                        onChange={(e) => updateStep(i, "label", e.target.value)}
                      />
                      <Input
                        placeholder="Timing"
                        className="h-7 w-24 text-xs"
                        value={step.suggested_timing ?? ""}
                        onChange={(e) =>
                          updateStep(i, "suggested_timing", e.target.value)
                        }
                      />
                      {steps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeStep(i)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sequences.length === 0 ? (
          <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">
            No sequences yet. Create one to get started.
          </p>
        ) : (
          sequences.map((seq) => {
            const Icon = channelIcons[seq.steps[0]?.channel] ?? Mail
            const assigned = assignmentCounts[seq.id] ?? 0
            return (
              <Link
                key={seq.id}
                href={`/sequences/${seq.id}`}
                className="group"
              >
                <Card className="border-border bg-card transition-all duration-150 hover:border-primary/30 hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(245,58%,58%)]/10">
                          <Workflow className="h-4.5 w-4.5 text-[hsl(245,58%,58%)]" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <CardTitle className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150">
                            {seq.name}
                          </CardTitle>
                          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                            {seq.steps.length} step{seq.steps.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-1.5 mb-4">
                      {seq.steps.slice(0, 5).map((step, i) => {
                        const StepIcon = channelIcons[step.channel] ?? Mail
                        return (
                          <div
                            key={step.id}
                            className="flex items-center gap-2.5"
                          >
                            <span className="w-10 shrink-0 text-[10px] font-medium text-muted-foreground">
                              {step.step_order}.
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium"
                            >
                              <StepIcon className="mr-1 h-2.5 w-2.5" />
                              {step.channel}
                            </Badge>
                            <span className="truncate text-xs text-muted-foreground">
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                      {seq.steps.length > 5 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{seq.steps.length - 5} more
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 border-t border-border pt-3">
                      <span className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {seq.steps.length}
                        </span>{" "}
                        steps
                      </span>
                      <div className="h-3 w-px bg-border" />
                      <span className="text-xs text-muted-foreground">
                        <Users className="mr-1 inline h-3 w-3" />
                        <span className="font-medium text-foreground">
                          {assigned}
                        </span>{" "}
                        assigned
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
