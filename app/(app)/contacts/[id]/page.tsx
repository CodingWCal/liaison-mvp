import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import { TopBar } from "@/components/top-bar"
import { ContactDetail } from "@/components/contact-detail"
import { getContactById } from "@/lib/db/contacts"
import { getAssignedSequencesForContact } from "@/lib/db/sequences"

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { id } = await params
  const [contact, assignedSequences] = await Promise.all([
    getContactById(id, userId),
    getAssignedSequencesForContact(id, userId),
  ])

  if (!contact) notFound()

  return (
    <>
      <TopBar title="Contact Details" />
      <div className="flex-1 overflow-auto p-6">
        <ContactDetail
          contact={contact}
          clerkUserId={userId}
          assignedSequences={assignedSequences}
        />
      </div>
    </>
  )
}
