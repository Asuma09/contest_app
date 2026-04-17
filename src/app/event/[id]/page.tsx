export const dynamic = "force-dynamic";

import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { ScheduleItem } from "@/types";

async function getEvent(id: string) {
  const doc = await adminDb.collection("events").doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data()!;

  const votesSnap = await adminDb
    .collection("votes")
    .where("eventId", "==", id)
    .get();

  return {
    id: doc.id,
    title: data.title ?? "",
    description: data.description ?? "",
    organizer: data.organizer ?? "",
    venue: data.venue ?? "",
    schedule: (data.schedule ?? []) as ScheduleItem[],
    choices: data.choices ?? [],
    isOpen: data.isOpen ?? false,
    closedAt: data.closedAt?.toDate().toISOString() ?? null,
    totalVotes: votesSnap.size,
  };
}

export default async function EventLandingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* ステータスバー */}
      <div className={`w-full py-2 text-center text-xs font-medium tracking-wide ${event.isOpen ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"}`}>
        {event.isOpen ? "投票受付中" : "投票締切"}
      </div>

      <main className="max-w-lg mx-auto px-5 py-8 space-y-8">
        {/* タイトル */}
        <section className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">
            {event.title}
          </h1>
          {event.description && (
            <p className="text-gray-500 text-sm leading-relaxed">{event.description}</p>
          )}
          <div className="flex flex-col gap-1 pt-1">
            {event.organizer && (
              <span className="text-xs text-gray-400">主催: {event.organizer}</span>
            )}
            {event.venue && (
              <span className="text-xs text-gray-400">会場: {event.venue}</span>
            )}
            {event.closedAt && (
              <span className="text-xs text-gray-400">
                締切:{" "}
                {new Date(event.closedAt).toLocaleString("ja-JP", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </section>

        {/* タイムスケジュール */}
        {event.schedule.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              タイムスケジュール
            </h2>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {event.schedule.map((item) => (
                <div key={item.id} className="flex items-start gap-4 px-4 py-3 bg-white">
                  <span className="text-xs font-mono text-gray-400 w-12 shrink-0 pt-0.5">
                    {item.time || "—"}
                  </span>
                  <span className="text-sm text-gray-700">{item.description}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 投票ボタン */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            投票
          </h2>
          <p className="text-xs text-gray-400">{event.choices.length}つの選択肢 · {event.totalVotes}票</p>

          {event.isOpen ? (
            <Link
              href={`/vote/${event.id}`}
              className="block w-full text-center py-4 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 active:bg-gray-800 transition-colors"
            >
              今すぐ投票する
            </Link>
          ) : (
            <div className="w-full text-center py-4 bg-gray-100 text-gray-400 text-sm rounded-xl">
              この投票は締め切られています
            </div>
          )}

          <Link
            href={`/results/${event.id}`}
            className="block w-full text-center py-3 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors"
          >
            結果を見る
          </Link>
        </section>
      </main>

      {event.organizer && (
        <footer className="text-center text-xs text-gray-300 pb-8">
          {event.organizer}
        </footer>
      )}
    </div>
  );
}
