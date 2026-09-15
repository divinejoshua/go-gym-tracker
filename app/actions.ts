"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSupabase } from "@/lib/supabase";
import type { FormState } from "@/lib/form-state";
import {
  DURATIONS,
  WORKOUT_TYPES,
  type Duration,
  type WorkoutType,
} from "@/lib/types";

const WORKOUT_TYPE_VALUES = WORKOUT_TYPES.map((t) => t.value) as string[];
const DURATION_VALUES = DURATIONS.map((d) => d.value) as string[];

function text(formData: FormData, key: string): string {
  return (formData.get(key) ?? "").toString().trim();
}

export async function createChallenge(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = text(formData, "name");
  const rules = text(formData, "rules");
  const startDate = text(formData, "start_date");
  const endDate = text(formData, "end_date");
  const workoutsPerWeek = Number(text(formData, "workouts_per_week"));

  // Blank rows are expected — the form starts with a few empty name inputs.
  const names = formData
    .getAll("participant")
    .map((value) => value.toString().trim())
    .filter(Boolean);

  // Collect every problem in one pass so the form can mark all the bad fields
  // at once, rather than making someone resubmit to discover the next one.
  const fieldErrors: Record<string, string> = {};

  if (!name) fieldErrors.name = "Give the challenge a name.";

  // Number("") is 0, which passes isInteger — so test the raw string first,
  // otherwise a blank field reports the range message instead of "missing".
  if (!text(formData, "workouts_per_week")) {
    fieldErrors.workouts_per_week = "Enter how many workouts a week.";
  } else if (!Number.isInteger(workoutsPerWeek)) {
    fieldErrors.workouts_per_week = "That needs to be a whole number.";
  } else if (workoutsPerWeek < 1 || workoutsPerWeek > 14) {
    fieldErrors.workouts_per_week = "Pick a number between 1 and 14.";
  }

  if (!startDate) fieldErrors.start_date = "Pick a start date.";
  if (!endDate) fieldErrors.end_date = "Pick an end date.";
  if (startDate && endDate && endDate < startDate) {
    fieldErrors.end_date = "The end date must come after the start date.";
  }

  const deduped = [...new Set(names.map((n) => n.replace(/\s+/g, " ")))];

  if (names.length === 0) {
    fieldErrors.participant = "Add at least one person to the challenge.";
  } else if (deduped.length !== names.length) {
    fieldErrors.participant = "Two people have the same name — make them unique.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Some details are missing. Check the fields below.", fieldErrors };
  }

  const supabase = getSupabase();

  const { data: challenge, error: challengeError } = await supabase
    .from("gogym_challenges")
    .insert({
      name,
      rules,
      start_date: startDate,
      end_date: endDate,
      workouts_per_week: workoutsPerWeek,
    })
    .select("id")
    .single();

  if (challengeError || !challenge) {
    return { error: challengeError?.message ?? "Could not create the challenge." };
  }

  const { error: participantsError } = await supabase.from("gogym_participants").insert(
    deduped.map((participantName) => ({
      challenge_id: challenge.id,
      name: participantName,
    })),
  );

  if (participantsError) {
    // Roll back so we never leave a challenge with nobody in it.
    await supabase.from("gogym_challenges").delete().eq("id", challenge.id);
    return { error: `Could not add the people: ${participantsError.message}` };
  }

  revalidatePath("/");
  revalidatePath("/challenges");
  revalidatePath("/progress");

  // `redirect` throws to unwind, so it must sit outside any try/catch.
  redirect(`/challenges/${challenge.id}`);
}

/**
 * Records a workout. The media is uploaded first via /api/upload — videos are
 * far too big to push through a Server Action body — so this only receives the
 * resulting public URL.
 */
export async function logWorkout(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const challengeId = text(formData, "challenge_id");
  const participantId = text(formData, "participant_id");
  const mediaUrl = text(formData, "media_url");
  const mediaType = text(formData, "media_type");
  const workoutType = text(formData, "workout_type");
  const duration = text(formData, "duration");
  const routine = text(formData, "routine");
  const venue = text(formData, "venue");

  if (!challengeId) return { error: "Pick a challenge." };
  if (!participantId) return { error: "Select your name." };
  if (!mediaUrl) return { error: "Capture a photo or video first." };
  if (mediaType !== "image" && mediaType !== "video") {
    return { error: "That proof file is not a photo or a video." };
  }
  if (!WORKOUT_TYPE_VALUES.includes(workoutType)) {
    return { error: "Pick the type of workout." };
  }
  if (!DURATION_VALUES.includes(duration)) {
    return { error: "Pick how long you trained for." };
  }
  if (!venue) return { error: "Add the name of the gym or venue." };

  const { error } = await getSupabase().from("gogym_workouts").insert({
    challenge_id: challengeId,
    participant_id: participantId,
    media_url: mediaUrl,
    media_type: mediaType,
    workout_type: workoutType as WorkoutType,
    duration: duration as Duration,
    routine,
    venue,
  });

  if (error) return { error: `Could not save your workout: ${error.message}` };

  revalidatePath("/");
  revalidatePath("/progress");
  revalidatePath(`/challenges/${challengeId}`);

  redirect("/?posted=1");
}
