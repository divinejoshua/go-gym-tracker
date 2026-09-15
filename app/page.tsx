import { EmptyState, PageHeader, SetupNotice } from "@/components/ui";
import { WorkoutCard } from "@/components/workout-card";
import { groupByDay } from "@/lib/dates";
import { getFeed } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";

// The feed must show what was posted seconds ago, so never serve it prerendered.
export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  if (!isSupabaseConfigured) {
    return (
      <>
        <PageHeader title="Go Gym or Go Broke" />
        <SetupNotice />
      </>
    );
  }

  const [{ posted }, workouts] = await Promise.all([searchParams, getFeed()]);
  const days = groupByDay(workouts, (workout) => new Date(workout.created_at));

  return (
    <>
      <PageHeader
        title="Go Gym or Go Broke"
        subtitle={
          workouts.length > 0
            ? `${workouts.length} workout${workouts.length === 1 ? "" : "s"} logged`
            : "No excuses. Post the proof."
        }
      />

      {posted ? (
        <p className="mb-5 rounded-xl border border-lime/30 bg-lime/10 px-4 py-3 text-sm font-medium text-lime">
          Logged it. That one is in the books 💪
        </p>
      ) : null}

      {days.length === 0 ? (
        <EmptyState
          title="The feed is empty"
          body="Nobody has posted proof yet. Be the one who sets the standard."
          cta={{ href: "/post", label: "Post a workout" }}
        />
      ) : (
        <div className="space-y-8">
          {days.map((day) => (
            <section key={day.key}>
              {/* Sticky so you always know which day you're scrolling through. */}
              <h2 className="sticky top-0 z-10 -mx-4 mb-3 bg-ink/95 px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted backdrop-blur sm:-mx-6 sm:px-6">
                {day.label}
              </h2>
              <div className="space-y-4">
                {day.items.map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
