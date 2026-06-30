"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createTopicThread, findOrCreateDmThread } from "@/lib/chat";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

type Participant = {
  id: string;
  user_id: string;
  name: string;
};

type Props = {
  userId: string;
  myProfileId: string;
  participants: Participant[];
  initialType: "topic" | "dm";
};

export function NewThreadForm({
  userId,
  myProfileId,
  participants,
  initialType,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [type, setType] = useState<"topic" | "dm">(
    searchParams.get("type") === "dm" ? "dm" : initialType
  );
  const [title, setTitle] = useState("");
  const [otherUserId, setOtherUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const others = participants.filter((p) => p.id !== myProfileId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      if (type === "topic") {
        if (!title.trim()) return;
        const threadId = await createTopicThread(supabase, userId, title);
        router.push(`/event/chat/${threadId}`);
      } else {
        const other = others.find((p) => p.user_id === otherUserId);
        if (!other) return;
        const threadId = await findOrCreateDmThread(
          supabase,
          userId,
          other.user_id,
          other.name
        );
        router.push(`/event/chat/${threadId}`);
      }
    } catch {
      setError("Could not start conversation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card tint="lavender">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 rounded-pill bg-white/60 p-1">
          {(["topic", "dm"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setType(option)}
              className={`flex-1 rounded-pill px-4 py-2 text-body-sm font-semibold ${
                type === option
                  ? "bg-white text-plum-700 shadow-soft"
                  : "text-ink-600"
              }`}
            >
              {option === "topic" ? "Topic thread" : "Direct message"}
            </button>
          ))}
        </div>

        {type === "topic" ? (
          <Input
            label="Topic title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g. "Carpool Saturday morning"'
            required
          />
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="recipient" className="text-label text-ink-600">
              Message
            </label>
            <select
              id="recipient"
              value={otherUserId}
              onChange={(e) => setOtherUserId(e.target.value)}
              required
              className="h-11 w-full rounded-sm border border-ink-300 bg-white px-4 text-body-md text-ink-900"
            >
              <option value="">Choose someone…</option>
              {others.map((p) => (
                <option key={p.user_id} value={p.user_id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="text-body-sm text-error">{error}</p>}
        <Button
          type="submit"
          loading={loading}
          disabled={type === "topic" ? !title.trim() : !otherUserId}
        >
          Start conversation
        </Button>
      </form>
    </Card>
  );
}
