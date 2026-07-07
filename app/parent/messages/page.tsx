import { ChatThread, type ChatMessage } from "@/components/portal/chat";
import { EmptyState, PageTitle } from "@/components/portal/widgets";
import { getProfile } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Messages" };

export default async function ParentMessagesPage() {
  const supabase = await createServerSupabase();
  const me = (await getProfile())!;

  // The tutor (Miss Lewis) is the family's contact person
  const { data: tutor } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("role", ["tutor", "super_admin"])
    .neq("id", me.id)
    .order("role", { ascending: false }) // tutor first if present
    .limit(1)
    .maybeSingle();

  if (!tutor) {
    return (
      <>
        <PageTitle title="Messages 💌" />
        <EmptyState title="No tutor to message yet" hint="Check back once your tutor is set up." />
      </>
    );
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .or(
      `and(sender_id.eq.${me.id},recipient_id.eq.${tutor.id}),and(sender_id.eq.${tutor.id},recipient_id.eq.${me.id})`,
    )
    .order("created_at")
    .limit(200);

  return (
    <>
      <PageTitle title="Messages 💌" sub={`Your direct line to ${tutor.full_name || "Miss Lewis"}.`} />
      <ChatThread
        meId={me.id}
        otherId={tutor.id}
        otherName={tutor.full_name || "Miss Lewis"}
        messages={(messages ?? []) as ChatMessage[]}
      />
    </>
  );
}
