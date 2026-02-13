import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { TopBar } from "@/components/top-bar"
import { ContactsTable } from "@/components/contacts-table"
import { ImportCsvModal } from "@/components/import-csv-modal"
import { getContacts } from "@/lib/db/contacts"
import { getSequences } from "@/lib/db/sequences"

export default async function ContactsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const [contacts, sequences] = await Promise.all([getContacts(userId), getSequences(userId)])

  return (
    <>
      <TopBar title="Contacts" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-4 flex items-center justify-end">
          <ImportCsvModal clerkUserId={userId} />
        </div>
        <ContactsTable contacts={contacts} clerkUserId={userId} sequences={sequences} />
      </div>
    </>
  )
}
