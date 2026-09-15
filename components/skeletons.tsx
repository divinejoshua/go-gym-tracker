import { Card } from "@/components/ui";

/**
 * Shared building blocks for the route-level `loading.tsx` files.
 *
 * Every data page is `force-dynamic`, so without a loading state the browser
 * sits on the old page until the server responds — which reads as a full page
 * reload. A `loading.tsx` lets Next prefetch this shell and swap it in
 * instantly, keeping the nav interactive during the transition.
 */
function Shimmer({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export function HeaderSkeleton() {
  return (
    <div className="mb-5">
      <Shimmer className="h-8 w-52" />
      <Shimmer className="mt-2 h-4 w-32" />
    </div>
  );
}

export function FeedSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <Shimmer className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Shimmer className="h-4 w-28" />
              <Shimmer className="mt-1.5 h-3 w-40" />
            </div>
          </div>
          <Shimmer className="aspect-4/5 w-full rounded-none sm:aspect-square" />
          <div className="flex gap-2 px-4 py-3">
            <Shimmer className="h-6 w-24 rounded-full" />
            <Shimmer className="h-6 w-28 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function RowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="flex items-center gap-3 px-4 py-3">
          <Shimmer className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Shimmer className="h-4 w-32" />
            <Shimmer className="mt-2 h-1.5 w-full rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function CardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="px-4 py-4">
          <Shimmer className="h-5 w-40" />
          <Shimmer className="mt-2 h-4 w-28" />
          <div className="mt-3 flex gap-2">
            <Shimmer className="h-6 w-20 rounded-full" />
            <Shimmer className="h-6 w-20 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}
