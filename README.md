# Liaison

Liaison is a lightweight relationship and outreach management MVP for professionals managing ongoing connections such as sales prospects, partnerships, recruiting leads, or coffee chats.

It focuses on clarity, ownership, and reuse of outreach workflows rather than automation or message volume.

[Hosted Link:](https://liaison-mvp.vercel.app/)

## Tech Stack

Frontend
* Next.js App Router
* TypeScript
* Tailwind CSS
* shadcn ui components

Authentication
* Clerk

Database
* Supabase Postgres

Data Access
* Next.js Server Actions for mutations and reads
* Records scoped by clerk user id

## Problem

Professionals often manage relationships across spreadsheets, notes apps, CRMs, and calendars. Many CRMs are too heavy for lightweight use cases or too rigid for personal workflows like networking and partnership development.

Liaison explores a simpler middle ground focused on:
* Clear ownership of contacts per user
* Reusable outreach sequences
* Minimal surface area with strong data integrity

## MVP Scope

This repository represents a deliberately scoped MVP focused on stability and correctness over feature depth.

Implemented
* Clerk auth using Clerk hosted sign in and sign up pages
* Automatic user persistence in Supabase on first sign in
* Contacts CRUD create read update delete
* Sequences with ordered steps
* Assign contacts to sequences
* Strict per user scoping via clerk user id

Out of scope for this MVP
* Messaging automation
* Background jobs or schedulers
* Notifications
* Analytics
* External CRM integrations

## Architecture Notes

All data is scoped by clerk user id so every record belongs to a signed in user. Mutations are performed through server actions to keep write access on the server.

## Local Development

Prereqs
* Node.js 18 or higher
* Clerk app
* Supabase project

Setup
1. Install dependencies
npm install

2. Environment variables
Copy .env.example to .env.local and set:
* NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
* CLERK_SECRET_KEY
* NEXT_PUBLIC_SUPABASE_URL
* SUPABASE_SERVICE_ROLE_KEY

3. Create database tables
Run the SQL in supabase schema sql using the Supabase SQL editor.

4. Run the app
npm run dev

## Design Philosophy

This MVP intentionally avoids heavy polish and over architecture. The goal is to validate:
* A clean schema
* Correct auth and authorization boundaries
* A foundation that can later support CSV import and HubSpot friendly integration

## Status

Active MVP built and intended as a foundation for iteration rather than a production ready CRM.
