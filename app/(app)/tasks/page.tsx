import { TopBar } from "@/components/top-bar"
import { TasksList } from "@/components/tasks-list"

export default function TasksPage() {
  return (
    <>
      <TopBar title="Tasks" />
      <div className="flex-1 overflow-auto p-6">
        <TasksList />
      </div>
    </>
  )
}
