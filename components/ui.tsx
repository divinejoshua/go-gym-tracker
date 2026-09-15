import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <Card className="px-6 py-12 text-center">
      <p className="text-base font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{body}</p>
      {cta ? (
        <Link
          href={cta.href}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink transition active:scale-95"
        >
          {cta.label}
        </Link>
      ) : null}
    </Card>
  );
}

/** Small lozenge used for challenge names, workout types and statuses. */
export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "lime" | "broke";
}) {
  const tones = {
    neutral: "border-line bg-surface-2 text-muted",
    lime: "border-lime/30 bg-lime/10 text-lime",
    broke: "border-broke/30 bg-broke/10 text-broke",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * Shown instead of a crash when the Supabase env vars are missing, so a fresh
 * clone explains itself rather than throwing a stack trace at you.
 */
export function SetupNotice() {
  return (
    <Card className="px-6 py-10">
      <h2 className="text-lg font-semibold">Connect Supabase to get started</h2>
      <ol className="mt-4 space-y-3 text-sm text-muted">
        <li>
          <span className="font-medium text-white">1.</span> Create a project at{" "}
          <span className="font-mono text-lime">supabase.com</span>.
        </li>
        <li>
          <span className="font-medium text-white">2.</span> Open the SQL Editor and
          run <span className="font-mono text-lime">supabase/schema.sql</span> from
          this repo.
        </li>
        <li>
          <span className="font-medium text-white">3.</span> Put your project URL and
          service role key in <span className="font-mono text-lime">.env</span>:
          <pre className="mt-2 overflow-x-auto rounded-lg border border-line bg-ink p-3 font-mono text-xs leading-relaxed text-white">
{`SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...`}
          </pre>
        </li>
        <li>
          <span className="font-medium text-white">4.</span> Restart{" "}
          <span className="font-mono text-lime">npm run dev</span>.
        </li>
      </ol>
    </Card>
  );
}
