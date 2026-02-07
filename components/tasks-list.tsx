"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Filter,
  Clock,
  AlertCircle,
  Circle,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type { DerivedTask } from "@/lib/db/tasks"
import {
  markTaskComplete,
  unmarkTaskComplete,
} from "@/lib/db/completed-tasks"

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function formatDisplayDate(iso: string): string {
  const todayKey = formatDateKey(new Date())
  if (iso === todayKey) return "Today"
  const d = new Date(iso + "Z")
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  })
}

const typeColors: Record<string, string> = {
  Email: "bg-[hsl(215,25%,50%)]/10 text-[hsl(215,25%,50%)] border-[hsl(215,25%,50%)]/20",
  LinkedIn: "bg-[hsl(245,58%,58%)]/10 text-[hsl(245,58%,58%)] border-[hsl(245,58%,58%)]/20",
  Phone: "bg-[hsl(16,80%,58%)]/10 text-[hsl(16,80%,58%)] border-[hsl(16,80%,58%)]/20",
  "In Person": "bg-primary/10 text-primary border-primary/20",
}

const sectionConfig = {
  overdue: {
    label: "Overdue",
    icon: AlertCircle,
    color: "text-destructive",
  },
  today: { label: "Due Today", icon: Clock, color: "text-foreground" },
  upcoming: {
    label: "Upcoming",
    icon: Circle,
    color: "text-muted-foreground",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-[hsl(152,60%,38%)]",
  },
} as const

function TaskSection({
  section,
  tasks,
  channelFilter,
  onToggle,
}: {
  section: keyof typeof sectionConfig
  tasks: DerivedTask[]
  channelFilter: string
  onToggle: (task: DerivedTask) => void
}) {
  const config = sectionConfig[section]
  const filtered =
    channelFilter === "all"
      ? tasks
      : tasks.filter((t) => t.channel === channelFilter)
  if (filtered.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <config.icon className={`h-4 w-4 ${config.color}`} />
        <h3 className={`text-sm font-semibold ${config.color}`}>
          {config.label}
        </h3>
        <Badge variant="outline" className="text-[10px]">
          {filtered.length}
        </Badge>
      </div>
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="flex flex-col divide-y divide-border p-0">
          {filtered.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 border-l-2 px-4 py-3 transition-all duration-150 hover:bg-muted/40 ${
                section === "overdue"
                  ? "border-l-destructive"
                  : section === "today"
                    ? "border-l-primary"
                    : section === "completed"
                      ? "border-l-[hsl(152,60%,38%)]"
                      : "border-l-transparent"
              } ${task.completed ? "opacity-70" : ""}`}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggle(task)}
                className="h-4 w-4 shrink-0 rounded border-border data-[state=checked]:bg-[hsl(152,60%,38%)] data-[state=checked]:border-[hsl(152,60%,38%)]"
              />
              <Link
                href={`/contacts/${task.contactId}`}
                className="flex flex-1 flex-col gap-0.5 min-w-0"
              >
                <span
                  className={`text-sm font-medium transition-all duration-150 ${
                    task.completed
                      ? "text-muted-foreground line-through decoration-muted-foreground/50"
                      : section === "overdue"
                        ? "text-foreground"
                        : "text-foreground"
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
                className={`text-[10px] font-medium shrink-0 ${typeColors[task.channel] ?? ""}`}
              >
                {task.channel}
              </Badge>
              <span
                className={`text-xs font-medium shrink-0 ${
                  section === "overdue"
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {formatDisplayDate(task.dueDate)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function TasksList({
  derivedTasks: initialTasks,
  clerkUserId,
}: {
  derivedTasks: DerivedTask[]
  clerkUserId: string
}) {
  const [tasks, setTasks] = useState<DerivedTask[]>(initialTasks)
  const [channelFilter, setChannelFilter] = useState("all")
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
  const completedTasks = tasks.filter((t) => t.completed)

  const channels = Array.from(new Set(tasks.map((t) => t.channel))).sort()

  async function handleToggle(task: DerivedTask) {
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Tasks are derived from sequence steps. Mark complete for live
          updates—no page reload.
        </p>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <Filter className="mr-1 h-3 w-3 text-muted-foreground" />
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            {channels.map((ch) => (
              <SelectItem key={ch} value={ch}>
                {ch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-fit">
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
          <TabsTrigger value="today" className="text-xs">
            Today
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs">
            Overdue
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 flex flex-col gap-6">
          <TaskSection
            section="overdue"
            tasks={overdueTasks}
            channelFilter={channelFilter}
            onToggle={handleToggle}
          />
          <TaskSection
            section="today"
            tasks={todayTasks}
            channelFilter={channelFilter}
            onToggle={handleToggle}
          />
          <TaskSection
            section="upcoming"
            tasks={upcomingTasks}
            channelFilter={channelFilter}
            onToggle={handleToggle}
          />
          <TaskSection
            section="completed"
            tasks={completedTasks}
            channelFilter={channelFilter}
            onToggle={handleToggle}
          />
        </TabsContent>

        <TabsContent value="today" className="mt-4 flex flex-col gap-6">
          {todayTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No tasks due today. Assign contacts to sequences to see derived
              tasks.
            </p>
          ) : (
            <TaskSection
              section="today"
              tasks={todayTasks}
              channelFilter={channelFilter}
              onToggle={handleToggle}
            />
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4 flex flex-col gap-6">
          {upcomingTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No upcoming tasks.
            </p>
          ) : (
            <TaskSection
              section="upcoming"
              tasks={upcomingTasks}
              channelFilter={channelFilter}
              onToggle={handleToggle}
            />
          )}
        </TabsContent>

        <TabsContent value="overdue" className="mt-4 flex flex-col gap-6">
          {overdueTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No overdue tasks.
            </p>
          ) : (
            <TaskSection
              section="overdue"
              tasks={overdueTasks}
              channelFilter={channelFilter}
              onToggle={handleToggle}
            />
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 flex flex-col gap-6">
          {completedTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No completed tasks yet.
            </p>
          ) : (
            <TaskSection
              section="completed"
              tasks={completedTasks}
              channelFilter={channelFilter}
              onToggle={handleToggle}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
