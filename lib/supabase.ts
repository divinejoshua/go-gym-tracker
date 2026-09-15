// Never let this module end up in a browser bundle: it reads the service role
// key, which bypasses row-level security. Importing it from a Client Component
// is a build error rather than a silent credential leak.
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/types";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

// Prefer the service role key. The anon key also works if you'd rather not put
// an admin key on the server — the schema's RLS policies allow read + insert.
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const PROOF_BUCKET = "proofs";

/** Lets pages render setup instructions instead of crashing on a fresh clone. */
export const isSupabaseConfigured = Boolean(url && key);

let cached: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
        "to .env, then restart the dev server.",
    );
  }

  cached ??= createClient<Database>(url, key, {
    // No user sessions in this app, so don't let the client persist or refresh any.
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}
