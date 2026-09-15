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
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
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
      className={`rounded-xl border border-border bg-card text-card-foreground shadow-xs ${className}`}
    >
      {children}
    </div>
  );
}

/** The one filled call-to-action style, shared by every primary button. */
export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground shadow-xs transition hover:brightness-95 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

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
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      {cta ? (
        <Link href={cta.href} className={`${primaryButtonClass} mt-5 px-5 py-2.5 text-sm`}>
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
  tone?: "neutral" | "primary" | "destructive";
}) {
  const tones = {
    neutral: "border-border bg-muted text-muted-foreground",
    primary: "border-transparent bg-primary text-primary-foreground",
    destructive: "border-destructive/25 bg-destructive/10 text-destructive",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Error banner shared by the forms and the route error boundary. */
export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
    >
      {children}
    </p>
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
      <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
        <li>
          <span className="font-semibold text-foreground">1.</span> Create a project
          at <span className="font-mono">supabase.com</span>.
        </li>
        <li>
          <span className="font-semibold text-foreground">2.</span> Open the SQL
          Editor and run <span className="font-mono">supabase/schema.sql</span> from
          this repo.
        </li>
        <li>
          <span className="font-semibold text-foreground">3.</span> Put your project
          URL and service role key in <span className="font-mono">.env</span>:
          <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-muted p-3 font-mono text-xs leading-relaxed text-foreground">
{`SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...`}
          </pre>
        </li>
        <li>
          <span className="font-semibold text-foreground">4.</span> Restart{" "}
          <span className="font-mono">npm run dev</span>.
        </li>
      </ol>
    </Card>
  );
}
