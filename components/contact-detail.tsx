"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, Building2, Briefcase, Pencil, Trash2, Workflow, Linkedin, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type { Contact } from "@/lib/db/contacts"
import { updateContact, deleteContact } from "@/lib/db/contacts"
import type {
  SequenceWithStepsAndAssignment,
  SequenceStepRow,
} from "@/lib/db/sequences"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ContactDetail({
  contact,
  clerkUserId,
  assignedSequences = [],
}: {
  contact: Contact
  clerkUserId: string
  assignedSequences?: SequenceWithStepsAndAssignment[]
}) {
  const router = useRouter()

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.elements.namedItem("name") as HTMLInputElement).value
    const role = (form.elements.namedItem("role") as HTMLInputElement).value
    const company = (form.elements.namedItem("company") as HTMLInputElement).value
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const notes = (form.elements.namedItem("notes") as HTMLTextAreaElement).value
    const linkedinUrl = (form.elements.namedItem("linkedin_url") as HTMLInputElement).value
    const companyWebsite = (form.elements.namedItem("company_website") as HTMLInputElement).value
    try {
      await updateContact(contact.id, clerkUserId, { name, role, company, email, notes, linkedin_url: linkedinUrl || undefined, company_website: companyWebsite || undefined })
      toast.success("Contact updated")
      router.refresh()
    } catch {
      toast.error("Failed to update contact")
    }
  }

  async function handleDelete() {
    try {
      await deleteContact(contact.id, clerkUserId)
      toast.success("Contact deleted")
      router.push("/contacts")
    } catch {
      toast.error("Failed to delete contact")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="-ml-2 w-fit text-xs text-muted-foreground"
      >
        <Link href="/contacts">
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Contacts
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-foreground">{contact.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              <span>{contact.role ?? "—"}</span>
              <span className="text-border">|</span>
              <Building2 className="h-3.5 w-3.5" />
              <span>{contact.company ?? "—"}</span>
            </div>
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="mt-1 flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Mail className="h-3.5 w-3.5" /> {contact.email}
              </a>
            )}
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              {contact.linkedin_url && (
                <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </a>
              )}
              {contact.company_website && (
                <a href={contact.company_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                  <Globe className="h-3.5 w-3.5" /> Company
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Contact</DialogTitle>
              </DialogHeader>
              <form className="flex flex-col gap-4 pt-2" onSubmit={handleUpdate}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name" className="text-xs">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={contact.name}
                      className="h-8 text-xs"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="company" className="text-xs">
                      Company
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      defaultValue={contact.company ?? ""}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="role" className="text-xs">
                      Role
                    </Label>
                    <Input
                      id="role"
                      name="role"
                      defaultValue={contact.role ?? ""}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email" className="text-xs">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={contact.email ?? ""}
                      className="h-8 text-xs"
                      onBlur={(e) => {
                        const form = e.currentTarget.form
                        const web = form?.querySelector<HTMLInputElement>("[name=company_website]")
                        const email = e.currentTarget.value
                        if (web && !web.value && email) {
                          const m = email.match(/@(.+)$/)
                          if (m) web.value = `https://${m[1]}`
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="linkedin_url" className="text-xs">
                      LinkedIn URL
                    </Label>
                    <Input
                      id="linkedin_url"
                      name="linkedin_url"
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      defaultValue={contact.linkedin_url ?? ""}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="company_website" className="text-xs">
                      Company website
                    </Label>
                    <Input
                      id="company_website"
                      name="company_website"
                      type="url"
                      placeholder="https://..."
                      defaultValue={contact.company_website ?? ""}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="notes" className="text-xs">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    defaultValue={contact.notes ?? ""}
                    className="min-h-[60px] text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="submit" size="sm">
                    Save
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      {contact.notes && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {contact.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Assigned Sequences
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {assignedSequences.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Workflow className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No sequences assigned to this contact.
              </p>
              <Button size="sm" variant="outline" className="mt-2 text-xs" asChild>
                <Link href="/sequences">Browse Sequences</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {assignedSequences.map(({ sequence, steps }) => (
                <div
                  key={sequence.id}
                  className="rounded-lg border border-border p-4"
                >
                  <Link
                    href={`/sequences/${sequence.id}`}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {sequence.name}
                  </Link>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {steps.map((step: SequenceStepRow, i: number) => (
                      <li
                        key={step.id}
                        className="flex items-center gap-2.5 text-xs text-muted-foreground"
                      >
                        <span className="w-8 shrink-0 font-medium">
                          {i + 1}.
                        </span>
                        <span className="font-medium text-foreground">
                          {step.channel}
                        </span>
                        <span>—</span>
                        <span>{step.label}</span>
                        {step.suggested_timing && (
                          <span className="text-muted-foreground/80">
                            ({step.suggested_timing})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
