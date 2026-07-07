import Link from "next/link";
import { ChatThread, type ChatMessage } from "@/components/portal/chat";
import { EmptyState, PageTitle } from "@/components/portal/widgets";
import { Card, Chip } from "@/components/ui";
import { getProfile } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Messages" };

export default async function TutorMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>;
}) {
  const supabase = await createServerSupabase();
  const me = (await getProfile())!;
  const { with: withId } = await searchParams;

  // every parent I could talk to, plus unread counts
  const [{ data: parents }, { data: unread }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").eq("role", "parent").order("full_name"),
    supabase.from("messages").select("sender_id").eq("recipient_id", me.id).is("read_at", null),
  ]);

  const unreadBy = new Map<string, number>();
  for (const m of unread ?? []) unreadBy.set(m.sender_id, (unreadBy.get(m.sender_id) ?? 0) + 1);

  const active = (parents ?? []).find((p) => p.id === withId) ?? (parents ?? [])[0];

  const { data: messages } = active
    ? await supabase
        .from("messages")
        .select("id, sender_id, body, created_at")
        .or(
          `and(sender_id.eq.${me.id},recipient_id.eq.${active.id}),and(sender_id.eq.${active.id},recipient_id.eq.${me.id})`,
        )
        .order("created_at")
        .limit(200)
    : { data: [] };

  return (
    <>
      <PageTitle title="Messages 💌" sub="Chats with your families." />
      {!parents?.length ? (
        <EmptyState title="No parents yet" hint="Once families sign up you can chat with them here." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <Card className="h-fit p-3">
            {parents.map((p) => (
              <Link
                key={p.id}
                href={`/tutor/messages?with=${p.id}`}
                className={`flex items-center justify-between gap-2 rounded-2xl px-3 py-2.5 font-display text-sm font-bold ${
                  active?.id === p.id ? "bg-navy text-white" : "text-navy hover:bg-navy/8"
                }`}
              >
                <span className="truncate">{p.full_name || "Parent"}</span>
                {unreadBy.get(p.id) ? <Chip tone="coral">{unreadBy.get(p.id)}</Chip> : null}
              </Link>
            ))}
          </Card>
          {active && (
            <ChatThread
              meId={me.id}
              otherId={active.id}
              otherName={active.full_name || "Parent"}
              messages={(messages ?? []) as ChatMessage[]}
            />
          )}
        </div>
      )}
    </>
  );
}
