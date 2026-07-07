"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { markThreadRead, sendMessage } from "@/app/actions/messages";
import { Button, Card, Textarea } from "@/components/ui";

export type ChatMessage = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export function ChatThread({
  meId,
  otherId,
  otherName,
  messages,
}: {
  meId: string;
  otherId: string;
  otherName: string;
  messages: ChatMessage[];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markThreadRead(otherId);
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [otherId, messages.length]);

  async function send() {
    if (!body.trim()) return;
    setBusy(true);
    const res = await sendMessage(otherId, body);
    if (res.ok) {
      setBody("");
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <Card className="flex h-[65vh] flex-col p-4">
      <div className="flex-1 space-y-3 overflow-y-auto p-1">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-ink-soft">
            Say hi to {otherName} — this is the very start of your chat! 👋
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === meId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-sm ${
                  mine
                    ? "rounded-br-md bg-navy text-white"
                    : "rounded-bl-md bg-pastel-blue text-navy"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className={`mt-1 text-[10px] font-bold ${mine ? "text-white/60" : "text-ink-soft"}`}>
                  {new Date(m.created_at).toLocaleString("en-ZA", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="mt-3 flex items-end gap-2 border-t border-line pt-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={`Message ${otherName}…`}
          className="min-h-12 flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <Button onClick={send} disabled={busy || !body.trim()}>
          Send 💌
        </Button>
      </div>
    </Card>
  );
}
