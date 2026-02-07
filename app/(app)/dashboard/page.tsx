import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { TopBar } from "@/components/top-bar"
import { DashboardContent } from "@/components/dashboard-content"
import { getDashboardStats } from "@/lib/db/dashboard"
import { getDerivedTasks } from "@/lib/db/tasks"

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [stats, derivedTasks] = await Promise.all([
    getDashboardStats(userId),
    getDerivedTasks(userId),
  ])

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="flex-1 overflow-auto p-6">
        <DashboardContent
          stats={stats}
          derivedTasks={derivedTasks}
          clerkUserId={userId}
        />
      </div>
    </>
  )
}
