"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addSlot, toggleSlot } from "@/app/actions/tutor";
import { Button, Card, Field, Input, Select } from "@/components/ui";

type Slot = { id: string; weekday: number; start_time: string; mode: string; active: boolean };

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AvailabilityEditor({ slots }: { slots: Slot[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ weekday: "1", time: "14:00", mode: "both" });
  const [msg, setMsg] = useState<string | null>(null);

  async function toggle(slot: Slot) {
    setBusyId(slot.id);
    await toggleSlot(slot.id, !slot.active);
    setBusyId(null);
    router.refresh();
  }

  async function add() {
    setMsg(null);
    const res = await addSlot(Number(draft.weekday), draft.time, draft.mode);
    if (!res.ok) setMsg(res.error);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {[1, 2, 3, 4, 5, 6, 0].map((day) => {
          const daySlots = slots.filter((s) => s.weekday === day);
          if (!daySlots.length) return null;
          return (
            <Card key={day} className="p-4">
              <p className="mb-2 font-display font-bold">{DAYS[day]}</p>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggle(s)}
                    disabled={busyId === s.id}
                    className={`squash rounded-full border-2 px-4 py-1.5 text-sm font-bold ${
                      s.active
                        ? "border-navy bg-grass text-white"
                        : "border-line bg-cream text-ink-soft line-through"
                    }`}
                    title={s.active ? "Click to switch off" : "Click to switch on"}
                  >
                    {s.start_time.slice(0, 5)}
                    {s.mode !== "both" && (s.mode === "online" ? " 💻" : " 🏡")}
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
        <p className="text-xs text-ink-soft">
          💡 Green = bookable. Click a time to switch it on or off — existing bookings stay put.
        </p>
      </div>

      <Card className="h-fit p-5">
        <h2 className="mb-3 font-display font-bold text-lg">Add a slot ➕</h2>
        <div className="space-y-3">
          <Field label="Day">
            <Select value={draft.weekday} onChange={(e) => setDraft({ ...draft, weekday: e.target.value })}>
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <option key={d} value={d}>
                  {DAYS[d]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Start time">
            <Input type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
          </Field>
          <Field label="Mode">
            <Select value={draft.mode} onChange={(e) => setDraft({ ...draft, mode: e.target.value })}>
              <option value="both">🏡 + 💻 Both</option>
              <option value="in_person">🏡 In person only</option>
              <option value="online">💻 Online only</option>
            </Select>
          </Field>
          {msg && <p className="rounded-xl bg-pastel-pink px-3 py-2 text-xs font-bold text-coral-deep">{msg}</p>}
          <Button onClick={add} className="w-full">
            Add slot
          </Button>
        </div>
      </Card>
    </div>
  );
}
