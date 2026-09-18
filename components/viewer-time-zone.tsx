"use client";

import { useSyncExternalStore } from "react";

import { timeLabel } from "@/lib/dates";

/* Nothing to subscribe to: a tab's timezone does not change under us. */
const subscribe = () => () => {};
const readViewerZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const readServerZone = () => undefined;

/**
 * The viewer's IANA zone ("Africa/Lagos"), or `undefined` on the server and
 * during hydration.
 *
 * The server has no way to know where you are, so it renders instants in the
 * process (group) zone. `useSyncExternalStore` replays that same value while
 * React hydrates — matching the HTML — then re-renders with the real zone
 * once hydration is done. Reading `Intl` directly during render instead would
 * be a hydration mismatch for anyone outside the server's zone.
 */
export function useViewerTimeZone(): string | undefined {
  return useSyncExternalStore(subscribe, readViewerZone, readServerZone);
}

/** "6:42 pm", in the zone the reader is actually standing in. */
export function LocalTime({ iso }: { iso: string }) {
  const timeZone = useViewerTimeZone();

  return <time dateTime={iso}>{timeLabel(new Date(iso), timeZone)}</time>;
}
