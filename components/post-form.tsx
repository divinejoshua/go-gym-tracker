"use client";

import { useMemo, useState, useTransition } from "react";

import { CameraCapture, type Capture } from "@/components/camera-capture";
import { ErrorBanner, primaryButtonClass } from "@/components/ui";
import { logWorkout } from "@/app/actions";
import { uploadProof } from "@/lib/upload";
import { DURATIONS, WORKOUT_TYPES, type Challenge, type Participant } from "@/lib/types";

const fieldClass =
  "w-full rounded-lg border border-border bg-input px-4 py-3 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30";

const labelClass = "mb-2 block text-sm font-semibold";

export function PostForm({
  challenges,
  participants,
}: {
  challenges: Challenge[];
  participants: Participant[];
}) {
  const [challengeId, setChallengeId] = useState(challenges[0]?.id ?? "");
  const [capture, setCapture] = useState<Capture | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const roster = useMemo(
    () => participants.filter((p) => p.challenge_id === challengeId),
    [participants, challengeId],
  );

  const busy = uploading || pending;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    if (!capture) {
      setError("Capture a photo or video first — that's the whole point.");
      return;
    }

    let mediaUrl: string;
    setUploading(true);
    try {
      mediaUrl = await uploadProof(capture.file);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
      return;
    } finally {
      setUploading(false);
    }

    formData.set("media_url", mediaUrl);
    formData.set("media_type", capture.type);

    startTransition(async () => {
      // On success the action redirects, so anything returned is an error.
      const result = await logWorkout({ error: null }, formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section>
        <h2 className={labelClass}>Proof</h2>
        <CameraCapture onCapture={setCapture} />
      </section>

      <div>
        <label htmlFor="challenge_id" className={labelClass}>
          Challenge
        </label>
        <select
          id="challenge_id"
          name="challenge_id"
          value={challengeId}
          onChange={(event) => setChallengeId(event.target.value)}
          className={fieldClass}
          required
        >
          {challenges.map((challenge) => (
            <option key={challenge.id} value={challenge.id}>
              {challenge.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="participant_id" className={labelClass}>
          Who are you?
        </label>
        <select
          id="participant_id"
          name="participant_id"
          className={fieldClass}
          defaultValue=""
          required
          key={challengeId}
        >
          <option value="" disabled>
            Select your name
          </option>
          {roster.map((participant) => (
            <option key={participant.id} value={participant.id}>
              {participant.name}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className={labelClass}>Type of workout</legend>
        <div className="grid grid-cols-2 gap-2">
          {WORKOUT_TYPES.map((type, index) => (
            <label
              key={type.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary-foreground"
            >
              <input
                type="radio"
                name="workout_type"
                value={type.value}
                defaultChecked={index === 0}
                className="sr-only"
                required
              />
              <span aria-hidden="true">{type.emoji}</span>
              {type.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClass}>How long?</legend>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((duration, index) => (
            <label
              key={duration.value}
              className="cursor-pointer rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary-foreground"
            >
              <input
                type="radio"
                name="duration"
                value={duration.value}
                defaultChecked={index === 0}
                className="sr-only"
                required
              />
              {duration.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="venue" className={labelClass}>
          Gym or venue
        </label>
        <input
          id="venue"
          name="venue"
          type="text"
          placeholder="PureGym Stratford"
          className={fieldClass}
          required
        />
      </div>

      <div>
        <label htmlFor="routine" className={labelClass}>
          Workout routine
        </label>
        <textarea
          id="routine"
          name="routine"
          rows={5}
          placeholder={"Bench 4x8\nIncline DB press 3x10\nCable flies 3x12"}
          className={`${fieldClass} resize-y`}
        />
      </div>

      {error ? (
        <ErrorBanner>{error}</ErrorBanner>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className={`${primaryButtonClass} w-full py-4 text-base`}
      >
        {uploading ? "Uploading proof…" : pending ? "Saving…" : "Log this workout"}
      </button>
    </form>
  );
}
