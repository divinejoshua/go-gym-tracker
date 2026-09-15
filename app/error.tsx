"use client";

import { ErrorBanner, primaryButtonClass } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-6">
      <h1 className="mb-3 text-2xl font-bold tracking-tight">Something went wrong</h1>
      <ErrorBanner>{error.message}</ErrorBanner>
      <button
        type="button"
        onClick={reset}
        className={`${primaryButtonClass} mt-5 px-5 py-2.5 text-sm`}
      >
        Try again
      </button>
    </div>
  );
}
