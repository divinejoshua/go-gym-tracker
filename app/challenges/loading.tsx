import { CardsSkeleton, HeaderSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <>
      <HeaderSkeleton />
      <CardsSkeleton />
    </>
  );
}
