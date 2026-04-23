"use client";

import { useEffect, useState } from "react";

/**
 * Fetches the live weather alert count from the API.
 * Re-fetches every 5 minutes to stay in sync with the alerts page.
 */
export function useWeatherAlertCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const res = await fetch("/api/weather-alert-count");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCount(data.count ?? 0);
      } catch {
        // silently ignore
      }
    };

    fetchCount();

    // Re-fetch every 5 minutes
    const interval = setInterval(fetchCount, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return count;
}
