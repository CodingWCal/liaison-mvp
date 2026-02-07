import { TopBar } from "@/components/top-bar"
import { CalendarView } from "@/components/calendar-view"

export default function CalendarPage() {
  return (
    <>
      <TopBar title="Calendar" />
      <div className="flex-1 overflow-auto p-6">
        <CalendarView />
      </div>
    </>
  )
}
