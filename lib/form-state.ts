/**
 * Shared shape for Server Action results.
 *
 * This lives outside `app/actions.ts` on purpose: a `"use server"` module may
 * only export async functions, so exporting `emptyFormState` from there fails
 * the build with "A 'use server' file can only export async functions".
 */
export type FormState = {
  /** Summary shown at the end of the form. */
  error: string | null;
  /** Per-field messages, keyed by the input's `name`. */
  fieldErrors?: Record<string, string>;
};

export const emptyFormState: FormState = { error: null };
