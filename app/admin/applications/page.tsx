import { EmptyState, PageTitle } from "@/components/portal/widgets";
import { createServerSupabase } from "@/lib/supabase/server";
import { ApplicationList } from "./application-list";

export const metadata = { title: "Tutor applications" };

export default async function ApplicationsPage() {
  const supabase = await createServerSupabase();
  const { data: applications } = await supabase
    .from("tutor_applications")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageTitle
        title="Tutor applications 🧑‍🏫"
        sub="Evaluate, book an interview, approve — approved applicants become tutors the moment they sign up with that email."
      />
      {applications?.length ? (
        <ApplicationList applications={applications} />
      ) : (
        <EmptyState
          title="No applications yet"
          hint="Hopefuls apply at /become-a-tutor — you'll get a notification the second one lands."
        />
      )}
    </>
  );
}
