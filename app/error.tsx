"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-broke/40 bg-broke/10 px-6 py-10 text-center">
      <h1 className="text-lg font-bold text-broke">Something went wrong</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink"
      >
        Try again
      </button>
    </div>
  );
}
