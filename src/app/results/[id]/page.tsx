export const dynamic = "force-dynamic";

import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import { ResultsChart } from "@/components/ResultsChart";
import { AutoRefresh } from "./AutoRefresh";
import Link from "next/link";
import type { VoteCount } from "@/types";

async function getResults(id: string) {
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

  return {
    id: doc.id,
    title: data.title,
    isOpen: data.isOpen,
    voteCounts,
    totalVotes: votesSnap.size,
  };
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getResults(id);
  if (!result) notFound();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <Link href={`/event/${id}`} className="text-sm text-gray-400 hover:text-gray-600">
            ← イベントページへ
          </Link>
          {result.isOpen && <AutoRefresh />}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-8">
        <div className="flex items-start justify-between gap-3 mb-6">
          <h1 className="text-xl font-bold text-gray-900">{result.title}</h1>
          <span
            className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
              result.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {result.isOpen ? "受付中" : "締切"}
          </span>
        </div>

        {result.totalVotes === 0 ? (
          <p className="text-gray-400 text-sm text-center py-12">まだ投票がありません</p>
        ) : (
          <ResultsChart voteCounts={result.voteCounts} totalVotes={result.totalVotes} />
        )}

        {result.isOpen && (
          <div className="mt-8">
            <Link
              href={`/vote/${result.id}`}
              className="block w-full text-center py-4 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-colors"
            >
              投票する
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
