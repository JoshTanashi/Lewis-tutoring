import { EmptyState } from "./widgets";

export type JourneyEvent = {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  emoji: string;
  happened_at: string;
};

const TYPE_COLOR: Record<string, string> = {
  assessment: "var(--color-sky)",
  goal_set: "var(--color-coral)",
  milestone: "var(--color-sunshine)",
  badge: "var(--color-sunshine)",
  test_result: "var(--color-grass)",
  tutor_note: "var(--color-lilac)",
  meeting: "var(--color-sky)",
  certificate: "var(--color-sunshine)",
  enrolled: "var(--color-grass)",
  payment: "var(--color-lilac)",
};

/** The Student Journey Timeline — a living record of every milestone. */
export function JourneyTimeline({ events }: { events: JourneyEvent[] }) {
  if (!events.length) {
    return (
      <EmptyState
        title="The journey starts soon!"
        hint="Every lesson, badge, test and proud moment will appear here."
      />
    );
  }
  return (
    <ol className="relative space-y-5 pl-7">
      <span aria-hidden className="absolute left-2 top-2 bottom-2 w-1.5 rounded-full bg-rainbow" />
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span
            aria-hidden
            className="absolute -left-[26px] top-1 flex size-6 items-center justify-center rounded-full border-2 border-paper text-[11px]"
            style={{ background: TYPE_COLOR[e.type] ?? "var(--color-sky)" }}
          >
            {e.emoji}
          </span>
          <p className="font-display font-bold text-sm leading-snug">{e.title}</p>
          {e.detail && <p className="mt-0.5 text-xs text-ink-soft">{e.detail}</p>}
          <p className="mt-0.5 text-[10px] font-bold text-ink-soft/70">
            {new Date(e.happened_at).toLocaleDateString("en-ZA", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </li>
      ))}
    </ol>
  );
}
