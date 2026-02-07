import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { TopBar } from "@/components/top-bar"
import { CalendarView } from "@/components/calendar-view"
import { getDerivedTasks } from "@/lib/db/tasks"

export default async function CalendarPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const derivedTasks = await getDerivedTasks(userId)

  return (
    <>
      <TopBar title="Calendar" />
      <div className="flex-1 overflow-auto p-6">
        <CalendarView derivedTasks={derivedTasks} />
      </div>
    </>
  )
}
