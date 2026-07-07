import { EmptyState, PageTitle } from "@/components/portal/widgets";
import { Card, Chip } from "@/components/ui";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Audit log" };

const ACTION_TONE = { INSERT: "grass", UPDATE: "sunshine", DELETE: "coral" } as const;

export default async function AuditPage() {
  const supabase = await createServerSupabase();
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, actor, action, table_name, record_id, at")
    .order("at", { ascending: false })
    .limit(100);

  const actorIds = [...new Set((logs ?? []).map((l) => l.actor).filter(Boolean))] as string[];
  const { data: actors } = actorIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", actorIds)
    : { data: [] };
  const nameOf = (id: string | null) =>
    id ? (actors?.find((a) => a.id === id)?.full_name ?? "system") : "system";

  return (
    <>
      <PageTitle
        title="Audit log 🔍"
        sub="Every change to sensitive data — who, what, when. Data you can trust."
      />
      {logs?.length ? (
        <Card className="overflow-x-auto p-2">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-soft">
                <th className="p-3">When</th>
                <th className="p-3">Who</th>
                <th className="p-3">Action</th>
                <th className="p-3">Table</th>
                <th className="p-3">Record</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-line">
                  <td className="p-3 whitespace-nowrap text-ink-soft">
                    {new Date(l.at).toLocaleString("en-ZA", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3 font-bold">{nameOf(l.actor)}</td>
                  <td className="p-3">
                    <Chip tone={ACTION_TONE[l.action as keyof typeof ACTION_TONE] ?? "navy"}>
                      {l.action}
                    </Chip>
                  </td>
                  <td className="p-3">{l.table_name}</td>
                  <td className="p-3 font-mono text-xs text-ink-soft">
                    {l.record_id?.slice(0, 8) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <EmptyState title="Nothing logged yet" hint="Changes to students, invoices, payments and marks land here." />
      )}
    </>
  );
}
