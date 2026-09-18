"use client";

import { useViewerTimeZone } from "@/components/viewer-time-zone";
import { WorkoutCard } from "@/components/workout-card";
import { groupByDay } from "@/lib/dates";
import type { FeedWorkout } from "@/lib/types";

/**
 * Day headers over a list of workouts, bucketed in the viewer's own timezone
 * so a card never sits under a date its own timestamp contradicts.
 */
export function FeedDays({
  workouts,
  variant,
}: {
  workouts: FeedWorkout[];
  variant: "feed" | "challenge";
}) {
  const timeZone = useViewerTimeZone();
  const days = groupByDay(
    workouts,
    (workout) => new Date(workout.created_at),
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
              {day.items.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          </section>
        ) : (
          <div key={day.key}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {day.label}
            </h3>
            <div className="space-y-4">
              {day.items.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} showChallenge={false} />
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}
