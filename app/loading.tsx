import { FeedSkeleton, HeaderSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <HeaderSkeleton />
      <FeedSkeleton />
    </>
  );
}
