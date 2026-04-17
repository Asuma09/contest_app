export const dynamic = "force-dynamic";

import { adminDb } from "@/lib/firebase/admin";
import Link from "next/link";
import type { Event } from "@/types";

async function getOpenEvents(): Promise<Event[]> {
  const snapshot = await adminDb
    .collection("events")
    .where("isOpen", "==", true)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
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
  });
}

export default async function HomePage() {
  const events = await getOpenEvents();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <span className="font-semibold text-gray-900">投票イベント</span>
          <Link href="/admin/login" className="text-xs text-gray-400 hover:text-gray-600">
            管理者
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          開催中の投票
        </h2>

        {events.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-16">現在開催中の投票はありません</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className="block border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{event.description}</p>
                    )}
                    <p className="text-xs text-gray-300 mt-1">{event.choices.length}つの選択肢</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
