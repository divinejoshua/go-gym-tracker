import Image from "next/image";

import { Card, Pill } from "@/components/ui";
import { timeLabel } from "@/lib/dates";
import { durationLabel, workoutTypeLabel, type FeedWorkout } from "@/lib/types";

export function WorkoutCard({
  workout,
  showChallenge = true,
}: {
  workout: FeedWorkout;
  showChallenge?: boolean;
}) {
  const type = workoutTypeLabel(workout.workout_type);
  const postedAt = new Date(workout.created_at);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar name={workout.participant_name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{workout.participant_name}</p>
          <p className="truncate text-xs text-muted-foreground">
            <time dateTime={workout.created_at}>{timeLabel(postedAt)}</time>
            {workout.venue ? <> · {workout.venue}</> : null}
          </p>
        </div>
        <Pill tone="primary">
          <span aria-hidden="true">{type.emoji}</span>
          {type.label}
        </Pill>
      </div>

      {/* Dark stage so photos and video letterbox cleanly on a white page. */}
      <div className="relative aspect-4/5 w-full bg-foreground sm:aspect-square">
        {workout.media_type === "video" ? (
          <video
            src={workout.media_url}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
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

      <div className="space-y-3 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Pill>⏱ {durationLabel(workout.duration)}</Pill>
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
