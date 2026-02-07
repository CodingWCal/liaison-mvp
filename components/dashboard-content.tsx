"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Users,
  CheckSquare,
  MessageSquare,
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

const stats = [
  { label: "Total Contacts", value: "128", icon: Users, change: "+4 this week", accentClass: "bg-[hsl(173,58%,36%)]/10 text-[hsl(173,58%,36%)]" },
  { label: "Open Tasks", value: "12", icon: CheckSquare, change: "3 due today", accentClass: "bg-[hsl(215,25%,50%)]/10 text-[hsl(215,25%,50%)]" },
  { label: "Touchpoints (30d)", value: "47", icon: MessageSquare, change: "+8 this week", accentClass: "bg-[hsl(38,80%,55%)]/10 text-[hsl(38,80%,55%)]" },
  { label: "Overdue", value: "3", icon: AlertCircle, change: "Needs attention", accentClass: "bg-destructive/10 text-destructive" },
]

type DashTask = {
  id: number
  title: string
  contact: string
  type: string
  dueTime: string
  done: boolean
}

const initialTasks: DashTask[] = [
  { id: 1, title: "Follow up with Sarah Chen", contact: "Sarah Chen", type: "follow-up", dueTime: "10:00 AM", done: false },
  { id: 2, title: "Send proposal to Marcus Rivera", contact: "Marcus Rivera", type: "send-message", dueTime: "12:00 PM", done: false },
  { id: 3, title: "Prep for coffee chat with Lisa Wong", contact: "Lisa Wong", type: "prep", dueTime: "2:00 PM", done: true },
  { id: 4, title: "Check in with Dev Team Lead", contact: "Alex Johnson", type: "check-in", dueTime: "4:00 PM", done: false },
]

const overdueTasks = [
  { id: 5, title: "Send intro email to James Park", contact: "James Park", dueDate: "Feb 3" },
  { id: 6, title: "Follow up on partnership proposal", contact: "Priya Sharma", dueDate: "Feb 1" },
  { id: 7, title: "Share event recap with Taylor Lee", contact: "Taylor Lee", dueDate: "Jan 30" },
]

const upcomingEvents = [
  { title: "Coffee chat with Lisa Wong", date: "Today, 2:00 PM", type: "coffee-chat" },
  { title: "Networking lunch", date: "Tomorrow, 12:30 PM", type: "event" },
  { title: "Partner review call", date: "Feb 10, 3:00 PM", type: "call" },
]

const taskTypeColors: Record<string, string> = {
  "follow-up": "bg-primary/10 text-primary border-primary/20",
  "send-message": "bg-[hsl(215,25%,50%)]/10 text-[hsl(215,25%,50%)] border-[hsl(215,25%,50%)]/20",
  prep: "bg-[hsl(38,80%,55%)]/10 text-[hsl(38,80%,55%)] border-[hsl(38,80%,55%)]/20",
  "check-in": "bg-muted text-muted-foreground border-border",
}

const eventDotColors: Record<string, string> = {
  "coffee-chat": "bg-primary",
  call: "bg-[hsl(215,25%,50%)]",
  meeting: "bg-[hsl(38,80%,55%)]",
  event: "bg-[hsl(16,80%,58%)]",
}

export function DashboardContent() {
  const [tasks, setTasks] = useState(initialTasks)

  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    )
    const task = tasks.find((t) => t.id === id)
    if (task && !task.done) {
      toast.success("Task completed")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-border bg-card transition-shadow duration-200 hover:shadow-md"
          >
            <CardContent className="flex items-start gap-4 p-5">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.accentClass.split(" ")[0]}`}>
                <stat.icon className={`h-5 w-5 ${stat.accentClass.split(" ")[1]}`} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
                  {stat.label}
                </span>
                <span className="text-2xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs text-muted-foreground">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today's Tasks */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">
              {"Today's Tasks"}
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
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-center gap-3 rounded-md px-2 py-2.5 transition-all duration-150 hover:bg-muted/60 ${
                  task.done ? "opacity-55" : ""
                }`}
              >
                <Checkbox
                  checked={task.done}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="h-4 w-4 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <div className="flex flex-1 flex-col gap-0.5">
                  <span
                    className={`text-sm font-medium transition-all duration-150 ${
                      task.done
                        ? "text-muted-foreground line-through decoration-muted-foreground/50"
                        : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{task.contact}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-medium ${taskTypeColors[task.type] || ""}`}
                >
                  {task.type.replace("-", " ")}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {task.dueTime}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sidebar Column */}
        <div className="flex flex-col gap-6">
          {/* Overdue */}
          <Card className="border-destructive/20 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <AlertCircle className="h-4 w-4" />
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
              {overdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between rounded-md border border-destructive/10 bg-destructive/[0.03] px-3 py-2.5 transition-colors duration-150 hover:bg-destructive/[0.06]"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">{task.title}</span>
                    <span className="text-xs text-muted-foreground">{task.contact}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 border-destructive/30 bg-destructive/10 text-[10px] font-medium text-destructive"
                  >
                    {task.dueDate}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Upcoming Events
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
              {upcomingEvents.map((event) => (
                <div
                  key={event.title}
                  className="flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-150 hover:bg-muted/60"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/70">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">{event.title}</span>
                    <span className="text-xs text-muted-foreground">{event.date}</span>
                  </div>
                  <div className={`h-2 w-2 rounded-full ${eventDotColors[event.type] || "bg-muted-foreground"}`} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
