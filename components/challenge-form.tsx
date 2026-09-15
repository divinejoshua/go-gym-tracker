"use client";

import { useActionState, useState } from "react";

import { createChallenge, emptyFormState } from "@/app/actions";

const fieldClass =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-base outline-none transition focus:border-lime/60";

const labelClass = "mb-2 block text-sm font-semibold";

/** Today and four weeks out, as sensible date-input defaults. */
function isoDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function ChallengeForm() {
  const [state, formAction, pending] = useActionState(createChallenge, emptyFormState);

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
          className={fieldClass}
          required
        />
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
          className={fieldClass}
          required
        />
        <p className="mt-2 text-xs text-muted">
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
            className={fieldClass}
            required
          />
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
            className={fieldClass}
            required
          />
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
                className={fieldClass}
              />
              <button
                type="button"
                onClick={() => removeRow(id)}
                aria-label={`Remove participant ${index + 1}`}
                disabled={rows.length === 1}
                className="shrink-0 rounded-xl border border-line bg-surface px-4 text-muted transition hover:text-broke disabled:opacity-30"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="mt-2 rounded-xl border border-dashed border-line px-4 py-2.5 text-sm font-medium text-muted transition hover:border-lime/50 hover:text-lime"
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
        <p
          role="alert"
          className="rounded-xl border border-broke/40 bg-broke/10 px-4 py-3 text-sm text-broke"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-lime py-4 text-base font-bold text-ink transition active:scale-[0.99] disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create challenge"}
      </button>
    </form>
  );
}
