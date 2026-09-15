import { PostForm } from "@/components/post-form";
import { EmptyState, PageHeader, SetupNotice } from "@/components/ui";
import { getAllParticipants, getChallenges } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function PostPage() {
  if (!isSupabaseConfigured) {
    return (
      <>
        <PageHeader title="Post proof" />
        <SetupNotice />
      </>
    );
  }

  const [challenges, participants] = await Promise.all([
    getChallenges(),
    getAllParticipants(),
  ]);

  return (
    <>
      <PageHeader
        title="Post proof"
        subtitle="Live camera only. No camera roll, no cheating."
      />

      {challenges.length === 0 ? (
        <EmptyState
          title="No challenge to post to"
          body="Someone needs to create a challenge before workouts can be logged."
          cta={{ href: "/admin", label: "Create a challenge" }}
        />
      ) : (
        <PostForm challenges={challenges} participants={participants} />
      )}
    </>
  );
}
