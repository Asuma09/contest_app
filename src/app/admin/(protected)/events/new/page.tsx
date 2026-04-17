import { AdminEventForm } from "@/components/AdminEventForm";

export default function NewEventPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新規イベント作成</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <AdminEventForm mode="create" />
      </div>
    </div>
  );
}
