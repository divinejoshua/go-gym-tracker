"use client";

import { useActionState, useState } from "react";

import { createChallenge } from "@/app/actions";
import { emptyFormState } from "@/lib/form-state";
import { ErrorBanner, primaryButtonClass } from "@/components/ui";

const fieldClass =
  "w-full rounded-lg border border-border bg-input px-4 py-3 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30";

const labelClass = "mb-2 block text-sm font-semibold";

/** Inline message under a field, tied to the input via aria-describedby. */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-destructive">
      {message}
    </p>
  );
}

/** Red ring on the offending input so the eye lands on it straight away. */
function fieldStyle(invalid: boolean) {
  return invalid ? `${fieldClass} border-destructive` : fieldClass;
}

/** Today and four weeks out, as sensible date-input defaults. */
function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  // Built from local parts on purpose: toISOString() converts to UTC, which
  // lands on the wrong day either side of midnight depending on the timezone.
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function ChallengeForm() {
  const [state, formAction, pending] = useActionState(createChallenge, emptyFormState);
  const errors = state.fieldErrors ?? {};

  // Row identity lives in state so removing a middle row doesn't shuffle the
  // values of the rows below it.
  const [rows, setRows] = useState(() => [0, 1, 2]);
  const [nextId, setNextId] = useState(3);

  function addRow() {
    setRows((current) => [...current, nextId]);
    setNextId((id) => id + 1);
  }

  function removeRow(id: number) {
    setRows((current) => (current.length === 1 ? current : current.filter((r) => r !== id)));
  }

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="name" className={labelClass}>
          Challenge name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Summer Shred 2026"
          className={fieldStyle(Boolean(errors.name))}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          required
        />
        <FieldError id="name-error" message={errors.name} />
      </div>

      <div>
        <label htmlFor="workouts_per_week" className={labelClass}>
          Workouts per week
        </label>
        <input
          id="workouts_per_week"
          name="workouts_per_week"
          type="number"
          min={1}
          max={14}
          defaultValue={4}
          inputMode="numeric"
          className={fieldStyle(Boolean(errors.workouts_per_week))}
          aria-invalid={Boolean(errors.workouts_per_week)}
          aria-describedby={
            errors.workouts_per_week ? "workouts-error" : undefined
          }
          required
        />
        <FieldError id="workouts-error" message={errors.workouts_per_week} />
        <p className="mt-2 text-xs text-muted-foreground">
          Miss the target in a week and you go broke.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="start_date" className={labelClass}>
            Starts
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            defaultValue={isoDate()}
            className={fieldStyle(Boolean(errors.start_date))}
            aria-invalid={Boolean(errors.start_date)}
            required
          />
          <FieldError id="start-error" message={errors.start_date} />
        </div>
        <div>
          <label htmlFor="end_date" className={labelClass}>
            Ends
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            defaultValue={isoDate(27)}
            className={fieldStyle(Boolean(errors.end_date))}
            aria-invalid={Boolean(errors.end_date)}
            required
          />
          <FieldError id="end-error" message={errors.end_date} />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>Who&rsquo;s in?</legend>
        <div className="space-y-2">
          {rows.map((id, index) => (
            <div key={id} className="flex gap-2">
              <input
                name="participant"
                type="text"
                placeholder={`Person ${index + 1}`}
                aria-label={`Participant ${index + 1}`}
                className={fieldStyle(Boolean(errors.participant))}
                aria-invalid={Boolean(errors.participant)}
                // Only the first row is mandatory — the rest are spare slots,
                // and the action ignores any left blank.
                required={index === 0}
              />
              <button
                type="button"
                onClick={() => removeRow(id)}
                aria-label={`Remove participant ${index + 1}`}
                disabled={rows.length === 1}
                className="shrink-0 rounded-xl border border-border bg-card px-4 text-muted-foreground transition hover:text-destructive disabled:opacity-30"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <FieldError id="participant-error" message={errors.participant} />
        <button
          type="button"
          onClick={addRow}
          className="mt-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:border-primary/50 hover:text-primary-foreground"
        >
          + Add another person
        </button>
      </fieldset>

      <div>
        <label htmlFor="rules" className={labelClass}>
          Rules
        </label>
        <textarea
          id="rules"
          name="rules"
          rows={5}
          placeholder={
            "£20 into the pot for every week you miss.\nProof must be posted the same day.\nRest days don't count."
          }
          className={`${fieldClass} resize-y`}
        />
      </div>

      {state.error ? (
        <ErrorBanner>{state.error}</ErrorBanner>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={`${primaryButtonClass} w-full py-4 text-base`}
      >
        {pending ? "Creating…" : "Create challenge"}
      </button>
    </form>
  );
}
