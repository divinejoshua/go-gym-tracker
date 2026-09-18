"use client";

import type { ReactNode } from "react";

import { useViewerTimeZone } from "@/components/viewer-time-zone";
import { groupByDay } from "@/lib/dates";

export type FeedDay = {
  id: string;
  createdAt: string;
  card: ReactNode;
};

/**
 * Day headers over a list of workouts, bucketed in the viewer's own timezone
 * so a card never sits under a date its own timestamp contradicts.
 *
 * The cards arrive already rendered on the server, so this boundary only
 * decides where the headers fall — `WorkoutCard` itself stays off the client
 * bundle.
 */
export function FeedDays({
  items,
  variant,
}: {
  items: FeedDay[];
  variant: "feed" | "challenge";
}) {
  const timeZone = useViewerTimeZone();
  const days = groupByDay(
    items,
    (item) => new Date(item.createdAt),
    new Date(),
    timeZone,
  );

  return (
    <div className="space-y-8">
      {days.map((day) =>
        variant === "feed" ? (
          <section key={day.key}>
            {/* Sticky so you always know which day you're scrolling through. */}
            <h2 className="sticky top-0 z-10 -mx-4 mb-3 bg-background/90 px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground backdrop-blur sm:-mx-6 sm:px-6">
              {day.label}
            </h2>
            <div className="space-y-4">
              {day.items.map((item) => (
                <div key={item.id}>{item.card}</div>
              ))}
            </div>
          </section>
        ) : (
          <div key={day.key}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {day.label}
            </h3>
            <div className="space-y-4">
              {day.items.map((item) => (
                <div key={item.id}>{item.card}</div>
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
