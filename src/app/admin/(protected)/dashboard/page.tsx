export const dynamic = "force-dynamic";

import { adminDb } from "@/lib/firebase/admin";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DeleteEventButton } from "./DeleteEventButton";
import { ToggleOpenButton } from "./ToggleOpenButton";
import { QRModal } from "./QRModal";

async function getAllEvents() {
  const snapshot = await adminDb
    .collection("events")
    .orderBy("createdAt", "desc")
    .get();

  return Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const votesSnap = await adminDb
        .collection("votes")
        .where("eventId", "==", doc.id)
        .get();
      return {
        id: doc.id,
        title: data.title,
        isOpen: data.isOpen,
        choices: data.choices ?? [],
        createdAt: data.createdAt?.toDate().toISOString() ?? "",
        voteCount: votesSnap.size,
      };
    })
  );
}

export default async function DashboardPage() {
  const events = await getAllEvents();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">イベント一覧</h1>
        <Link href="/admin/events/new">
          <Button>+ 新規イベント作成</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>イベントがまだありません</p>
          <Link href="/admin/events/new" className="mt-4 inline-block text-indigo-600 hover:underline text-sm">
            最初のイベントを作成する →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">タイトル</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">状態</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">投票数</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">選択肢</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {event.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        event.isOpen
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {event.isOpen ? "受付中" : "締切"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{event.voteCount}票</td>
                  <td className="px-4 py-3 text-gray-600">{event.choices.length}件</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/results/${event.id}`} className="text-xs text-gray-500 hover:text-indigo-600">
                        結果
                      </Link>
                      <Link href={`/vote/${event.id}`} className="text-xs text-gray-500 hover:text-indigo-600">
                        投票
                      </Link>
                      <QRModal eventId={event.id} eventTitle={event.title} />
                      <ToggleOpenButton eventId={event.id} isOpen={event.isOpen} />
                      <DeleteEventButton eventId={event.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
