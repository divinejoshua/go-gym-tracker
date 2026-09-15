import Link from "next/link";

import { ProgressList } from "@/components/progress-list";
import { Card, EmptyState, PageHeader, SetupNotice } from "@/components/ui";
import {
  currentWeekIndex,
  parseDateOnly,
  shortDate,
  totalWeeks,
  weekRange,
} from "@/lib/dates";
import { getChallenges, getWeeklyProgress } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ProgressPage({ searchParams }: PageProps<"/progress">) {
  if (!isSupabaseConfigured) {
    return (
      <>
        <PageHeader title="This week" />
        <SetupNotice />
      </>
    );
  }

  const [query, challenges] = await Promise.all([searchParams, getChallenges()]);

  if (challenges.length === 0) {
    return (
      <>
        <PageHeader title="This week" />
        <EmptyState
          title="Nothing to track yet"
          body="Create a challenge and add your friends to start counting workouts."
          cta={{ href: "/admin", label: "Create a challenge" }}
        />
      </>
    );
  }

  const requestedId = typeof query.challenge === "string" ? query.challenge : null;
  const challenge = challenges.find((c) => c.id === requestedId) ?? challenges[0];

  const weeks = totalWeeks(challenge.start_date, challenge.end_date);
  const thisWeek = currentWeekIndex(challenge.start_date, challenge.end_date);

  const requestedWeek = Number(query.week);
  const weekIndex =
    Number.isInteger(requestedWeek) && requestedWeek >= 1 && requestedWeek <= weeks
      ? requestedWeek - 1
      : thisWeek;

  const { start, end } = weekRange(challenge.start_date, weekIndex);
  const progress = await getWeeklyProgress(challenge, weekIndex);

  const hit = progress.filter((row) => row.done >= row.target).length;
  const weekHref = (week: number) =>
    `/progress?challenge=${challenge.id}&week=${week}`;

  return (
    <>
      <PageHeader
        title="Scoreboard"
        subtitle={`${hit} of ${progress.length} on track this week`}
      />

      {challenges.length > 1 ? (
        // Horizontal scroll keeps a long list of challenges off a second line.
        <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
          <div className="flex w-max gap-2">
            {challenges.map((option) => (
              <Link
                key={option.id}
                href={`/progress?challenge=${option.id}`}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                  option.id === challenge.id
                    ? "border-primary bg-primary/10 text-primary-foreground"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {option.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <Card className="mb-4 flex items-center justify-between gap-2 px-2 py-2">
        <WeekArrow
          href={weekHref(weekIndex)}
          disabled={weekIndex === 0}
          label="Previous week"
          glyph="←"
        />

        <div className="text-center">
          <p className="text-sm font-bold">
            Week {weekIndex + 1}{" "}
            <span className="font-normal text-muted-foreground">of {weeks}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {shortDate(start)} – {shortDate(new Date(end.getTime() - 1))}
            {weekIndex === thisWeek ? " · now" : ""}
          </p>
        </div>

        <WeekArrow
          href={weekHref(weekIndex + 2)}
          disabled={weekIndex >= weeks - 1}
          label="Next week"
          glyph="→"
        />
      </Card>

      <ProgressList rows={progress} />

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Target is {challenge.workouts_per_week} workout
        {challenge.workouts_per_week === 1 ? "" : "s"} a week, from{" "}
        {shortDate(parseDateOnly(challenge.start_date))} to{" "}
        {shortDate(parseDateOnly(challenge.end_date))}.
      </p>
    </>
  );
}

function WeekArrow({
  href,
  disabled,
  label,
  glyph,
}: {
  href: string;
  disabled: boolean;
  label: string;
  glyph: string;
}) {
  if (disabled) {
    return (
      <span
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground opacity-30"
      >
        {glyph}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      {glyph}
    </Link>
  );
}
