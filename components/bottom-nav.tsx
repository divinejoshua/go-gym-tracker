"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Feed", icon: "M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/challenges", label: "Challenges", icon: "M7 4h10v3a5 5 0 0 1-10 0zM5 5h2v2a3 3 0 0 1-2-2m12 0h2a3 3 0 0 1-2 2zM9 13h6v2H9zm-2 4h10v3H7z" },
  { href: "/post", label: "Post", icon: "", primary: true },
  { href: "/progress", label: "Progress", icon: "M4 19h16v2H4zm2-7h3v6H6zm5-6h3v12h-3zm5 3h3v9h-3z" },
  { href: "/admin", label: "Admin", icon: "M12 2 4 6v6c0 4.4 3.4 8.6 8 10 4.6-1.4 8-5.6 8-10V6zm0 5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5m0 6c2 0 4 1 4 2.3V16H8v-.7c0-1.3 2-2.3 4-2.3" },
];

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
                  className="mx-auto flex h-13 w-13 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:brightness-95 active:scale-95"
                >
                  <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
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
                className={`flex flex-col items-center gap-1 rounded-md py-1.5 text-[11px] font-medium transition ${
                  active
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path fill="currentColor" d={tab.icon} />
                </svg>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
