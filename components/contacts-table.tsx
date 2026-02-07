"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, MoreHorizontal, Mail, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  createContact,
  updateContact,
  deleteContact,
} from "@/lib/db/contacts"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ContactsTable({
  contacts,
  clerkUserId,
}: {
  contacts: Contact[]
  clerkUserId: string
}) {
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.elements.namedItem("name") as HTMLInputElement).value
    const role = (form.elements.namedItem("role") as HTMLInputElement).value
    const company = (form.elements.namedItem("company") as HTMLInputElement).value
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const notes = (form.elements.namedItem("notes") as HTMLTextAreaElement).value
    try {
      await createContact(clerkUserId, { name, role, company, email, notes })
      toast.success("Contact created")
      setAddOpen(false)
      router.refresh()
    } catch (err) {
      toast.error("Failed to create contact")
    }
  }

  async function handleDelete(contactId: string) {
    try {
      await deleteContact(contactId, clerkUserId)
      toast.success("Contact deleted")
      router.refresh()
    } catch {
      toast.error("Failed to delete contact")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
        </span>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs">
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
            </DialogHeader>
            <form className="flex flex-col gap-4 pt-2" onSubmit={handleCreate}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name" className="text-xs">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Jane Smith"
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
                    placeholder="Acme Corp"
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
                    placeholder="VP of Sales"
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
                    placeholder="jane@acme.co"
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
                  placeholder="Any relevant context..."
                  className="min-h-[60px] text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" size="sm">
                  Create Contact
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium">Name</TableHead>
              <TableHead className="text-xs font-medium">Role</TableHead>
              <TableHead className="text-xs font-medium">Company</TableHead>
              <TableHead className="text-xs font-medium">Email</TableHead>
              <TableHead className="text-xs font-medium">Notes</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No contacts yet. Add your first contact to get started.
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="group transition-colors duration-100 hover:bg-muted/40"
                >
                  <TableCell>
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary">
                        {contact.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {contact.role ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {contact.company ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-primary hover:underline"
                      >
                        <Mail className="mr-1 inline h-3.5 w-3.5" />
                        {contact.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                    {contact.notes ?? "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild>
                          <Link href={`/contacts/${contact.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/contacts/${contact.id}`}>
                            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(contact.id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
