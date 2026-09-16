"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "Feed",
    icon: "M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1z",
  },
  {
    href: "/challenges",
    label: "Challenges",
    icon: "M7 4h10v3a5 5 0 0 1-10 0zM5 5h2v2a3 3 0 0 1-2-2m12 0h2a3 3 0 0 1-2 2zM9 13h6v2H9zm-2 4h10v3H7z",
  },
  { href: "/post", label: "Post", icon: "", primary: true },
  {
    href: "/progress",
    label: "Progress",
    icon: "M4 13h3v7H4zM10.5 8h3v12h-3zM17 4h3v16h-3z",
  },
  {
    href: "/admin",
    label: "New challenge",
    icon: "M12 2 4 6v6c0 4.4 3.4 8.6 8 10 4.6-1.4 8-5.6 8-10V6zm0 5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5m0 6c2 0 4 1 4 2.3V16H8v-.7c0-1.3 2-2.3 4-2.3",
  },
];

/**
 * Outline when you're elsewhere, solid when you're here. Colour alone was too
 * easy to miss, and the filled/outline pair is the convention people already
 * read on a bottom tab bar.
 */
function TabIcon({ path, active }: { path: string; active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur pb-safe">
      <ul className="mx-auto flex w-full max-w-2xl items-end justify-around px-2 pt-2">
        {TABS.map((tab) => {
          const active = isActive(tab.href);

          if (tab.primary) {
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  aria-label="Post proof of a workout"
                  aria-current={active ? "page" : undefined}
                  // The action button is always filled, so it gets a ring
                  // instead of a fill swap to show you're already on it.
                  className={`mx-auto flex h-13 w-13 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:brightness-95 active:scale-95 ${
                    active ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : ""
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-7 w-7 transition-transform ${active ? "rotate-45" : ""}`}
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M12 5a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 1 1 0-2h5V6a1 1 0 0 1 1-1"
                    />
                  </svg>
                </Link>
              </li>
            );
          }

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-md py-1.5 text-[11px] transition ${
                  active
                    ? "font-semibold text-primary-foreground"
                    : "font-medium text-muted-foreground hover:text-foreground"
                }`}
              >
                <TabIcon path={tab.icon} active={active} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
