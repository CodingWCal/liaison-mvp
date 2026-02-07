import { TopBar } from "@/components/top-bar"
import { DashboardContent } from "@/components/dashboard-content"

export default function DashboardPage() {
  return (
    <>
      <TopBar title="Dashboard" />
      <div className="flex-1 overflow-auto p-6">
        <DashboardContent />
      </div>
    </>
  )
}
