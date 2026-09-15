import Link from "next/link";

import { Card, primaryButtonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <Card className="px-6 py-14 text-center">
      <h1 className="text-lg font-semibold">Not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That challenge doesn&rsquo;t exist, or it was deleted.
      </p>
      <Link href="/" className={`${primaryButtonClass} mt-5 px-5 py-2.5 text-sm`}>
        Back to the feed
      </Link>
    </Card>
  );
}
