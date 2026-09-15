# Go Gym or Go Broke

A workout accountability tracker for a group of friends. Someone sets a
challenge, everyone commits to N workouts a week, and every workout has to be
backed by proof captured live on camera. Miss your number and you go broke.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 · Supabase
(Postgres + Storage) · TypeScript.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com).

2. **Run the schema.** Open the SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql).
   It creates the tables, indexes, row-level security and the public `proofs`
   storage bucket.

   Tables are prefixed `gogym_` (`gogym_challenges`, `gogym_participants`,
   `gogym_workouts`) so they stay identifiable in a project shared with other
   apps. If you already created the unprefixed tables with an earlier version,
   run [`supabase/migrations/001_prefix_tables.sql`](supabase/migrations/001_prefix_tables.sql)
   instead — it renames them in place and keeps your data.

3. **Add your credentials** to `.env` (see [`.env.local.example`](.env.local.example)):

   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   TZ=Europe/London
   ```

   The service role key is read on the server only and must never get a
   `NEXT_PUBLIC_` prefix — that would ship a key that bypasses row-level
   security to every visitor's browser.

4. **Run it:**

   ```bash
   npm install
   npm run dev
   ```

## Testing the camera on a phone

`getUserMedia` only works in a secure context, so `http://<your-lan-ip>:3000`
will silently fail to open the camera. Use:

```bash
npm run dev:https
```

and accept the self-signed certificate on the phone. Installing to the home
screen also needs HTTPS.

## Pages

| Route              | What it does                                                        |
| ------------------ | ------------------------------------------------------------------- |
| `/`                | Daily feed of every workout, grouped under date headers             |
| `/post`            | Live camera capture plus the workout details form                   |
| `/challenges`      | Every challenge with its status, target and size                    |
| `/challenges/[id]` | Roster, rules, total weeks, this week's scores and recent proof     |
| `/progress`        | The `Eric (2/4)` scoreboard, navigable week by week                 |
| `/admin`           | Create a challenge and add participants                             |

## Notes

- **No accounts.** Everyone shares one link and picks their name from a
  dropdown. That also means `/admin` and `/api/upload` are open to anyone who
  has the URL — fine for a private group link, not for a public deployment.
- **Timezone matters.** Dates render on the server and are compared against
  date-only challenge boundaries, so the process must run in the group's
  timezone. Set `TZ` in production; hosts default to UTC.
- **Proof is camera-only.** There is no file picker anywhere, so an old photo
  from the camera roll can't be posted.

## Deploying

Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `TZ` as environment
variables on your host, then deploy as a standard Next.js app.
