import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { TopBar } from "@/components/top-bar"
import { SequenceDetail } from "@/components/sequence-detail"
import { getSequenceById } from "@/lib/db/sequences"
import { getContacts } from "@/lib/db/contacts"
import {
  getAssignmentCountBySequence,
  getAssignedContactIdsForSequence,
  getAssignedContactsForSequence,
} from "@/lib/db/assignments"

export default async function SequenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { id } = await params
  const [
    sequence,
    contacts,
    assignmentCount,
    assignedContactIds,
    assignedContacts,
  ] = await Promise.all([
    getSequenceById(id, userId),
    getContacts(userId),
    getAssignmentCountBySequence(id),
    getAssignedContactIdsForSequence(id),
    getAssignedContactsForSequence(id),
  ])

  if (!sequence) notFound()

  return (
    <>
      <TopBar title="Sequence Detail" />
      <main className="flex-1 overflow-y-auto p-6">
        <SequenceDetail
          sequence={sequence}
          clerkUserId={userId}
          contacts={contacts}
          assignmentCount={assignmentCount}
          assignedContactIds={assignedContactIds}
          assignedContacts={assignedContacts}
        />
      </main>
    </>
  )
}
