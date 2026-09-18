"use client";

import { useEffect, useRef } from "react";

/** Most of the card has to be on screen before it counts as "watching". */
const VISIBLE_RATIO = 0.6;

/**
 * Feed video that plays itself while it is on screen and loops until you
 * scroll past it.
 *
 * Muted is not a style choice: every browser blocks unprompted playback with
 * sound, and a rejected play() would leave a frozen first frame. The controls
 * stay so anyone who wants the gym-floor audio can unmute.
 */
export function FeedVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    /* No IntersectionObserver (old Safari) — fall back to playing on mount. */
    if (typeof IntersectionObserver === "undefined") {
      void video.play().catch(() => {});
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          /* Rejects when the browser still refuses playback or when a fast
             scroll pauses us mid-promise. Neither is worth an unhandled
             rejection in the console. */
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: VISIBLE_RATIO },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      controls
      loop
      muted
      playsInline
      preload="metadata"
      className="h-full w-full object-cover"
    />
  );
}
