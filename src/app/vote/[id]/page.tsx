export const dynamic = "force-dynamic";

import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import { VoteForm } from "@/components/VoteForm";
import Link from "next/link";

async function getEvent(id: string) {
  const doc = await adminDb.collection("events").doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    choices: data.choices,
    isOpen: data.isOpen,
  };
}

export default async function VotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-lg mx-auto px-5 py-4">
          <Link href={`/event/${id}`} className="text-sm text-gray-400 hover:text-gray-600">
            ← イベントページへ
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h1>
        {event.description && (
          <p className="text-sm text-gray-400 mb-6">{event.description}</p>
        )}

        {!event.isOpen ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium mb-4">この投票は締め切られています</p>
            <Link
              href={`/results/${event.id}`}
              className="text-sm text-gray-900 underline underline-offset-2"
            >
              結果を見る
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">1つ選んで投票してください</p>
            <VoteForm eventId={event.id} choices={event.choices} />
          </>
        )}
      </main>
    </div>
  );
}
