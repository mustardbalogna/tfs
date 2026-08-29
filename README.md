# Top Furniture Supplies

A modern web application for Top Furniture Supplies built with React, TypeScript, and React Router.

## Tech Stack

- **Framework:** React with TypeScript
- **Routing:** React Router
- **Build Tool:** Vite
- **Package Manager:** npm
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Backend:** Vercel serverless functions (`api/`)
- **Database:** Supabase (Postgres)
- **Email:** Resend
- **Analytics:** Vercel Web Analytics
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (includes npm)
- A [Supabase](https://supabase.com) project (for message storage)
- A [Resend](https://resend.com) account (for owner notification emails)

### Installation

```bash
# Install dependencies
npm install
```

Copy `.env.example` to `.env` and fill in the values (see [Environment Variables](#environment-variables) below).

### Development

```bash
# Start the development server
npm run dev
```

### Build

```bash
# Build for production
npm run build
```

## Environment Variables

See `.env.example` for the full list. In production these are set in the Vercel project's
Environment Variables settings, not committed to the repo.

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role / secret key (server-side only) |
| `RESEND_API_KEY` | Resend API key for sending notification emails |
| `RESEND_FROM_EMAIL` | "From" address on the owner notification email |
| `OWNER_NOTIFICATION_EMAIL` | Inbox that receives new contact form enquiries |
| `ADMIN_PASSWORD` | Password for the `/admin` dashboard |
| `SESSION_SECRET` | Random string used to sign admin session cookies |

## Database Setup

Run [`supabase/schema.sql`](supabase/schema.sql) once in the Supabase SQL editor for your project.
It creates the `messages` and `rate_limits` tables, enables RLS with no public policies, and grants
the `service_role` the table privileges needed by the API (required since "Automatically expose new
tables" is left off for security).

## Admin Dashboard

Visit `/admin/login` and sign in with `ADMIN_PASSWORD` to view contact form submissions at `/admin`.

## Project Structure

- `src/pages/` - Application pages / routes
- `src/pages/admin/` - Admin login and message dashboard
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions
- `src/hooks/` - Custom React hooks
- `api/` - Vercel serverless functions (contact form, admin auth, messages)
- `api/_lib/` - Shared server-side helpers (Supabase client, email, session, rate limiting)
- `supabase/schema.sql` - Database schema to run in the Supabase SQL editor

## Deployment

Deployed on Vercel, connected to this GitHub repo for automatic deployments on push to `main`.
`vercel.json` rewrites all routes to `index.html` so client-side routing (React Router) works
correctly on refresh and direct navigation.

## License

All rights reserved.
