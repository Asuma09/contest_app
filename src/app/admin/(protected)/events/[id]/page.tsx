export const dynamic = "force-dynamic";

import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import { AdminEventForm } from "@/components/AdminEventForm";
import { ResultsChart } from "@/components/ResultsChart";
import { QRCodeDisplay } from "@/components/QRCode";
import type { Event, VoteCount } from "@/types";
import Link from "next/link";
import { headers } from "next/headers";

async function getEventWithResults(id: string) {
  const doc = await adminDb.collection("events").doc(id).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  const votesSnap = await adminDb.collection("votes").where("eventId", "==", id).get();

  const countMap: Record<string, number> = {};
  votesSnap.docs.forEach((v) => {
    const choiceId = v.data().choiceId;
    countMap[choiceId] = (countMap[choiceId] ?? 0) + 1;
  });

  const voteCounts: VoteCount[] = (data.choices ?? []).map(
    (c: { id: string; text: string }) => ({
      choiceId: c.id,
      choiceText: c.text,
      count: countMap[c.id] ?? 0,
    })
  );

  const event: Event = {
    id: doc.id,
    title: data.title,
    description: data.description ?? "",
    organizer: data.organizer ?? "",
    venue: data.venue ?? "",
    schedule: data.schedule ?? [],
    choices: data.choices,
    isOpen: data.isOpen,
    createdAt: data.createdAt?.toDate().toISOString() ?? "",
    closedAt: data.closedAt?.toDate().toISOString() ?? null,
  };

  return { event, voteCounts, totalVotes: votesSnap.size };
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getEventWithResults(id);
  if (!result) notFound();

  const { event, voteCounts, totalVotes } = result;

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const eventUrl = `${protocol}://${host}/event/${id}`;

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← ダッシュボード
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">イベント編集</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <AdminEventForm mode="edit" event={event} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">投票結果</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {totalVotes === 0 ? (
            <p className="text-gray-400 text-center py-4">まだ投票がありません</p>
          ) : (
            <ResultsChart voteCounts={voteCounts} totalVotes={totalVotes} />
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">QRコード</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-4 text-center">
            参加者にこのQRコードを読み取らせると投票ページに直接アクセスできます
          </p>
          <QRCodeDisplay url={eventUrl} title={event.title} />
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/event/${event.id}`}
          className="text-sm text-indigo-600 hover:underline"
          target="_blank"
        >
          特設ページを開く ↗
        </Link>
        <Link
          href={`/vote/${event.id}`}
          className="text-sm text-indigo-600 hover:underline"
          target="_blank"
        >
          投票ページを開く ↗
        </Link>
        <Link
          href={`/results/${event.id}`}
          className="text-sm text-indigo-600 hover:underline"
          target="_blank"
        >
          結果ページを開く ↗
        </Link>
      </div>
    </div>
  );
}
