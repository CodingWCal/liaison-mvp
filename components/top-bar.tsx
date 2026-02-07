"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function TopBar({ title }: { title: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/80 bg-card px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <h1 className="text-sm font-semibold tracking-tight text-foreground">{title}</h1>
      <div className="ml-auto flex items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-8 w-56 rounded-md bg-muted/40 pl-8 text-xs transition-colors duration-150 focus:bg-card"
          />
        </div>
      </div>
    </header>
  )
}
