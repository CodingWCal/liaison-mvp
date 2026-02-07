export type SequenceStep = {
  day: number
  channel: "Email" | "LinkedIn" | "Phone" | "In Person"
  action: string
}

export type SequenceAssignment = {
  contactId: string
  contactName: string
  currentStep: number
  startedDate: string
  status: "active" | "paused" | "completed"
}

export type Sequence = {
  id: string
  name: string
  description: string
  steps: SequenceStep[]
  assignments: SequenceAssignment[]
  createdDate: string
}

export const sequences: Sequence[] = [
  {
    id: "seq-1",
    name: "New Partner Intro",
    description:
      "A warm introduction cadence for new partnership prospects. Builds rapport before pitching collaboration.",
    steps: [
      { day: 1, channel: "Email", action: "Send intro email with context" },
      { day: 3, channel: "LinkedIn", action: "Connect request with personal note" },
      { day: 5, channel: "Email", action: "Share relevant case study or article" },
      { day: 8, channel: "Phone", action: "Quick intro call to align interests" },
      { day: 14, channel: "Email", action: "Follow up with partnership one-pager" },
    ],
    assignments: [
      { contactId: "2", contactName: "Marcus Rivera", currentStep: 3, startedDate: "Jan 28", status: "active" },
      { contactId: "5", contactName: "James Park", currentStep: 1, startedDate: "Feb 4", status: "active" },
    ],
    createdDate: "Jan 15, 2026",
  },
  {
    id: "seq-2",
    name: "Event Follow-Up",
    description:
      "Post-event nurture sequence to convert new connections into meaningful relationships.",
    steps: [
      { day: 1, channel: "LinkedIn", action: "Send connection request referencing event" },
      { day: 2, channel: "Email", action: "Send thank-you with event recap" },
      { day: 7, channel: "Email", action: "Share useful resource related to convo" },
      { day: 14, channel: "Phone", action: "Suggest a coffee chat or quick call" },
    ],
    assignments: [
      { contactId: "7", contactName: "Taylor Lee", currentStep: 2, startedDate: "Jan 26", status: "paused" },
    ],
    createdDate: "Jan 20, 2026",
  },
  {
    id: "seq-3",
    name: "Re-engagement",
    description:
      "Revive dormant contacts who have gone cold. Light-touch check-ins to restart the conversation.",
    steps: [
      { day: 1, channel: "Email", action: "Friendly check-in email" },
      { day: 5, channel: "LinkedIn", action: "Engage with their recent post" },
      { day: 10, channel: "Email", action: "Share something they would find valuable" },
      { day: 15, channel: "Phone", action: "Direct call to reconnect" },
      { day: 21, channel: "In Person", action: "Invite to lunch or local meetup" },
    ],
    assignments: [],
    createdDate: "Feb 1, 2026",
  },
  {
    id: "seq-4",
    name: "Recruiter Pipeline",
    description:
      "Stay top-of-mind with recruiting contacts through periodic touchpoints.",
    steps: [
      { day: 1, channel: "Email", action: "Initial intro and role context" },
      { day: 4, channel: "LinkedIn", action: "Share portfolio or recent work" },
      { day: 10, channel: "Phone", action: "Schedule a brief call" },
    ],
    assignments: [
      { contactId: "8", contactName: "Jordan Williams", currentStep: 2, startedDate: "Feb 2", status: "active" },
    ],
    createdDate: "Feb 2, 2026",
  },
]

export const channelColors: Record<string, string> = {
  Email: "bg-[hsl(215,25%,50%)]/10 text-[hsl(215,25%,50%)] border-[hsl(215,25%,50%)]/20",
  LinkedIn: "bg-[hsl(245,58%,58%)]/10 text-[hsl(245,58%,58%)] border-[hsl(245,58%,58%)]/20",
  Phone: "bg-[hsl(16,80%,58%)]/10 text-[hsl(16,80%,58%)] border-[hsl(16,80%,58%)]/20",
  "In Person": "bg-primary/10 text-primary border-primary/20",
}

export const assignmentStatusColors: Record<string, string> = {
  active: "bg-[hsl(152,60%,38%)]/10 text-[hsl(152,60%,38%)] border-[hsl(152,60%,38%)]/20",
  paused: "bg-[hsl(38,80%,55%)]/10 text-[hsl(38,80%,55%)] border-[hsl(38,80%,55%)]/20",
  completed: "bg-muted text-muted-foreground border-border",
}
