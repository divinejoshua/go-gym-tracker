import Image from "next/image";

import { FeedVideo } from "@/components/feed-video";
import { Card, Pill } from "@/components/ui";
import { LocalTime } from "@/components/viewer-time-zone";
import { durationLabel, workoutTypeLabel, type FeedWorkout } from "@/lib/types";

export function WorkoutCard({
  workout,
  showChallenge = true,
}: {
  workout: FeedWorkout;
  showChallenge?: boolean;
}) {
  const type = workoutTypeLabel(workout.workout_type);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar name={workout.participant_name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{workout.participant_name}</p>
          <p className="truncate text-xs text-muted-foreground">
            <LocalTime iso={workout.created_at} />
            {workout.venue ? <> · {workout.venue}</> : null}
          </p>
        </div>
        <Pill tone="primary">
          <span aria-hidden="true">{type.emoji}</span>
          {type.label}
        </Pill>
      </div>

      {workout.media_url ? (
        /* Dark stage so photos and video letterbox cleanly on a white page. */
        <div className="relative aspect-4/5 w-full bg-foreground sm:aspect-square">
          {workout.media_type === "video" ? (
            <FeedVideo src={workout.media_url} />
          ) : (
            <Image
              src={workout.media_url}
              alt={`${workout.participant_name}'s ${type.label.toLowerCase()} proof`}
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-cover"
            />
          )}
        </div>
      ) : (
        /* Backfilled workout. Nothing was captured at the time, so keep the
           placeholder small rather than reserving the full-bleed stage for it. */
        <div className="px-4 pt-1">
          <div className="flex h-20 w-32 items-center justify-center rounded-md border border-dashed border-border bg-muted px-2 text-center text-xs font-medium text-muted-foreground">
            No image available
          </div>
        </div>
      )}

      <div className="space-y-3 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {workout.duration ? <Pill>⏱ {durationLabel(workout.duration)}</Pill> : null}
          {showChallenge ? <Pill>🏆 {workout.challenge_name}</Pill> : null}
        </div>

        {workout.routine ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
            {workout.routine}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

/** Initials bubble — nobody uploads a profile picture in a group of friends. */
export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
    >
      {initials}
    </span>
  );
}
