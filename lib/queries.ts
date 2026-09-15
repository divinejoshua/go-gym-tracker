import "server-only";

import { getSupabase } from "@/lib/supabase";
import { weekRange } from "@/lib/dates";
import type { Challenge, FeedWorkout, Participant, Workout } from "@/lib/types";

/** Supabase returns embedded rows as nested objects; unwrap them into flat fields. */
type WorkoutWithNames = Workout & {
  participants: { name: string } | null;
  challenges: { name: string } | null;
};

function flatten(row: WorkoutWithNames): FeedWorkout {
  const { participants, challenges, ...workout } = row;
  return {
    ...workout,
    participant_name: participants?.name ?? "Unknown",
    challenge_name: challenges?.name ?? "Unknown challenge",
  };
}

export async function getChallenges(): Promise<Challenge[]> {
  const { data, error } = await getSupabase()
    .from("challenges")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) throw new Error(`Could not load challenges: ${error.message}`);
  return data ?? [];
}

export async function getChallenge(id: string): Promise<Challenge | null> {
  const { data, error } = await getSupabase()
    .from("challenges")
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
    .from("participants")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("name");

  if (error) throw new Error(`Could not load participants: ${error.message}`);
  return data ?? [];
}

/** Newest workouts across every challenge — the home feed. */
export async function getFeed(limit = 100): Promise<FeedWorkout[]> {
  const { data, error } = await getSupabase()
    .from("workouts")
    .select("*, participants(name), challenges(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Could not load the feed: ${error.message}`);
  return ((data ?? []) as WorkoutWithNames[]).map(flatten);
}

export async function getChallengeFeed(
  challengeId: string,
  limit = 100,
): Promise<FeedWorkout[]> {
  const { data, error } = await getSupabase()
    .from("workouts")
    .select("*, participants(name), challenges(name)")
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
      .from("participants")
      .select("*")
      .eq("challenge_id", challenge.id)
      .order("name"),
    supabase
      .from("workouts")
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
    .from("participants")
    .select("*")
    .order("name");

  if (error) throw new Error(`Could not load participants: ${error.message}`);
  return data ?? [];
}
