import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-6">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">L</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">
            Liaison
          </span>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Liaison is a relationship and outreach tracking tool for networking,
          sales, partnerships, and coffee chats. Keep your contacts and
          follow-ups in one place.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="default">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="outline" size="default">
            <Link href="/sign-up">Get started</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
