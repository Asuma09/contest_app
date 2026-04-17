"use client";

import { useState } from "react";
import { useFingerprint } from "@/hooks/useFingerprint";
import type { Choice } from "@/types";
import Link from "next/link";

interface VoteFormProps {
  eventId: string;
  choices: Choice[];
}

export function VoteForm({ eventId, choices }: VoteFormProps) {
  const { visitorId, loading: fpLoading } = useFingerprint();
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!selected || !visitorId) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, choiceId: selected, voterToken: visitorId }),
      });

      if (res.status === 409) { setAlreadyVoted(true); return; }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "投票に失敗しました");
        return;
      }
      setDone(true);
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  if (fpLoading) {
    return (
      <div className="flex items-center gap-2 py-10 text-gray-400 text-sm">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
        読み込み中...
      </div>
    );
  }

  if (alreadyVoted) {
    return (
      <div className="py-10 text-center space-y-3">
        <p className="text-gray-600 font-medium">すでに投票済みです</p>
        <Link href={`/results/${eventId}`} className="text-sm text-gray-900 underline underline-offset-2">
          結果を見る
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="py-10 text-center space-y-3">
        <p className="text-gray-900 font-semibold text-lg">投票が完了しました</p>
        <Link href={`/results/${eventId}`} className="text-sm text-gray-900 underline underline-offset-2">
          結果を見る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => setSelected(choice.id)}
          className={`w-full text-left px-4 py-3.5 rounded-xl border transition-colors text-sm ${
            selected === choice.id
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 hover:border-gray-400 text-gray-700"
          }`}
        >
          {choice.text}
        </button>
      ))}

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!selected || submitting}
        className="w-full py-4 mt-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 active:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "送信中..." : "投票する"}
      </button>
    </div>
  );
}
