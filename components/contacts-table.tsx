"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, MoreHorizontal, Mail, Pencil, Trash2, Search, SlidersHorizontal, Workflow } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type { Contact } from "@/lib/db/contacts"
import { createContact, updateContact, deleteContact } from "@/lib/db/contacts"
import type { SequenceWithSteps } from "@/lib/db/sequences"
import { assignContactsToSequence } from "@/lib/db/assignments"

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
  sequences = [],
}: {
  contacts: Contact[]
  clerkUserId: string
  sequences?: SequenceWithSteps[]
}) {
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)
  const [addToSeqOpen, setAddToSeqOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filterQuery, setFilterQuery] = useState("")
  const [companyFilter, setCompanyFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedSeqId, setSelectedSeqId] = useState("")
  const [filterMounted, setFilterMounted] = useState(false)
  useEffect(() => setFilterMounted(true), [])

  const filteredContacts = contacts.filter((c) => {
    if (filterQuery.trim() && ![c.name, c.email, c.company].some((f) => f?.toLowerCase().includes(filterQuery.toLowerCase()))) return false
    if (companyFilter.trim() && !c.company?.toLowerCase().includes(companyFilter.toLowerCase())) return false
    if (roleFilter.trim() && !c.role?.toLowerCase().includes(roleFilter.toLowerCase())) return false
    const d = c.created_at?.slice(0, 10)
    if (dateFrom && d < dateFrom) return false
    return true
  })

  const hasFilters = filterQuery.trim() || companyFilter.trim() || roleFilter.trim() || dateFrom
  const clearFilters = () => {
    setFilterQuery("")
    setCompanyFilter("")
    setRoleFilter("")
    setDateFrom("")
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(filteredContacts.map((c) => c.id)) : new Set())
  }

  const allSelected =
    filteredContacts.length > 0 && filteredContacts.every((c) => selectedIds.has(c.id))
  const someSelected = selectedIds.size > 0

  async function handleDeleteSelected() {
    if (selectedIds.size === 0) return
    try {
      for (const id of selectedIds) {
        await deleteContact(id, clerkUserId)
      }
      toast.success(
        `${selectedIds.size} contact${selectedIds.size === 1 ? "" : "s"} deleted`
      )
      setSelectedIds(new Set())
      router.refresh()
    } catch {
      toast.error("Failed to delete some contacts")
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
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
      await createContact(clerkUserId, { name, role, company, email, notes, linkedin_url: linkedinUrl || undefined, company_website: companyWebsite || undefined })
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

  async function handleAddToSequence(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSeqId || selectedIds.size === 0) return
    try {
      await assignContactsToSequence(selectedSeqId, Array.from(selectedIds), clerkUserId)
      toast.success(`${selectedIds.size} contact(s) added to sequence`)
      setAddToSeqOpen(false)
      setSelectedSeqId("")
      setSelectedIds(new Set())
      router.refresh()
    } catch {
      toast.error("Failed to add to sequence")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, email, company..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="h-8 w-52 pl-7 pr-8 text-xs"
              />
              {filterMounted && (
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 h-8 w-8 text-muted-foreground" aria-label="Filter options">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72">
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-medium text-foreground">Filters</p>
                    <div className="grid gap-2">
                      <Label className="text-xs">Company</Label>
                      <Input placeholder="Company" value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="h-8 text-xs" />
                      <Label className="text-xs">Role / title</Label>
                      <Input placeholder="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-8 text-xs" />
                      <Label className="text-xs">Created from</Label>
                      <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 text-xs" />
                    </div>
                    {hasFilters && (
                      <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => { clearFilters(); setFilterOpen(false) }}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {someSelected ? `${selectedIds.size} selected` : `${filteredContacts.length}${hasFilters ? ` of ${contacts.length}` : ""} contact${filteredContacts.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        <div className="flex items-center gap-2">
          {someSelected && (
            <>
              {sequences.length > 0 && (
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setAddToSeqOpen(true)}>
                  <Workflow className="mr-1 h-3.5 w-3.5" /> Add to sequence
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete selected
              </Button>
            </>
          )}
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
                      onBlur={(e) => {
                        const form = e.currentTarget.form
                        const web = form?.querySelector<HTMLInputElement>("[name=company_website]")
                        if (web && !web.value && e.currentTarget.value) {
                          const m = e.currentTarget.value.match(/@(.+)$/)
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
        <Dialog open={addToSeqOpen} onOpenChange={setAddToSeqOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Add to sequence</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddToSequence} className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Sequence</Label>
                <select
                  value={selectedSeqId}
                  onChange={(e) => setSelectedSeqId(e.target.value)}
                  className="h-8 w-full rounded-md border border-input bg-background px-3 text-xs"
                  required
                >
                  <option value="">Choose sequence...</option>
                  {sequences.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setAddToSeqOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={!selectedSeqId}>Add {selectedIds.size} contact(s)</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => selectAll(checked === true)}
                  aria-label="Select all (filtered)"
                />
              </TableHead>
              <TableHead className="text-xs font-medium">Name</TableHead>
              <TableHead className="text-xs font-medium">Role</TableHead>
              <TableHead className="text-xs font-medium">Company</TableHead>
              <TableHead className="text-xs font-medium">Email</TableHead>
              <TableHead className="text-xs font-medium">Notes</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  {contacts.length === 0
                    ? "No contacts yet. Add your first contact to get started."
                    : "No contacts match the filter."}
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="group transition-colors duration-100 hover:bg-muted/40"
                >
                  <TableCell className="w-10">
                    <Checkbox
                      checked={selectedIds.has(contact.id)}
                      onCheckedChange={() => toggleSelect(contact.id)}
                      aria-label={`Select ${contact.name}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
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
