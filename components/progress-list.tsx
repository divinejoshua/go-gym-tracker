import { Avatar } from "@/components/workout-card";
import { Card } from "@/components/ui";
import type { ParticipantWeek } from "@/lib/queries";

/**
 * The "Eric (2/4)" scoreboard. Everyone in the challenge with the workouts
 * they logged in the selected week, ordered by who is furthest ahead.
 */
export function ProgressList({ rows }: { rows: ParticipantWeek[] }) {
  if (rows.length === 0) {
    return (
      <Card className="px-6 py-10 text-center text-sm text-muted-foreground">
        Nobody has been added to this challenge yet.
      </Card>
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map(({ participant, done, target }) => {
        const hit = done >= target;
        const percent = Math.min(100, Math.round((done / target) * 100));

        return (
          <li key={participant.id}>
            <Card className="flex items-center gap-3 px-4 py-3">
              <Avatar name={participant.name} />

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate font-semibold">
                    {participant.name}{" "}
                    <span
                      className={hit ? "text-primary-foreground" : "text-destructive"}
                    >
                      ({done}/{target})
                    </span>
                  </p>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {hit ? "Safe ✅" : `${target - done} to go`}
                  </span>
                </div>

                <div
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={done}
                  aria-valuemin={0}
                  aria-valuemax={target}
                  aria-label={`${participant.name}: ${done} of ${target} workouts`}
                >
                  <div
                    className={`h-full rounded-full transition-all ${
                      hit ? "bg-primary" : "bg-destructive"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
