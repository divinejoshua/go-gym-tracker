/**
 * Shared shape for Server Action results.
 *
 * This lives outside `app/actions.ts` on purpose: a `"use server"` module may
 * only export async functions, so exporting `emptyFormState` from there fails
 * the build with "A 'use server' file can only export async functions".
 */
export type FormState = { error: string | null };

export const emptyFormState: FormState = { error: null };
