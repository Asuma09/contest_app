"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChoiceEditor } from "@/components/ChoiceEditor";
import { ScheduleEditor } from "@/components/ScheduleEditor";
import { Button } from "@/components/ui/Button";
import type { Event } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface AdminEventFormProps {
  mode: "create" | "edit";
  event?: Event;
}

export function AdminEventForm({ mode, event }: AdminEventFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [organizer, setOrganizer] = useState(event?.organizer ?? "");
  const [venue, setVenue] = useState(event?.venue ?? "");
  const [schedule, setSchedule] = useState(event?.schedule ?? []);
  const [choices, setChoices] = useState(
    event?.choices ?? [
      { id: uuidv4(), text: "" },
      { id: uuidv4(), text: "" },
    ]
  );
  const [closedAt, setClosedAt] = useState(
    event?.closedAt ? event.closedAt.slice(0, 16) : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validChoices = choices.filter((c) => c.text.trim());
    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    if (validChoices.length < 2) {
      setError("選択肢は2つ以上必要です");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        title,
        description,
        organizer,
        venue,
        schedule: schedule.filter((s) => s.description.trim()),
        choices: validChoices,
        closedAt: closedAt || null,
      };

      const res = await fetch(
        mode === "create" ? "/api/admin/events" : `/api/admin/events/${event?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "保存に失敗しました");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">基本情報</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            イベント名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 第1回プログラミングコンテスト"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            イベント概要（任意）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="イベントの詳細・説明を入力してください"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              主催者（任意）
            </label>
            <input
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="例: ○○実行委員会"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              会場（任意）
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="例: ○○ホール"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            投票締切日時（任意）
          </label>
          <input
            type="datetime-local"
            value={closedAt}
            onChange={(e) => setClosedAt(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* タイムスケジュール */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">タイムスケジュール</h3>
        <ScheduleEditor items={schedule} onChange={setSchedule} />
      </div>

      {/* 投票選択肢 */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          投票選択肢 <span className="text-red-500">*</span>
        </h3>
        <ChoiceEditor choices={choices} onChange={setChoices} />
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={submitting} size="lg">
          {mode === "create" ? "イベントを作成" : "変更を保存"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => router.back()}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
