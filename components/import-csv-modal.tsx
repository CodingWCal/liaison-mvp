"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { bulkInsertContacts } from "@/lib/db/contacts"
import type { BulkContactInput } from "@/lib/db/contacts"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/** Accepted CSV column headers (case-insensitive): Name → name, Company → company, Title → role, Email → email; also first_name, last_name, notes. */
const ALLOWED_HEADERS = [
  "first_name",
  "last_name",
  "name",
  "email",
  "company",
  "title",
  "notes",
] as const

type ParsedRow = Record<string, string>

/** Parse a single CSV line, handling quoted fields (with optional commas and escaped quotes). */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      i++
      let field = ""
      while (i < line.length) {
        if (line[i] === '"') {
          i++
          if (line[i] === '"') {
            field += '"'
            i++
          } else break
        } else {
          field += line[i]
          i++
        }
      }
      result.push(field)
      if (line[i] === ",") i++
    } else {
      let field = ""
      while (i < line.length && line[i] !== ",") {
        field += line[i]
        i++
      }
      result.push(field.trim())
      if (line[i] === ",") i++
    }
  }
  return result
}

/** Parse CSV text: first row = headers, rest = rows. Comma-separated. */
function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = parseCSVLine(lines[0])
  const rows = lines.slice(1).map((line) => parseCSVLine(line))
  return { headers, rows }
}

const ALLOWED_SET = new Set<string>(ALLOWED_HEADERS)

/** Normalize CSV header for mapping: trim, lowercase, spaces to underscores (e.g. "First Name" -> "first_name"). */
function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, "_")
}

/** Map raw CSV rows to objects with only allowed headers. Header matching is case-insensitive; keys normalized before mapping. */
function toParsedRows(headers: string[], rows: string[][]): ParsedRow[] {
  const normalizedToOriginal = new Map<string, number>()
  headers.forEach((h, i) => {
    const n = normalizeHeader(h)
    if (ALLOWED_SET.has(n)) {
      normalizedToOriginal.set(n, i)
    }
  })

  return rows.map((row) => {
    const obj: ParsedRow = {}
    ALLOWED_HEADERS.forEach((key) => {
      const idx = normalizedToOriginal.get(key)
      if (idx !== undefined && row[idx] !== undefined) {
        obj[key] = row[idx].trim()
      }
    })
    return obj
  })
}

export function ImportCsvModal({ clerkUserId }: { clerkUserId: string }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      setParseError(null)
      setParsedRows([])
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const text = String(reader.result ?? "")
          const { headers, rows } = parseCSV(text)
          if (headers.length === 0) {
            setParseError("No headers found")
            return
          }
          const parsed = toParsedRows(headers, rows)
          setParsedRows(parsed)
        } catch {
          setParseError("Failed to parse CSV")
        }
      }
      reader.readAsText(file)
    },
    []
  )

  const previewRows = parsedRows.slice(0, 5)
  const previewColumns = ALLOWED_HEADERS.filter(
    (col) => previewRows.some((row) => row[col] !== undefined && row[col] !== "")
  )
  if (previewColumns.length === 0 && previewRows.length > 0) {
    previewColumns.push(...ALLOWED_HEADERS)
  }

  async function handleImport() {
    if (parsedRows.length === 0) return
    setIsImporting(true)
    try {
      // Map: Name → contacts.name, Company → contacts.company, Title → contacts.role, Email → contacts.email. Skip rows with missing Name.
      const rows: BulkContactInput[] = parsedRows
        .filter((row) => (row.name ?? "").trim() !== "")
        .map((row) => ({
          first_name: (row.name ?? "").trim(),
          last_name: "",
          company: (row.company ?? "").trim() || undefined,
          title: (row.title ?? "").trim() || undefined,
          email: (row.email ?? "").trim() || undefined,
          notes: (row.notes ?? "").trim() || undefined,
        }))
      const count = await bulkInsertContacts(clerkUserId, rows)
      setOpen(false)
      setParsedRows([])
      setParseError(null)
      router.refresh()
      toast.success(`${count} contact${count === 1 ? "" : "s"} imported`)
    } catch {
      toast.error("Failed to import contacts")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={() => setOpen(true)}
      >
        <Upload className="h-3.5 w-3.5" />
        Import CSV
      </Button>
      {mounted && (
        <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import contacts from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="csv-file" className="text-sm font-medium">
              Choose file
            </Label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={handleFileChange}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview</Label>
            {parseError && (
              <p className="text-sm text-destructive">{parseError}</p>
            )}
            {previewRows.length === 0 && !parseError && (
              <div className="min-h-[120px] rounded-md border border-dashed border-border bg-muted/30 flex items-center justify-center p-4">
                <span className="text-sm text-muted-foreground">
                  Preview will appear here (first 5 rows). Supported: Name (required), Company, Title, Email. Rows without Name are skipped.
                </span>
              </div>
            )}
            {previewRows.length > 0 && (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {previewColumns.map((col) => (
                        <TableHead key={col} className="capitalize">
                          {col.replace(/_/g, " ")}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, i) => (
                      <TableRow key={i}>
                        {previewColumns.map((col) => (
                          <TableCell key={col} className="max-w-[160px] truncate">
                            {row[col] ?? ""}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {parsedRows.length > 5 && (
                  <p className="text-xs text-muted-foreground px-3 py-2 border-t border-border">
                    Showing 5 of {parsedRows.length} rows
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="gap-1.5"
            disabled={parsedRows.length === 0 || isImporting}
            onClick={handleImport}
          >
            {isImporting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Importing…
              </>
            ) : (
              "Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
      )}
    </Dialog>
  )
}
