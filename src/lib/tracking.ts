import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function getSessionId() {
  let sid = sessionStorage.getItem("memoria_session_id");
  if (!sid) {
    sid = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem("memoria_session_id", sid);
  }
  return sid;
}

export function useVisitorTracking() {
  const location = useLocation();
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    const sessionId = getSessionId();

    const track = (duration: number) => {
      fetch("/api/visitor/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          path: location.pathname,
          duration: duration,
          source: document.referrer || "direct",
          device: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
          browser: navigator.userAgent,
        }),
      }).catch(() => {});
    };

    // Track initial page view
    track(0);

    return () => {
      // Track duration on unmount
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0) track(duration);
    };
  }, [location.pathname]);
}