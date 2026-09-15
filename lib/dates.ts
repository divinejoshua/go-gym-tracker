const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Everything below runs in the process's own timezone, and mixes two kinds of
 * value: instants (`workouts.created_at`) and date-only values (a challenge's
 * start/end, week boundaries), which are parsed as local midnight.
 *
 * Keeping both in one zone is what makes them comparable, so the group's
 * timezone must be the *process* timezone. In local dev that is already true.
 * In production set the TZ environment variable (e.g. TZ=Europe/London) —
 * hosts default to UTC, which would file a 00:30 workout under yesterday and
 * shift week boundaries by the UTC offset.
 */

/**
 * Parse a Postgres `date` ("2026-09-15") as local midnight.
 * `new Date("2026-09-15")` would parse as UTC and shift the day for anyone
 * west of Greenwich, which would throw the week maths off by one.
 */
export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Total number of challenge weeks, counting a partial final week as a week. */
export function totalWeeks(startDate: string, endDate: string): number {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const days = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  return Math.max(1, Math.ceil(days / 7));
}

/** Half-open [start, end) range for a 0-based challenge week. */
export function weekRange(startDate: string, weekIndex: number) {
  const start = addDays(parseDateOnly(startDate), weekIndex * 7);
  return { start, end: addDays(start, 7) };
}

/**
 * Which challenge week `now` falls in, clamped into the challenge.
 * Before it starts you get week 1; after it ends you get the final week.
 */
export function currentWeekIndex(
  startDate: string,
  endDate: string,
  now: Date = new Date(),
): number {
  const start = parseDateOnly(startDate);
  const elapsedDays = Math.floor(
    (startOfDay(now).getTime() - start.getTime()) / MS_PER_DAY,
  );
  const index = Math.floor(elapsedDays / 7);
  return Math.min(Math.max(index, 0), totalWeeks(startDate, endDate) - 1);
}

export function challengeStatus(
  startDate: string,
  endDate: string,
  now: Date = new Date(),
): "upcoming" | "active" | "finished" {
  const today = startOfDay(now);
  if (today < parseDateOnly(startDate)) return "upcoming";
  if (today > parseDateOnly(endDate)) return "finished";
  return "active";
}

/** Stable YYYY-MM-DD key for grouping timestamps into days. */
export function dayKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** "Today", "Yesterday", or "Monday, 15 September". */
export function dayLabel(date: Date, now: Date = new Date()): string {
  const key = dayKey(date);
  if (key === dayKey(now)) return "Today";
  if (key === dayKey(addDays(now, -1))) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  });
}

/** "6:42 pm" */
export function timeLabel(date: Date): string {
  return date
    .toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
}

/** "15 Sep" */
export function shortDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/**
 * Bucket items into days, newest day first, preserving the order within a day.
 * Used for the dated section headers on the home feed.
 */
export function groupByDay<T>(
  items: T[],
  getDate: (item: T) => Date,
  now: Date = new Date(),
): Array<{ key: string; label: string; items: T[] }> {
  const buckets = new Map<string, T[]>();

  for (const item of items) {
    const key = dayKey(getDate(item));
    const bucket = buckets.get(key);
    if (bucket) bucket.push(item);
    else buckets.set(key, [item]);
  }

  return [...buckets.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, groupItems]) => ({
      key,
      label: dayLabel(getDate(groupItems[0]), now),
      items: groupItems,
    }));
}
