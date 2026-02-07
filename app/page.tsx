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
    <div className="min-h-svh bg-gradient-to-b from-background via-indigo-50/30 via-teal-50/20 to-violet-50/30">
      {/* Header */}
      <header className="border-b border-teal-200/60 bg-teal-50/95 backdrop-blur-sm">
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
            <span className="text-lg font-semibold tracking-tight sm:text-xl">
              Liaison
            </span>
          </Link>
          <LandingHeaderNav />
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="relative mx-auto flex justify-center">
            <div
              className="relative h-[120px] w-[300px] sm:h-[160px] sm:w-[400px] lg:h-[200px] lg:w-[500px] rounded-2xl transition-all duration-300 ease-out shadow-xl [box-shadow:0_20px_40px_-12px_rgba(0,0,0,0.12),0_0_50px_-12px_rgba(99,102,241,0.22)] hover:shadow-2xl hover:scale-[1.02] hover:[box-shadow:0_25px_50px_-12px_rgba(0,0,0,0.18),0_0_80px_-12px_rgba(99,102,241,0.35),0_0_40px_-12px_rgba(139,92,246,0.2)]"
            >
              <Image
                src="/logo.png"
                alt="Liaison"
                fill
                className="object-contain object-center"
                priority
                sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 500px"
              />
            </div>
          </div>
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Relationship-driven outreach,{" "}
            <span className="text-indigo-600">in one place</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Liaison keeps your partnerships, sales, and coffee chats organized.
            Contacts, sequences, and tasks—all from real relationships, no demo
            workflows.
          </p>
          <LandingHeroCTAs />
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-indigo-200/40 bg-gradient-to-b from-teal-50/20 to-indigo-50/20 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Built for real outreach
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            No seeded data or fake pipelines. Your contacts and sequences only.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-indigo-200/60 bg-card p-6 shadow-sm transition-all duration-200 hover:border-teal-300/70 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                Contact-first CRM
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Store name, role, company, email, and notes. Every contact
                belongs to you—scoped and private.
              </p>
            </div>
            <div className="rounded-xl border border-indigo-200/60 bg-card p-6 shadow-sm transition-all duration-200 hover:border-indigo-300/70 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <Workflow className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                Sequence-driven outreach
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Define reusable sequences with ordered steps. Assign contacts
                and track progress—read-only after creation.
              </p>
            </div>
            <div className="rounded-xl border border-indigo-200/60 bg-card p-6 shadow-sm transition-all duration-200 hover:border-violet-300/70 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                Tasks and calendar from relationships
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Derived tasks from sequence steps and assignments. Mark complete
                with live updates. Calendar shows only real, incomplete tasks.
              </p>
            </div>
            <div className="rounded-xl border border-indigo-200/60 bg-card p-6 shadow-sm transition-all duration-200 hover:border-teal-300/70 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                Secure auth and persistence
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Sign in with Clerk. Data stored in Supabase—user-scoped, no
                shared demo accounts or placeholder data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Positioning */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border border-indigo-200/50 bg-card px-6 py-12 text-center shadow-sm sm:px-12 sm:py-16">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              Real data only
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Liaison does not use demo workflows, seeded pipelines, or fake
              metrics. Your contacts, sequences, and task completion state are
              the only source of truth. Everything is scoped to your account.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-teal-200/60 bg-teal-50/95 backdrop-blur-sm">
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
            <span className="text-base font-semibold tracking-tight sm:text-lg">
              Liaison
            </span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Professional relationship and outreach tracking.
          </p>
        </div>
      </footer>
    </div>
  )
}
