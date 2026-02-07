import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { TopBar } from "@/components/top-bar"
import { SequencesList } from "@/components/sequences-list"
import { getSequences } from "@/lib/db/sequences"
import { getAssignmentCountBySequence } from "@/lib/db/assignments"

export default async function SequencesPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const sequences = await getSequences(userId)
  const assignmentCounts: Record<string, number> = {}
  await Promise.all(
    sequences.map(async (s) => {
      assignmentCounts[s.id] = await getAssignmentCountBySequence(s.id)
    })
  )

  return (
    <>
      <TopBar title="Sequences" />
      <main className="flex-1 overflow-y-auto p-6">
        <SequencesList
          sequences={sequences}
          clerkUserId={userId}
          assignmentCounts={assignmentCounts}
        />
      </main>
    </>
  )
}
