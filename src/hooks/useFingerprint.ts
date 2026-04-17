"use client";

import { useState, useEffect } from "react";

export function useFingerprint() {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const FingerprintJS = await import("@fingerprintjs/fingerprintjs");
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        if (!cancelled) setVisitorId(result.visitorId);
      } catch {
        if (!cancelled) setVisitorId("unknown-" + Math.random().toString(36).slice(2));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { visitorId, loading };
}
