import Link from "next/link";

import { Card, EmptyState, PageHeader, Pill, SetupNotice } from "@/components/ui";
import { challengeStatus, parseDateOnly, shortDate, totalWeeks } from "@/lib/dates";
import { getAllParticipants, getChallenges } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const STATUS_TONE = {
  active: "lime",
  upcoming: "neutral",
  finished: "broke",
} as const;

const STATUS_LABEL = {
  active: "Active",
  upcoming: "Not started",
  finished: "Finished",
} as const;

export default async function ChallengesPage() {
  if (!isSupabaseConfigured) {
    return (
      <>
        <PageHeader title="Challenges" />
        <SetupNotice />
      </>
    );
  }

  const [challenges, participants] = await Promise.all([
    getChallenges(),
    getAllParticipants(),
  ]);

  const counts = new Map<string, number>();
  for (const participant of participants) {
    counts.set(participant.challenge_id, (counts.get(participant.challenge_id) ?? 0) + 1);
  }

  return (
    <>
      <PageHeader
        title="Challenges"
        subtitle={`${challenges.length} in total`}
        action={
          <Link
            href="/admin"
            className="shrink-0 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink transition active:scale-95"
          >
            New
          </Link>
        }
      />

      {challenges.length === 0 ? (
        <EmptyState
          title="No challenges yet"
          body="Set one up, add your friends, and agree on what happens when someone goes broke."
          cta={{ href: "/admin", label: "Create a challenge" }}
        />
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => {
            const status = challengeStatus(challenge.start_date, challenge.end_date);
            const weeks = totalWeeks(challenge.start_date, challenge.end_date);

            return (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`} className="block">
                <Card className="px-4 py-4 transition active:scale-[0.99]">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 text-lg font-bold">{challenge.name}</h2>
                    <Pill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Pill>
                  </div>

                  <p className="mt-1 text-sm text-muted">
                    {shortDate(parseDateOnly(challenge.start_date))} –{" "}
                    {shortDate(parseDateOnly(challenge.end_date))}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill>🔥 {challenge.workouts_per_week}× / week</Pill>
                    <Pill>📆 {weeks} week{weeks === 1 ? "" : "s"}</Pill>
                    <Pill>👥 {counts.get(challenge.id) ?? 0}</Pill>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
