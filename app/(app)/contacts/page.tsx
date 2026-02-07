import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { TopBar } from "@/components/top-bar"
import { ContactsTable } from "@/components/contacts-table"
import { getContacts } from "@/lib/db/contacts"

export default async function ContactsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const contacts = await getContacts(userId)

  return (
    <>
      <TopBar title="Contacts" />
      <div className="flex-1 overflow-auto p-6">
        <ContactsTable contacts={contacts} clerkUserId={userId} />
      </div>
    </>
  )
}
