"use client"

import { useState, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

type CalendarEvent = {
  id: number
  title: string
  contact: string
  date: string
  time: string
  type: "coffee-chat" | "call" | "meeting" | "event"
}

const events: CalendarEvent[] = [
  { id: 1, title: "Coffee chat with Lisa Wong", contact: "Lisa Wong", date: "2026-02-06", time: "2:00 PM", type: "coffee-chat" },
  { id: 2, title: "Networking lunch", contact: "Multiple", date: "2026-02-07", time: "12:30 PM", type: "event" },
  { id: 3, title: "Partner review call", contact: "Priya Sharma", date: "2026-02-10", time: "3:00 PM", type: "call" },
  { id: 4, title: "Demo with Solara team", contact: "James Park", date: "2026-02-12", time: "10:00 AM", type: "meeting" },
  { id: 5, title: "Follow-up call with Sarah", contact: "Sarah Chen", date: "2026-02-14", time: "11:00 AM", type: "call" },
  { id: 6, title: "Coffee with Alex", contact: "Alex Johnson", date: "2026-02-06", time: "4:30 PM", type: "coffee-chat" },
  { id: 7, title: "Community event prep", contact: "Taylor Lee", date: "2026-02-09", time: "9:00 AM", type: "event" },
  { id: 8, title: "Sales strategy sync", contact: "Marcus Rivera", date: "2026-02-11", time: "2:00 PM", type: "meeting" },
  { id: 9, title: "Quarterly check-in", contact: "Sarah Chen", date: "2026-02-20", time: "10:00 AM", type: "call" },
  { id: 10, title: "Team offsite planning", contact: "Alex Johnson", date: "2026-02-25", time: "1:00 PM", type: "meeting" },
]

const typeColors: Record<string, string> = {
  "coffee-chat": "bg-primary/10 text-primary border-primary/20",
  call: "bg-[hsl(215,25%,50%)]/10 text-[hsl(215,25%,50%)] border-[hsl(215,25%,50%)]/20",
  meeting: "bg-[hsl(38,80%,55%)]/10 text-[hsl(38,80%,55%)] border-[hsl(38,80%,55%)]/20",
  event: "bg-[hsl(16,80%,58%)]/10 text-[hsl(16,80%,58%)] border-[hsl(16,80%,58%)]/20",
}

const typeDotColors: Record<string, string> = {
  "coffee-chat": "bg-primary",
  call: "bg-[hsl(215,25%,50%)]",
  meeting: "bg-[hsl(38,80%,55%)]",
  event: "bg-[hsl(16,80%,58%)]",
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const STATIC_TODAY = new Date(2026, 1, 6)

function getWeekDates(date: Date): Date[] {
  const day = date.getDay()
  const start = new Date(date)
  start.setDate(start.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weeks: (Date | null)[][] = []
  let week: (Date | null)[] = Array(firstDay).fill(null)

  for (let d = 1; d <= daysInMonth; d++) {
    week.push(new Date(year, month, d))
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function isToday(date: Date): boolean {
  return (
    date.getFullYear() === STATIC_TODAY.getFullYear() &&
    date.getMonth() === STATIC_TODAY.getMonth() &&
    date.getDate() === STATIC_TODAY.getDate()
  )
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// Week view
function WeekView({
  currentDate,
  eventMap,
}: {
  currentDate: Date
  eventMap: Record<string, CalendarEvent[]>
}) {
  const weekDates = getWeekDates(currentDate)

  return (
    <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
      {weekDates.map((date) => {
        const key = formatDateKey(date)
        const dayEvents = eventMap[key] || []
        const today = isToday(date)

        return (
          <div
            key={key}
            className={`flex min-h-[280px] flex-col bg-card p-2 transition-colors duration-100 ${
              today ? "bg-primary/[0.04]" : "hover:bg-muted/30"
            }`}
          >
            <div className="mb-2 flex flex-col items-center">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {daysOfWeek[date.getDay()]}
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                  today
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                }`}
              >
                {date.getDate()}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              {dayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`rounded-md border px-2 py-1.5 transition-shadow duration-100 hover:shadow-sm ${
                    typeColors[ev.type] || "bg-muted"
                  }`}
                >
                  <p className="truncate text-[11px] font-medium">{ev.title}</p>
                  <p className="text-[10px] opacity-70">{ev.time}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Month view
function MonthView({
  currentDate,
  eventMap,
  onDayClick,
  selectedDay,
}: {
  currentDate: Date
  eventMap: Record<string, CalendarEvent[]>
  onDayClick: (date: Date) => void
  selectedDay: Date | null
}) {
  const weeks = getMonthGrid(currentDate.getFullYear(), currentDate.getMonth())

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border border-border bg-border">
        {/* Header */}
        <div className="grid grid-cols-7 gap-px">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="bg-muted/60 px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-px">
            {week.map((date, di) => {
              if (!date) {
                return <div key={`empty-${di}`} className="min-h-[80px] bg-card/60" />
              }

              const key = formatDateKey(date)
              const dayEvents = eventMap[key] || []
              const today = isToday(date)
              const selected = selectedDay && isSameDay(date, selectedDay)

              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => onDayClick(date)}
                  className={`flex min-h-[80px] flex-col items-start p-2 text-left transition-colors duration-100 ${
                    today
                      ? "bg-primary/[0.04]"
                      : selected
                        ? "bg-muted/60"
                        : "bg-card hover:bg-muted/30"
                  }`}
                >
                  <span
                    className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      today
                        ? "bg-primary text-primary-foreground"
                        : selected
                          ? "bg-foreground text-card"
                          : "text-foreground"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  <div className="flex flex-wrap gap-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className={`h-1.5 w-1.5 rounded-full ${typeDotColors[ev.type] || "bg-muted-foreground"}`}
                        title={ev.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-muted-foreground">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <SelectedDayDetail date={selectedDay} events={eventMap[formatDateKey(selectedDay)] || []} />
      )}
    </div>
  )
}

function SelectedDayDetail({ date, events: dayEvents }: { date: Date; events: CalendarEvent[] }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {monthNames[date.getMonth()]} {date.getDate()}, {date.getFullYear()}
          {isToday(date) && (
            <Badge
              variant="outline"
              className="text-[10px] bg-primary/10 text-primary border-primary/20"
            >
              Today
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        {dayEvents.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No events on this day
          </p>
        ) : (
          dayEvents.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5 transition-colors duration-100 hover:bg-muted/30"
            >
              <div
                className={`h-2 w-2 shrink-0 rounded-full ${typeDotColors[ev.type] || "bg-muted-foreground"}`}
              />
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{ev.title}</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {ev.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {ev.contact}
                  </span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] font-medium ${typeColors[ev.type] || ""}`}
              >
                {ev.type.replace("-", " ")}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

// Day view
function DayView({
  currentDate,
  eventMap,
}: {
  currentDate: Date
  eventMap: Record<string, CalendarEvent[]>
}) {
  const key = formatDateKey(currentDate)
  const dayEvents = eventMap[key] || []

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground">
          {monthNames[currentDate.getMonth()]} {currentDate.getDate()},{" "}
          {currentDate.getFullYear()}
          {isToday(currentDate) && (
            <Badge
              variant="outline"
              className="ml-2 text-[10px] bg-primary/10 text-primary border-primary/20"
            >
              Today
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        {dayEvents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No events scheduled
          </p>
        ) : (
          dayEvents.map((ev) => (
            <div
              key={ev.id}
              className="flex items-start gap-3 rounded-lg border border-border p-3 transition-all duration-150 hover:bg-muted/30 hover:shadow-sm"
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  typeColors[ev.type] || "bg-muted"
                }`}
              >
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {ev.title}
                </span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {ev.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {ev.contact}
                  </span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] ${typeColors[ev.type] || ""}`}
              >
                {ev.type.replace("-", " ")}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 6))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMonthDay, setSelectedMonthDay] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState("week")

  const eventMap = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    }
    return map
  }, [])

  function navigateDay(offset: number) {
    setCurrentDate((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() + offset)
      return next
    })
  }

  function navigateWeek(offset: number) {
    setCurrentDate((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() + offset * 7)
      return next
    })
  }

  function navigateMonth(offset: number) {
    setCurrentDate((d) => {
      const next = new Date(d)
      next.setMonth(next.getMonth() + offset)
      return next
    })
  }

  function handleMonthDayClick(date: Date) {
    setSelectedMonthDay(date)
  }

  function goToToday() {
    setCurrentDate(new Date(2026, 1, 6))
    setSelectedMonthDay(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <TabsList className="w-fit">
              <TabsTrigger value="day" className="text-xs">Day</TabsTrigger>
              <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-transparent"
              onClick={goToToday}
            >
              Today
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 text-xs">
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Calendar Event</DialogTitle>
                </DialogHeader>
                <form
                  className="flex flex-col gap-4 pt-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setDialogOpen(false)
                    toast.success("Event created")
                  }}
                >
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Title</Label>
                    <Input placeholder="Event name" className="h-8 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Date</Label>
                      <Input type="date" className="h-8 text-xs" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Time</Label>
                      <Input type="time" className="h-8 text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Type</Label>
                      <Select>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coffee-chat">Coffee Chat</SelectItem>
                          <SelectItem value="call">Call</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Contact</Label>
                      <Select>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sarah">Sarah Chen</SelectItem>
                          <SelectItem value="marcus">Marcus Rivera</SelectItem>
                          <SelectItem value="lisa">Lisa Wong</SelectItem>
                          <SelectItem value="alex">Alex Johnson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Notes</Label>
                    <Textarea
                      placeholder="Optional notes..."
                      className="min-h-[50px] text-xs"
                    />
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
        </div>

        {/* Week Tab */}
        <TabsContent value="week" className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigateWeek(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-sm font-semibold text-foreground">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigateWeek(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <WeekView currentDate={currentDate} eventMap={eventMap} />
          {/* Type legend */}
          <div className="flex items-center gap-4 px-1">
            {Object.entries(typeDotColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-[10px] capitalize text-muted-foreground">
                  {type.replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Day Tab */}
        <TabsContent value="day" className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigateDay(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-sm font-semibold text-foreground">
              {daysOfWeek[currentDate.getDay()]},{" "}
              {monthNames[currentDate.getMonth()]} {currentDate.getDate()},{" "}
              {currentDate.getFullYear()}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigateDay(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <DayView currentDate={currentDate} eventMap={eventMap} />
        </TabsContent>

        {/* Month Tab */}
        <TabsContent value="month" className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-sm font-semibold text-foreground">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigateMonth(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <MonthView
            currentDate={currentDate}
            eventMap={eventMap}
            onDayClick={handleMonthDayClick}
            selectedDay={selectedMonthDay}
          />
          {/* Type legend */}
          <div className="flex items-center gap-4 px-1">
            {Object.entries(typeDotColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-[10px] capitalize text-muted-foreground">
                  {type.replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
