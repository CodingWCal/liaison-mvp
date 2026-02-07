import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"

import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Liaison — Professional Relationship Management",
  description:
    "Track professional contacts, conversations, follow-ups, and outreach touchpoints in one place.",
}

export const viewport: Viewport = {
  themeColor: "#2a9d8f",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans antialiased" suppressHydrationWarning>
          {children}
          <Toaster position="bottom-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
