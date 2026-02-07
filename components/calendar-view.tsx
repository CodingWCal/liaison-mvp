"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DerivedTask } from "@/lib/db/tasks"

export type CalendarEvent = {
  id: string
  title: string
  contact: string
  contactId: string
  date: string
  time: string
  channel: string
  sequenceName: string
}

function derivedTasksToEvents(tasks: DerivedTask[]): CalendarEvent[] {
  return tasks.map((t) => ({
    id: t.id,
    title: t.label,
    contact: t.contactName,
    contactId: t.contactId,
    date: t.dueDate,
    time: "9:00 AM",
    channel: t.channel,
    sequenceName: t.sequenceName,
  }))
}

const channelColors: Record<string, string> = {
  Email: "bg-[hsl(215,25%,50%)]/10 text-[hsl(215,25%,50%)] border-[hsl(215,25%,50%)]/20",
  LinkedIn: "bg-[hsl(245,58%,58%)]/10 text-[hsl(245,58%,58%)] border-[hsl(245,58%,58%)]/20",
  Phone: "bg-[hsl(16,80%,58%)]/10 text-[hsl(16,80%,58%)] border-[hsl(16,80%,58%)]/20",
  "In Person": "bg-primary/10 text-primary border-primary/20",
}

const channelDotColors: Record<string, string> = {
  Email: "bg-[hsl(215,25%,50%)]",
  LinkedIn: "bg-[hsl(245,58%,58%)]",
  Phone: "bg-[hsl(16,80%,58%)]",
  "In Person": "bg-primary",
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

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
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

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
                <Link
                  key={ev.id}
                  href={`/contacts/${ev.contactId}`}
                  className={`rounded-md border px-2 py-1.5 transition-shadow duration-100 hover:shadow-sm ${
                    channelColors[ev.channel] || "bg-muted"
                  }`}
                >
                  <p className="truncate text-[11px] font-medium">{ev.title}</p>
                  <p className="text-[10px] opacity-70">{ev.time}</p>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

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
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <div className="grid grid-cols-7 border-b border-border">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="border-r border-border bg-muted/60 px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-border last:border-b-0">
            {week.map((date, di) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${di}`}
                    className="min-h-[80px] border-r border-border bg-card/60 last:border-r-0"
                  />
                )
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
                  className={`flex min-h-[80px] flex-col items-start border-r border-border p-2 text-left transition-colors duration-150 last:border-r-0 ${
                    today
                      ? "bg-primary/[0.04] hover:bg-primary/[0.08]"
                      : selected
                        ? "bg-muted/60 hover:bg-muted/80"
                        : "bg-card hover:bg-muted/60"
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
                        className={`h-1.5 w-1.5 rounded-full ${channelDotColors[ev.channel] ?? "bg-muted-foreground"}`}
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

      {selectedDay && (
        <SelectedDayDetail
          date={selectedDay}
          events={eventMap[formatDateKey(selectedDay)] || []}
        />
      )}
    </div>
  )
}

function SelectedDayDetail({
  date,
  events: dayEvents,
}: {
  date: Date
  events: CalendarEvent[]
}) {
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
            No derived tasks on this day
          </p>
        ) : (
          dayEvents.map((ev) => (
            <Link
              key={ev.id}
              href={`/contacts/${ev.contactId}`}
              className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5 transition-colors duration-100 hover:bg-muted/30"
            >
              <div
                className={`h-2 w-2 shrink-0 rounded-full ${channelDotColors[ev.channel] ?? "bg-muted-foreground"}`}
              />
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
                className={`text-[10px] font-medium ${channelColors[ev.channel] ?? ""}`}
              >
                {ev.channel}
              </Badge>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}

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
            No derived tasks scheduled
          </p>
        ) : (
          dayEvents.map((ev) => (
            <Link
              key={ev.id}
              href={`/contacts/${ev.contactId}`}
              className="flex items-start gap-3 rounded-lg border border-border p-3 transition-all duration-150 hover:bg-muted/30 hover:shadow-sm"
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  channelColors[ev.channel] ?? "bg-muted"
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
                  <span>{ev.sequenceName}</span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] ${channelColors[ev.channel] ?? ""}`}
              >
                {ev.channel}
              </Badge>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function CalendarView({
  derivedTasks,
}: {
  derivedTasks: DerivedTask[]
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedMonthDay, setSelectedMonthDay] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState("week")

  const events = useMemo(
    () =>
      derivedTasksToEvents(
        derivedTasks.filter((t) => !t.completed)
      ),
    [derivedTasks]
  )

  const eventMap = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    }
    return map
  }, [events])

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

  function goToToday() {
    setCurrentDate(new Date())
    setSelectedMonthDay(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-fit">
            <TabsTrigger value="day" className="text-xs">
              Day
            </TabsTrigger>
            <TabsTrigger value="week" className="text-xs">
              Week
            </TabsTrigger>
            <TabsTrigger value="month" className="text-xs">
              Month
            </TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs bg-transparent"
            onClick={goToToday}
          >
            Today
          </Button>
        </div>

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
          <div className="flex items-center gap-4 px-1">
            {Object.entries(channelDotColors).map(([ch, color]) => (
              <div key={ch} className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-[10px] text-muted-foreground">{ch}</span>
              </div>
            ))}
          </div>
        </TabsContent>

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
            onDayClick={setSelectedMonthDay}
            selectedDay={selectedMonthDay}
          />
          <div className="flex items-center gap-4 px-1">
            {Object.entries(channelDotColors).map(([ch, color]) => (
              <div key={ch} className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-[10px] text-muted-foreground">{ch}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
