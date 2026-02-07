"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function LandingHeaderNav() {
  return (
    <nav className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        className="hover:bg-indigo-100 hover:text-indigo-700 focus-visible:ring-indigo-500/30"
        asChild
      >
        <Link href="/sign-in">Sign In</Link>
      </Button>
      <Button
        size="sm"
        className="bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500/30 text-white"
        asChild
      >
        <Link href="/sign-up">Get Started</Link>
      </Button>
    </nav>
  )
}

export function LandingHeroCTAs() {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
      <Button
        size="lg"
        className="h-11 px-6 text-base bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500/30 text-white transition-colors"
        asChild
      >
        <Link href="/sign-up">
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="h-11 px-6 text-base border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 focus-visible:ring-indigo-500/30 transition-colors"
        asChild
      >
        <Link href="/sign-in">Sign In</Link>
      </Button>
    </div>
  )
}
