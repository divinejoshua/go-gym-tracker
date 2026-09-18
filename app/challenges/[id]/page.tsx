import Link from "next/link";
import { notFound } from "next/navigation";

import { FeedDays } from "@/components/feed-days";
import { ProgressList } from "@/components/progress-list";
import { Card, PageHeader, Pill } from "@/components/ui";
import {
  challengeStatus,
  currentWeekIndex,
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

const STATUS_TONE = {
  active: "primary",
  upcoming: "neutral",
  finished: "destructive",
} as const;
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

  return (
    <>
      <Link
        href="/challenges"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
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
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Rules
          </h2>
          <Card className="whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed text-foreground/85">
            {challenge.rules}
          </Card>
        </section>
      ) : null}

      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Week {weekIndex + 1} of {weeks}
          </h2>
          <span className="text-xs text-muted-foreground">
            {shortDate(start)} – {shortDate(new Date(end.getTime() - 1))}
          </span>
        </div>
        <ProgressList rows={progress} />
        <Link
          href={`/progress?challenge=${challenge.id}`}
          className="mt-3 inline-block text-sm font-medium text-primary-foreground"
        >
          See every week →
        </Link>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Recent proof
        </h2>

        {workouts.length === 0 ? (
          <Card className="px-6 py-10 text-center text-sm text-muted-foreground">
            No workouts logged in this challenge yet.
          </Card>
        ) : (
          <FeedDays variant="challenge" workouts={workouts} />
        )}
      </section>
    </>
  );
}
