import { FeedSkeleton, HeaderSkeleton, RowsSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <HeaderSkeleton />
      <div className="mb-6">
        <RowsSkeleton count={3} />
      </div>
      <FeedSkeleton count={1} />
    </>
  );
}
