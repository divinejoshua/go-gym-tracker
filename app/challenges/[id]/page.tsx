import Link from "next/link";
import { notFound } from "next/navigation";

import { ProgressList } from "@/components/progress-list";
import { Card, PageHeader, Pill } from "@/components/ui";
import { WorkoutCard } from "@/components/workout-card";
import {
  challengeStatus,
  currentWeekIndex,
  groupByDay,
  parseDateOnly,
  shortDate,
  totalWeeks,
  weekRange,
} from "@/lib/dates";
import {
  getChallenge,
  getChallengeFeed,
  getWeeklyProgress,
} from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const STATUS_TONE = { active: "lime", upcoming: "neutral", finished: "broke" } as const;
const STATUS_LABEL = {
  active: "Active",
  upcoming: "Not started",
  finished: "Finished",
} as const;

export default async function ChallengePage({ params }: PageProps<"/challenges/[id]">) {
  if (!isSupabaseConfigured) notFound();

  const { id } = await params;
  const challenge = await getChallenge(id);
  if (!challenge) notFound();

  const weekIndex = currentWeekIndex(challenge.start_date, challenge.end_date);
  const weeks = totalWeeks(challenge.start_date, challenge.end_date);
  const status = challengeStatus(challenge.start_date, challenge.end_date);
  const { start, end } = weekRange(challenge.start_date, weekIndex);

  const [progress, workouts] = await Promise.all([
    getWeeklyProgress(challenge, weekIndex),
    getChallengeFeed(challenge.id, 30),
  ]);

  const days = groupByDay(workouts, (workout) => new Date(workout.created_at));

  return (
    <>
      <Link
        href="/challenges"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted transition hover:text-white"
      >
        ← All challenges
      </Link>

      <PageHeader
        title={challenge.name}
        subtitle={
          <>
            {shortDate(parseDateOnly(challenge.start_date))} –{" "}
            {shortDate(parseDateOnly(challenge.end_date))}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Pill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Pill>
        <Pill>🔥 {challenge.workouts_per_week}× / week</Pill>
        <Pill>
          📆 {weeks} week{weeks === 1 ? "" : "s"}
        </Pill>
        <Pill>👥 {progress.length} in</Pill>
      </div>

      {challenge.rules ? (
        <section className="mb-8">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
            Rules
          </h2>
          <Card className="whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed text-white/85">
            {challenge.rules}
          </Card>
        </section>
      ) : null}

      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
            Week {weekIndex + 1} of {weeks}
          </h2>
          <span className="text-xs text-muted">
            {shortDate(start)} – {shortDate(new Date(end.getTime() - 1))}
          </span>
        </div>
        <ProgressList rows={progress} />
        <Link
          href={`/progress?challenge=${challenge.id}`}
          className="mt-3 inline-block text-sm font-medium text-lime"
        >
          See every week →
        </Link>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
          Recent proof
        </h2>

        {days.length === 0 ? (
          <Card className="px-6 py-10 text-center text-sm text-muted">
            No workouts logged in this challenge yet.
          </Card>
        ) : (
          <div className="space-y-8">
            {days.map((day) => (
              <div key={day.key}>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
                  {day.label}
                </h3>
                <div className="space-y-4">
                  {day.items.map((workout) => (
                    <WorkoutCard key={workout.id} workout={workout} showChallenge={false} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
