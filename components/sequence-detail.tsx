"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft,
  Workflow,
  Mail,
  Linkedin,
  Phone,
  MapPin,
  Users,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { SequenceWithSteps, SequenceStepRow } from "@/lib/db/sequences"
import type { Contact } from "@/lib/db/contacts"
import type { AssignedContact } from "@/lib/db/assignments"
import { assignContactsToSequence } from "@/lib/db/assignments"

const channelIcons: Record<string, React.ElementType> = {
  Email: Mail,
  LinkedIn: Linkedin,
  Phone: Phone,
  "In Person": MapPin,
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function SequenceDetail({
  sequence,
  clerkUserId,
  contacts,
  assignmentCount,
  assignedContactIds,
  assignedContacts,
}: {
  sequence: SequenceWithSteps
  clerkUserId: string
  contacts: Contact[]
  assignmentCount: number
  assignedContactIds: string[]
  assignedContacts: AssignedContact[]
}) {
  const router = useRouter()
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])

  const alreadyAssigned = new Set(assignedContactIds)
  const availableContacts = contacts.filter((c) => !alreadyAssigned.has(c.id))

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (selectedContactIds.length === 0) return
    try {
      await assignContactsToSequence(sequence.id, selectedContactIds, clerkUserId)
      toast.success(
        `Assigned ${selectedContactIds.length} contact${selectedContactIds.length > 1 ? "s" : ""} to sequence`
      )
      setAssignDialogOpen(false)
      setSelectedContactIds([])
      router.refresh()
    } catch {
      toast.error("Failed to assign contacts")
    }
  }

  function toggleContact(contactId: string) {
    setSelectedContactIds((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="-ml-2 w-fit text-xs text-muted-foreground"
      >
        <Link href="/sequences">
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Sequences
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(245,58%,58%)]/10">
            <Workflow className="h-6 w-6 text-[hsl(245,58%,58%)]" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-foreground">
              {sequence.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Read-only. {sequence.steps.length} step
              {sequence.steps.length !== 1 ? "s" : ""},{" "}
              {assignmentCount} contact{assignmentCount !== 1 ? "s" : ""}{" "}
              assigned.
            </p>
          </div>
        </div>
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs">
              <UserPlus className="mr-1 h-3.5 w-3.5" /> Assign Contacts
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Contacts to Sequence</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAssign} className="flex flex-col gap-4 pt-2">
              <p className="text-xs text-muted-foreground">
                Select contacts to assign to this sequence.
              </p>
              <div className="flex max-h-60 flex-col gap-1 overflow-y-auto rounded-md border border-border p-2">
                {availableContacts.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    All contacts are already assigned to this sequence.
                  </p>
                ) : (
                  availableContacts.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/60"
                    >
                      <Checkbox
                        checked={selectedContactIds.includes(contact.id)}
                        onCheckedChange={() => toggleContact(contact.id)}
                        className="h-4 w-4"
                      />
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">
                        {contact.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAssignDialogOpen(false)
                    setSelectedContactIds([])
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={selectedContactIds.length === 0}
                >
                  Assign ({selectedContactIds.length})
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="steps" className="w-full">
        <TabsList className="w-fit">
          <TabsTrigger value="steps" className="text-xs">
            <Workflow className="mr-1.5 h-3.5 w-3.5" /> Steps
          </TabsTrigger>
          <TabsTrigger value="assigned" className="text-xs">
            <Users className="mr-1.5 h-3.5 w-3.5" /> Assigned (
            {assignedContacts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="mt-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Sequence Steps (read-only)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col">
                {sequence.steps.map((step: SequenceStepRow, i: number) => {
                  const Icon = channelIcons[step.channel] ?? Mail
                  return (
                    <div
                      key={step.id}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      {i < sequence.steps.length - 1 && (
                        <div className="absolute left-[19px] top-10 h-[calc(100%-28px)] w-px bg-border" />
                      )}
                      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-muted/50">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-1 flex-col gap-1 rounded-lg border border-border bg-card p-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold bg-muted text-muted-foreground"
                          >
                            Step {step.step_order}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium"
                          >
                            {step.channel}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {step.label}
                        </p>
                        {step.suggested_timing && (
                          <p className="text-xs text-muted-foreground">
                            Suggested timing: {step.suggested_timing}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned" className="mt-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Assigned Contacts
              </CardTitle>
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => setAssignDialogOpen(true)}
              >
                <UserPlus className="mr-1 h-3 w-3" /> Assign More
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {assignedContacts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Users className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No contacts assigned yet.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 text-xs bg-transparent"
                    onClick={() => setAssignDialogOpen(true)}
                  >
                    <UserPlus className="mr-1 h-3 w-3" /> Assign First Contact
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {assignedContacts.map(({ contact_id, contact_name }) => (
                    <div
                      key={contact_id}
                      className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                          {getInitials(contact_name)}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/contacts/${contact_id}`}
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {contact_name}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
