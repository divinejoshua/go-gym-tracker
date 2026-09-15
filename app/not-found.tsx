import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-2xl border border-line bg-surface px-6 py-14 text-center">
      <h1 className="text-lg font-bold">Not found</h1>
      <p className="mt-2 text-sm text-muted">
        That challenge doesn&rsquo;t exist, or it was deleted.
      </p>
      <Link
        href="/"
        className="mt-5 inline-block rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink"
      >
        Back to the feed
      </Link>
    </div>
  );
}
