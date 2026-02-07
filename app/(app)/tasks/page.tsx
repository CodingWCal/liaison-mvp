import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { TopBar } from "@/components/top-bar"
import { TasksList } from "@/components/tasks-list"
import { getDerivedTasks } from "@/lib/db/tasks"

export default async function TasksPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const derivedTasks = await getDerivedTasks(userId)

  return (
    <>
      <TopBar title="Tasks" />
      <div className="flex-1 overflow-auto p-6">
        <TasksList derivedTasks={derivedTasks} clerkUserId={userId} />
      </div>
    </>
  )
}
