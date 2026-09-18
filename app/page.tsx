import { FeedDays } from "@/components/feed-days";
import { EmptyState, PageHeader, SetupNotice } from "@/components/ui";
import { WorkoutCard } from "@/components/workout-card";
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
        <p className="mb-5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary-foreground">
          Logged it. That one is in the books 💪
        </p>
      ) : null}

      {workouts.length === 0 ? (
        <EmptyState
          title="The feed is empty"
          body="Nobody has posted proof yet. Be the one who sets the standard."
          cta={{ href: "/post", label: "Post a workout" }}
        />
      ) : (
        <FeedDays
          variant="feed"
          items={workouts.map((workout) => ({
            id: workout.id,
            createdAt: workout.created_at,
            card: <WorkoutCard workout={workout} />,
          }))}
        />
      )}
    </>
  );
}
