"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <span className="text-xs text-gray-400">10秒ごとに自動更新</span>
  );
}
