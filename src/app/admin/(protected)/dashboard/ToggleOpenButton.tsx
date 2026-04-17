"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ToggleOpenButton({ eventId, isOpen }: { eventId: string; isOpen: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await fetch(`/api/admin/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: !isOpen }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button variant="secondary" size="sm" loading={loading} onClick={handleToggle}>
      {isOpen ? "締切る" : "再開する"}
    </Button>
  );
}
