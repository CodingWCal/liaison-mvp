"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  Workflow,
  LogOut,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Contacts", href: "/contacts", icon: Users },
  { title: "Sequences", href: "/sequences", icon: Workflow },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Calendar", href: "/calendar", icon: Calendar },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const { signOut } = useClerk()
  const displayName =
    user?.primaryEmailAddress?.emailAddress ??
    user?.fullName ??
    user?.firstName ??
    "Account"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5">
        <Link href="/dashboard" className="group/logo flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-shadow duration-150 group-hover/logo:shadow-md">
            <span className="text-sm font-bold text-primary-foreground">L</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
            Liaison
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Account" className="group-data-[collapsible=icon]:!p-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col text-left text-sm group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium text-foreground">
                  {user?.fullName ?? user?.firstName ?? "User"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress ?? ""}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
