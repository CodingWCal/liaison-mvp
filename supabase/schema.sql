-- Run this in Supabase SQL Editor to create tables for the MVP.

-- Users (synced from Clerk on first sign-in)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  email text,
  created_at timestamptz not null default now()
);

-- Contacts (belong to signed-in user via clerk_user_id)
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  name text not null,
  role text,
  company text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);

-- Sequences (read-only after creation)
create table if not exists public.sequences (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  name text not null,
  created_at timestamptz not null default now()
);

-- Sequence steps (order, channel, label, suggested timing)
create table if not exists public.sequence_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references public.sequences(id) on delete cascade,
  step_order int not null,
  channel text not null,
  label text not null,
  suggested_timing text,
  created_at timestamptz not null default now()
);

-- Assign contacts to sequences (many-to-many)
create table if not exists public.contact_sequence_assignments (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  sequence_id uuid not null references public.sequences(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique(contact_id, sequence_id)
);

-- Optional: indexes for common filters
create index if not exists idx_contacts_clerk_user_id on public.contacts(clerk_user_id);
create index if not exists idx_sequences_clerk_user_id on public.sequences(clerk_user_id);
create index if not exists idx_sequence_steps_sequence_id on public.sequence_steps(sequence_id);
create index if not exists idx_contact_sequence_assignments_contact_id on public.contact_sequence_assignments(contact_id);
create index if not exists idx_contact_sequence_assignments_sequence_id on public.contact_sequence_assignments(sequence_id);

-- Task completion (derived tasks; no tasks table)
create table if not exists public.completed_tasks (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  contact_id uuid not null,
  sequence_id uuid not null,
  step_order int not null,
  completed_at timestamptz not null default now(),
  unique(clerk_user_id, contact_id, sequence_id, step_order)
);
create index if not exists idx_completed_tasks_clerk_user_id on public.completed_tasks(clerk_user_id);

-- Add LinkedIn and company website to contacts (run if table already exists)
alter table public.contacts add column if not exists linkedin_url text;
alter table public.contacts add column if not exists company_website text;
