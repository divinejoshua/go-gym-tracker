import { ChallengeForm } from "@/components/challenge-form";
import { PageHeader, SetupNotice } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase";

export const metadata = { title: "New challenge · Go Gym or Go Broke" };

export default function AdminPage() {
  return (
    <>
      <PageHeader
        title="New challenge"
        subtitle="Set the target, add the crew, agree the forfeit."
      />
      {isSupabaseConfigured ? <ChallengeForm /> : <SetupNotice />}
    </>
  );
}
