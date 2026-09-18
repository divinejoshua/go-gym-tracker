"use client";

import { useEffect, useRef, useState } from "react";

import { loadMoreFeed } from "@/app/actions";
import { FeedDays } from "@/components/feed-days";
import type { FeedPage } from "@/lib/queries";

/** Start fetching this far before the sentinel is actually on screen, so the
 *  next page is usually there by the time you scroll to it. */
const PREFETCH_MARGIN = "600px";

/**
 * The home feed and its infinite scroll.
 *
 * The server renders the first page; a sentinel below the last card asks for
 * the next one as it comes into view. Paging is by cursor, not offset, so a
 * workout posted mid-scroll shifts nothing underneath you.
 */
export function FeedStream({ initialPage }: { initialPage: FeedPage }) {
  const [page, setPage] = useState(initialPage);
  const [workouts, setWorkouts] = useState(initialPage.workouts);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [failed, setFailed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  /* A ref, not state: the observer can fire again before a re-render lands. */
  const loadingRef = useRef(false);
  const [loading, setLoading] = useState(false);

  /* The server sent a fresh feed — someone posted, or this route revalidated.
     Throw away what we had appended and start from the new first page. */
  if (page !== initialPage) {
    setPage(initialPage);
    setWorkouts(initialPage.workouts);
    setCursor(initialPage.nextCursor);
    setFailed(false);
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !cursor || failed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        loadMoreFeed(cursor)
          .then((next) => {
            /* Cursor paging cannot repeat a row, but a retry or a double fire
               could, and React would rather not see two cards with one key. */
            setWorkouts((current) => {
              const seen = new Set(current.map((workout) => workout.id));
              return [...current, ...next.workouts.filter((w) => !seen.has(w.id))];
            });
            setCursor(next.nextCursor);
          })
          .catch(() => setFailed(true))
          .finally(() => {
            loadingRef.current = false;
            setLoading(false);
          });
      },
      { rootMargin: PREFETCH_MARGIN },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor, failed]);

  const retry = () => {
    setFailed(false);
  };

  return (
    <>
      <FeedDays workouts={workouts} variant="feed" />

      {/* Kept in the tree even when there is nothing left to fetch, so the
          observer has something to watch the moment a cursor appears. */}
      <div ref={sentinelRef} aria-hidden="true" className="h-px" />

      <div className="py-8 text-center text-sm text-muted-foreground">
        {failed ? (
          <p>
            Could not load more workouts.{" "}
            <button
              type="button"
              onClick={retry}
              className="font-medium text-primary-foreground underline underline-offset-4"
            >
              Try again
            </button>
          </p>
        ) : loading ? (
          <p role="status">Loading more…</p>
        ) : cursor ? null : workouts.length > 0 ? (
          <p>That&apos;s everything — {workouts.length} workouts.</p>
        ) : null}
      </div>
    </>
  );
}
