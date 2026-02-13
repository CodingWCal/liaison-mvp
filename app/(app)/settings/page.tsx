import Link from "next/link"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Workflow } from "lucide-react"

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" />
      <div className="flex-1 overflow-auto p-6">
        <Card className="border-border bg-card max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" size="sm" className="w-fit justify-start gap-2 text-xs" asChild>
              <Link href="/contacts">
                <Workflow className="h-3.5 w-3.5" /> Add contacts to sequence
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Select contacts on the Contacts page, then use &quot;Add to sequence&quot; to assign them to a sequence.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
