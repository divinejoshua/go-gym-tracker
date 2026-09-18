import "server-only";

import { getSupabase } from "@/lib/supabase";
import { weekRange } from "@/lib/dates";
import type { Challenge, FeedWorkout, Participant, Workout } from "@/lib/types";

/** Supabase returns embedded rows as nested objects; unwrap them into flat fields. */
type WorkoutWithNames = Workout & {
  participant: { name: string } | null;
  challenge: { name: string } | null;
};

function flatten(row: WorkoutWithNames): FeedWorkout {
  const { participant, challenge, ...workout } = row;
  return {
    ...workout,
    participant_name: participant?.name ?? "Unknown",
    challenge_name: challenge?.name ?? "Unknown challenge",
  };
}

export async function getChallenges(): Promise<Challenge[]> {
  const { data, error } = await getSupabase()
    .from("gogym_challenges")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) throw new Error(`Could not load challenges: ${error.message}`);
  return data ?? [];
}

export async function getChallenge(id: string): Promise<Challenge | null> {
  const { data, error } = await getSupabase()
    .from("gogym_challenges")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Could not load challenge: ${error.message}`);
  return data;
}

export async function getParticipants(
  challengeId: string,
): Promise<Participant[]> {
  const { data, error } = await getSupabase()
    .from("gogym_participants")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("name");

  if (error) throw new Error(`Could not load participants: ${error.message}`);
  return data ?? [];
}

/** One screenful of feed. Most cards carry a photo or an autoplaying video, so
 *  this is as much as a phone on mobile data wants in one go. */
export const FEED_PAGE_SIZE = 20;

/**
 * Where the previous page stopped.
 *
 * `created_at` alone will not do: backfilled workouts are all written at
 * midday, so a whole group of them shares one timestamp to the microsecond.
 * Paging on the timestamp alone would skip every row after the first at that
 * instant. The id breaks the tie.
 */
export type FeedCursor = { createdAt: string; id: string };

export type FeedPage = {
  workouts: FeedWorkout[];
  /** Null once the last page has been served. */
  nextCursor: FeedCursor | null;
  /**
   * Every workout there is. Only counted on the first page — PostgREST counts
   * what the cursor filter left behind, which on later pages is the number of
   * rows still to come, not the total. Null once paging has started.
   */
  total: number | null;
};

/*
 * A cursor makes a round trip through the browser before it lands in a
 * PostgREST filter string, where a comma or a quote would let the caller
 * rewrite the query. Both halves are matched against a fixed shape and
 * rejected outright rather than escaped.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

function checkedCursor(cursor: FeedCursor | null | undefined): FeedCursor | null {
  if (!cursor) return null;
  if (!UUID.test(cursor.id) || !TIMESTAMP.test(cursor.createdAt)) {
    throw new Error("Could not load the feed: malformed cursor");
  }
  return cursor;
}

/** Newest workouts across every challenge — the home feed, one page at a time. */
export async function getFeed(
  cursor?: FeedCursor | null,
  pageSize = FEED_PAGE_SIZE,
): Promise<FeedPage> {
  const after = checkedCursor(cursor);

  let query = getSupabase()
    .from("gogym_workouts")
    .select(
      "*, participant:gogym_participants(name), challenge:gogym_challenges(name)",
      after ? {} : { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    // One row past the page: the cheapest way to learn whether more exist.
    .limit(pageSize + 1);

  if (after) {
    query = query.or(
      `created_at.lt."${after.createdAt}",` +
        `and(created_at.eq."${after.createdAt}",id.lt.${after.id})`,
    );
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`Could not load the feed: ${error.message}`);

  const rows = (data ?? []) as WorkoutWithNames[];
  const workouts = rows.slice(0, pageSize).map(flatten);
  const last = workouts.at(-1);

  return {
    workouts,
    nextCursor:
      rows.length > pageSize && last
        ? { createdAt: last.created_at, id: last.id }
        : null,
    total: after ? null : (count ?? workouts.length),
  };
}

export async function getChallengeFeed(
  challengeId: string,
  limit = 100,
): Promise<FeedWorkout[]> {
  const { data, error } = await getSupabase()
    .from("gogym_workouts")
    .select("*, participant:gogym_participants(name), challenge:gogym_challenges(name)")
    .eq("challenge_id", challengeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Could not load the feed: ${error.message}`);
  return ((data ?? []) as WorkoutWithNames[]).map(flatten);
}

export type ParticipantWeek = {
  participant: Participant;
  done: number;
  target: number;
  workouts: Workout[];
};

/**
 * Everyone in a challenge with what they logged during one challenge week,
 * ordered by who is furthest ahead. Powers the "Eric (2/4)" scoreboard.
 */
export async function getWeeklyProgress(
  challenge: Challenge,
  weekIndex: number,
): Promise<ParticipantWeek[]> {
  const { start, end } = weekRange(challenge.start_date, weekIndex);
  const supabase = getSupabase();

  const [participantsResult, workoutsResult] = await Promise.all([
    supabase
      .from("gogym_participants")
      .select("*")
      .eq("challenge_id", challenge.id)
      .order("name"),
    supabase
      .from("gogym_workouts")
      .select("*")
      .eq("challenge_id", challenge.id)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString())
      .order("created_at", { ascending: false }),
  ]);

  if (participantsResult.error) {
    throw new Error(
      `Could not load participants: ${participantsResult.error.message}`,
    );
  }
  if (workoutsResult.error) {
    throw new Error(`Could not load workouts: ${workoutsResult.error.message}`);
  }

  const byParticipant = new Map<string, Workout[]>();
  for (const workout of workoutsResult.data ?? []) {
    const existing = byParticipant.get(workout.participant_id);
    if (existing) existing.push(workout);
    else byParticipant.set(workout.participant_id, [workout]);
  }

  return (participantsResult.data ?? [])
    .map((participant) => ({
      participant,
      done: byParticipant.get(participant.id)?.length ?? 0,
      target: challenge.workouts_per_week,
      workouts: byParticipant.get(participant.id) ?? [],
    }))
    .sort(
      (a, b) =>
        b.done - a.done || a.participant.name.localeCompare(b.participant.name),
    );
}

/** Every participant across every challenge — the post form filters client-side. */
export async function getAllParticipants(): Promise<Participant[]> {
  const { data, error } = await getSupabase()
    .from("gogym_participants")
    .select("*")
    .order("name");

  if (error) throw new Error(`Could not load participants: ${error.message}`);
  return data ?? [];
}
