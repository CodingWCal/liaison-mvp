"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Users,
  Workflow,
  UserCheck,
  AlertCircle,
  ArrowRight,
  Clock,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { DashboardStats } from "@/lib/db/dashboard"
import type { DerivedTask } from "@/lib/db/tasks"
import {
  markTaskComplete,
  unmarkTaskComplete,
} from "@/lib/db/completed-tasks"

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + "Z")
  const now = new Date()
  const today = formatDateKey(now)
  if (iso === today) return "Today"
  const tomorrow = formatDateKey(new Date(now.getTime() + 86400000))
  if (iso === tomorrow) return "Tomorrow"
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function DashboardContent({
  stats,
  derivedTasks: initialTasks,
  clerkUserId,
}: {
  stats: DashboardStats
  derivedTasks: DerivedTask[]
  clerkUserId: string
}) {
  const [tasks, setTasks] = useState<DerivedTask[]>(initialTasks)
  const todayKey = formatDateKey(new Date())

  const overdueTasks = tasks.filter(
    (t) => !t.completed && t.dueDate < todayKey
  )
  const todayTasks = tasks.filter(
    (t) => !t.completed && t.dueDate === todayKey
  )
  const upcomingTasks = tasks.filter(
    (t) => !t.completed && t.dueDate > todayKey
  )

  async function toggleComplete(task: DerivedTask, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const nextCompleted = !task.completed
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: nextCompleted } : t
      )
    )
    try {
      if (nextCompleted) {
        await markTaskComplete(
          clerkUserId,
          task.contactId,
          task.sequenceId,
          task.stepOrder
        )
        toast.success("Task completed")
      } else {
        await unmarkTaskComplete(
          clerkUserId,
          task.contactId,
          task.sequenceId,
          task.stepOrder
        )
        toast.success("Task reopened")
      }
    } catch {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: !nextCompleted } : t
        )
      )
      toast.error("Something went wrong")
    }
  }

  const statCards = [
    {
      label: "Total Contacts",
      value: String(stats.totalContacts),
      icon: Users,
      change: "Your contacts",
      accentClass: "bg-[hsl(173,58%,36%)]/10 text-[hsl(173,58%,36%)]",
    },
    {
      label: "Active Sequences",
      value: String(stats.activeSequences),
      icon: Workflow,
      change: "Created by you",
      accentClass: "bg-[hsl(215,25%,50%)]/10 text-[hsl(215,25%,50%)]",
    },
    {
      label: "Assigned Contacts",
      value: String(stats.assignedContacts),
      icon: UserCheck,
      change: "In sequences",
      accentClass: "bg-[hsl(38,80%,55%)]/10 text-[hsl(38,80%,55%)]",
    },
    {
      label: "Derived Tasks",
      value: String(tasks.length),
      icon: Clock,
      change: "From sequence steps",
      accentClass: "bg-primary/10 text-primary",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="border-border bg-card transition-shadow duration-200 hover:shadow-md"
          >
            <CardContent className="flex items-start gap-4 p-5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.accentClass.split(" ")[0]}`}
              >
                <stat.icon
                  className={`h-5 w-5 ${stat.accentClass.split(" ")[1]}`}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  {stat.label}
                </span>
                <span className="text-2xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">
              Today&apos;s Tasks
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <Link href="/tasks">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-0.5 pt-0">
            {todayTasks.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No tasks due today. Assign contacts to sequences to see derived
                tasks here.
              </p>
            ) : (
              todayTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-3 rounded-md px-2 py-2.5 transition-all duration-150 hover:bg-muted/60"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => {}}
                    onClick={(e) => toggleComplete(task, e)}
                    className="h-4 w-4 shrink-0 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Link
                    href={`/contacts/${task.contactId}`}
                    className="flex flex-1 flex-col gap-0.5 min-w-0"
                  >
                    <span
                      className={`text-sm font-medium transition-all duration-150 ${
                        task.completed
                          ? "text-muted-foreground line-through decoration-muted-foreground/50"
                          : "text-foreground group-hover:text-primary"
                      }`}
                    >
                      {task.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {task.contactName} · {task.sequenceName}
                    </span>
                  </Link>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium shrink-0 bg-primary/10 text-primary border-primary/20"
                  >
                    {task.channel}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-destructive/20 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <AlertCircle className="h-4 w-4" />
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
              {overdueTasks.length === 0 ? (
                <p className="py-2 text-center text-xs text-muted-foreground">
                  None
                </p>
              ) : (
                overdueTasks.slice(0, 5).map((task) => (
                  <Link
                    key={task.id}
                    href={`/contacts/${task.contactId}`}
                    className="flex items-start justify-between rounded-md border border-destructive/10 bg-destructive/[0.03] px-3 py-2.5 transition-colors duration-150 hover:bg-destructive/[0.06]"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {task.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {task.contactName}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-destructive/30 bg-destructive/10 text-[10px] font-medium text-destructive"
                    >
                      {formatDisplayDate(task.dueDate)}
                    </Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Upcoming
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                <Link href="/calendar">
                  Calendar <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 pt-0">
              {upcomingTasks.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No upcoming tasks
                </p>
              ) : (
                upcomingTasks.slice(0, 3).map((task) => (
                  <Link
                    key={task.id}
                    href={`/contacts/${task.contactId}`}
                    className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-150 hover:bg-muted/60"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/70">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {task.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDisplayDate(task.dueDate)} · {task.contactName}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
