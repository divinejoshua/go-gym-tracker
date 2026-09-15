import { HeaderSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <HeaderSkeleton />
      <div className="aspect-4/5 w-full animate-pulse rounded-xl bg-muted" />
    </>
  );
}
