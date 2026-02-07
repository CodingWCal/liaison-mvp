"use client"

import { useState, useCallback } from "react"
import {
  Plus,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  Workflow,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { sequences } from "@/lib/sequences-data"

type Task = {
  id: number
  title: string
  contact: string
  type: string
  dueDate: string
  status: "pending" | "completed" | "overdue"
  section: "today" | "upcoming" | "overdue" | "completed"
}

const initialTasks: Task[] = [
  { id: 1, title: "Follow up with Sarah Chen", contact: "Sarah Chen", type: "follow-up", dueDate: "Today", status: "pending", section: "today" },
  { id: 2, title: "Send proposal to Marcus Rivera", contact: "Marcus Rivera", type: "send-message", dueDate: "Today", status: "pending", section: "today" },
  { id: 3, title: "Prep for coffee chat with Lisa Wong", contact: "Lisa Wong", type: "prep", dueDate: "Today", status: "completed", section: "today" },
  { id: 4, title: "Check in with Dev Team Lead", contact: "Alex Johnson", type: "check-in", dueDate: "Today", status: "pending", section: "today" },
  { id: 5, title: "Send integration spec document", contact: "Sarah Chen", type: "send-message", dueDate: "Feb 10", status: "pending", section: "upcoming" },
  { id: 6, title: "Prep for board meeting follow-up", contact: "Sarah Chen", type: "prep", dueDate: "Feb 14", status: "pending", section: "upcoming" },
  { id: 7, title: "Schedule demo with Solara team", contact: "James Park", type: "follow-up", dueDate: "Feb 12", status: "pending", section: "upcoming" },
  { id: 8, title: "Send networking event recap", contact: "Taylor Lee", type: "send-message", dueDate: "Jan 30", status: "overdue", section: "overdue" },
  { id: 9, title: "Follow up on partnership proposal", contact: "Priya Sharma", type: "follow-up", dueDate: "Feb 1", status: "overdue", section: "overdue" },
  { id: 10, title: "Send intro email to James Park", contact: "James Park", type: "send-message", dueDate: "Feb 3", status: "overdue", section: "overdue" },
  { id: 11, title: "Sent welcome message to Jordan", contact: "Jordan Williams", type: "send-message", dueDate: "Jan 28", status: "completed", section: "completed" },
  { id: 12, title: "Had intro call with recruiter", contact: "Jordan Williams", type: "check-in", dueDate: "Jan 25", status: "completed", section: "completed" },
  { id: 13, title: "Send relevant case study (New Partner Intro)", contact: "Marcus Rivera", type: "sequence", dueDate: "Feb 7", status: "pending", section: "today" },
  { id: 14, title: "Send intro email with context (New Partner Intro)", contact: "James Park", type: "sequence", dueDate: "Feb 8", status: "pending", section: "upcoming" },
  { id: 15, title: "Share portfolio or recent work (Recruiter Pipeline)", contact: "Jordan Williams", type: "sequence", dueDate: "Feb 6", status: "pending", section: "today" },
]

const typeColors: Record<string, string> = {
  "follow-up": "bg-primary/10 text-primary border-primary/20",
  "send-message": "bg-[hsl(215,25%,50%)]/10 text-[hsl(215,25%,50%)] border-[hsl(215,25%,50%)]/20",
  prep: "bg-[hsl(38,80%,55%)]/10 text-[hsl(38,80%,55%)] border-[hsl(38,80%,55%)]/20",
  "check-in": "bg-muted text-muted-foreground border-border",
  sequence: "bg-[hsl(245,58%,58%)]/10 text-[hsl(245,58%,58%)] border-[hsl(245,58%,58%)]/20",
}

const statusIndicator: Record<string, string> = {
  pending: "border-l-primary",
  overdue: "border-l-destructive",
  completed: "border-l-[hsl(152,60%,38%)]",
}

const sectionConfig = {
  today: { label: "Due Today", icon: Clock, color: "text-foreground" },
  overdue: { label: "Overdue", icon: AlertCircle, color: "text-destructive" },
  upcoming: { label: "Upcoming", icon: Circle, color: "text-muted-foreground" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-[hsl(152,60%,38%)]" },
}

function TaskSection({
  section,
  tasks,
  onToggle,
}: {
  section: keyof typeof sectionConfig
  tasks: Task[]
  onToggle: (id: number) => void
}) {
  const config = sectionConfig[section]
  if (tasks.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <config.icon className={`h-4 w-4 ${config.color}`} />
        <h3 className={`text-sm font-semibold ${config.color}`}>{config.label}</h3>
        <Badge variant="outline" className="text-[10px]">
          {tasks.length}
        </Badge>
      </div>
      <Card className="border-border bg-card overflow-hidden">
        <CardContent className="flex flex-col divide-y divide-border p-0">
          {tasks.map((task) => {
            const isCompleted = task.status === "completed"
            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 border-l-2 px-4 py-3 transition-all duration-150 hover:bg-muted/40 ${
                  statusIndicator[task.status] || "border-l-transparent"
                } ${isCompleted ? "opacity-50" : ""}`}
              >
                <Checkbox
                  checked={isCompleted}
                  className="h-4 w-4 rounded border-border data-[state=checked]:bg-[hsl(152,60%,38%)] data-[state=checked]:border-[hsl(152,60%,38%)]"
                  onCheckedChange={() => onToggle(task.id)}
                />
                <div className="flex flex-1 flex-col gap-0.5">
                  <span
                    className={`text-sm font-medium transition-all duration-150 ${
                      isCompleted
                        ? "text-muted-foreground line-through decoration-muted-foreground/50"
                        : task.status === "overdue"
                          ? "text-foreground"
                          : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{task.contact}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-medium ${typeColors[task.type] || ""}`}
                >
                  {task.type.replace("-", " ")}
                </Badge>
                <span
                  className={`text-xs font-medium ${
                    task.status === "overdue"
                      ? "text-destructive"
                      : isCompleted
                        ? "text-muted-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {task.dueDate}
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

export function TasksList() {
  const [tasks, setTasks] = useState(initialTasks)
  const [typeFilter, setTypeFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)

  const toggleTask = useCallback((id: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const newCompleted = t.status !== "completed"
        return {
          ...t,
          status: newCompleted ? "completed" as const : "pending" as const,
          section: newCompleted ? "completed" as const : "today" as const,
        }
      })
    )
    const task = tasks.find((t) => t.id === id)
    if (task && task.status !== "completed") {
      toast.success("Task completed")
    } else {
      toast("Task reopened")
    }
  }, [tasks])

  const filtered = tasks.filter((t) => typeFilter === "all" || t.type === typeFilter)

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <Filter className="mr-1 h-3 w-3 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="follow-up">Follow Up</SelectItem>
              <SelectItem value="send-message">Send Message</SelectItem>
              <SelectItem value="prep">Prep</SelectItem>
              <SelectItem value="check-in">Check In</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs">
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col gap-4 pt-2"
              onSubmit={(e) => {
                e.preventDefault()
                setDialogOpen(false)
                toast.success("Task created")
              }}
            >
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Title</Label>
                <Input placeholder="Task description" className="h-8 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Type</Label>
                  <Select>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow-up">Follow Up</SelectItem>
                      <SelectItem value="send-message">Send Message</SelectItem>
                      <SelectItem value="prep">Prep</SelectItem>
                      <SelectItem value="check-in">Check In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Due Date</Label>
                  <Input type="date" className="h-8 text-xs" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Related Contact</Label>
                <Select>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sarah">Sarah Chen</SelectItem>
                    <SelectItem value="marcus">Marcus Rivera</SelectItem>
                    <SelectItem value="lisa">Lisa Wong</SelectItem>
                    <SelectItem value="alex">Alex Johnson</SelectItem>
                  </SelectContent>
                </Select>
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
                  Create Task
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Sections */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-fit">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="today" className="text-xs">Today</TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs">Upcoming</TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs">Overdue</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 flex flex-col gap-6">
          <TaskSection section="overdue" tasks={filtered.filter((t) => t.section === "overdue")} onToggle={toggleTask} />
          <TaskSection section="today" tasks={filtered.filter((t) => t.section === "today")} onToggle={toggleTask} />
          <TaskSection section="upcoming" tasks={filtered.filter((t) => t.section === "upcoming")} onToggle={toggleTask} />
          <TaskSection section="completed" tasks={filtered.filter((t) => t.section === "completed")} onToggle={toggleTask} />
        </TabsContent>

        <TabsContent value="today" className="mt-4 flex flex-col gap-6">
          <TaskSection section="today" tasks={filtered.filter((t) => t.section === "today")} onToggle={toggleTask} />
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4 flex flex-col gap-6">
          <TaskSection section="upcoming" tasks={filtered.filter((t) => t.section === "upcoming")} onToggle={toggleTask} />
        </TabsContent>

        <TabsContent value="overdue" className="mt-4 flex flex-col gap-6">
          <TaskSection section="overdue" tasks={filtered.filter((t) => t.section === "overdue")} onToggle={toggleTask} />
        </TabsContent>

        <TabsContent value="completed" className="mt-4 flex flex-col gap-6">
          <TaskSection section="completed" tasks={filtered.filter((t) => t.section === "completed")} onToggle={toggleTask} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
