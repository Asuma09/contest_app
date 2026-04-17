"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("このイベントを削除しますか？投票データも全て削除されます。")) return;
    setLoading(true);
    await fetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button variant="danger" size="sm" loading={loading} onClick={handleDelete}>
      削除
    </Button>
  );
}
