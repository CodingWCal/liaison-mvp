import Link from "next/link"
import Image from "next/image"
import {
  Users,
  Workflow,
  CalendarCheck,
  Shield,
} from "lucide-react"
import { LandingHeaderNav, LandingHeroCTAs } from "@/components/landing-ctas"

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-indigo-50/80 via-teal-50/70 via-40% to-violet-50/80">
      {/* Header */}
      <header className="border-b border-teal-300/70 bg-teal-50 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-3 text-foreground transition-opacity hover:opacity-90"
          >
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:h-14 sm:w-14">
              <Image
                src="/logo-nav.png"
                alt="Liaison"
                width={56}
                height={56}
                className="object-contain"
                priority
              />
            </span>
            <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-violet-600 bg-clip-text text-lg font-semibold tracking-tight text-transparent sm:text-xl">
              Liaison
            </span>
          </Link>
          <LandingHeaderNav />
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex flex-col items-center justify-center rounded-2xl border-2 border-indigo-200/80 bg-white px-10 py-8 shadow-md shadow-indigo-200/30 sm:px-14 sm:py-10">
            <div className="relative h-[88px] w-[88px] sm:h-[104px] sm:w-[104px] [filter:drop-shadow(0_0_24px_rgba(99,102,241,0.35))_drop-shadow(0_0_12px_rgba(20,184,166,0.25))]">
              <Image
                src="/logo-nav.png"
                alt=""
                fill
                className="object-contain object-center"
                priority
                sizes="(max-width: 640px) 88px, 104px"
              />
            </div>
            <h1 className="mt-3 bg-gradient-to-r from-indigo-600 via-teal-600 to-violet-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
              Liaison
            </h1>
          </div>
          <p className="mt-5 text-base leading-snug text-indigo-800/90 sm:text-lg">
            Partnerships, sales, and coffee chats—contacts, sequences, and tasks from real relationships.
          </p>
          <div className="mt-6">
            <LandingHeroCTAs />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-indigo-300/50 bg-gradient-to-b from-teal-100/50 to-indigo-100/50 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-xl font-semibold tracking-tight text-indigo-900 sm:text-2xl">
            Built for real outreach
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-indigo-700/80">
            Your contacts and sequences—no seeded data.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border-2 border-teal-200/80 bg-white p-4 shadow-sm transition-all hover:border-teal-400 hover:shadow-md hover:shadow-teal-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/15 text-teal-600">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-teal-900">
                Contact-first CRM
              </h3>
              <p className="mt-1.5 text-xs leading-snug text-teal-800/70">
                Name, role, company, email, notes—scoped and private.
              </p>
            </div>
            <div className="rounded-xl border-2 border-indigo-200/80 bg-white p-4 shadow-sm transition-all hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600">
                <Workflow className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-indigo-900">
                Sequences & outreach
              </h3>
              <p className="mt-1.5 text-xs leading-snug text-indigo-800/70">
                Reusable sequences, ordered steps. Assign contacts, track progress.
              </p>
            </div>
            <div className="rounded-xl border-2 border-violet-200/80 bg-white p-4 shadow-sm transition-all hover:border-violet-400 hover:shadow-md hover:shadow-violet-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-violet-900">
                Tasks & calendar
              </h3>
              <p className="mt-1.5 text-xs leading-snug text-violet-800/70">
                Derived from sequence steps. Mark complete, calendar shows what’s left.
              </p>
            </div>
            <div className="rounded-xl border-2 border-teal-200/80 bg-white p-4 shadow-sm transition-all hover:border-teal-400 hover:shadow-md hover:shadow-teal-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/15 text-teal-600">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-teal-900">
                Secure & scoped
              </h3>
              <p className="mt-1.5 text-xs leading-snug text-teal-800/70">
                Clerk + Supabase. Your data only—no shared demo accounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Positioning */}
      <section className="bg-gradient-to-b from-indigo-50/50 to-violet-50/50 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-xl border-2 border-violet-200/80 bg-white px-6 py-8 text-center shadow-md shadow-violet-100/50 sm:px-10 sm:py-10">
            <h2 className="text-lg font-semibold text-violet-900 sm:text-xl">
              Real data only
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-violet-800/80">
              No demo workflows or seeded pipelines. Your contacts, sequences, and task state are the source of truth—scoped to your account.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-teal-300/70 bg-teal-50 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-3 text-foreground transition-opacity hover:opacity-90"
          >
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:h-11 sm:w-11">
              <Image
                src="/logo-nav.png"
                alt="Liaison"
                width={44}
                height={44}
                className="object-contain"
              />
            </span>
            <span className="bg-gradient-to-r from-indigo-600 via-teal-600 to-violet-600 bg-clip-text text-base font-semibold tracking-tight text-transparent sm:text-lg">
              Liaison
            </span>
          </Link>
          <p className="text-sm text-teal-800/80">
            Professional relationship and outreach tracking.
          </p>
        </div>
      </footer>
    </div>
  )
}
