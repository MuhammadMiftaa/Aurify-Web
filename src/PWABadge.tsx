import { useState, useEffect } from "react";
// @ts-expect-error — virtual module provided by vite-plugin-pwa at build time
import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * PWABadge — shows offline-ready / update-available toasts
 * and an offline banner when the network drops.
 */
function PWABadge() {
  const period = 60 * 60 * 1000; // check for updates every hour

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl: string, r: ServiceWorkerRegistration | undefined) {
      if (period <= 0 || !r) return;
      setInterval(async () => {
        if ("onLine" in navigator && !navigator.onLine) return;
        const resp = await fetch(swUrl, {
          cache: "no-store",
          headers: { "cache-control": "no-cache" },
        });
        if (resp?.status === 200) await r.update();
      }, period);
    },
    onRegisterError(error: Error) {
      console.error("SW registration error", error);
    },
  });

  // Online/offline tracking
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Keep banner briefly so user sees "back online"
      setTimeout(() => setShowOfflineBanner(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      setIsOnline(false);
      setShowOfflineBanner(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function close() {
    setOfflineReady(false);
    setNeedRefresh(false);
  }

  return (
    <>
      {/* Offline Banner — top of screen */}
      {showOfflineBanner && !isOnline && (
        <div className="fixed inset-x-0 top-0 z-9999 flex items-center justify-between bg-amber-500 px-4 py-2 text-white shadow-lg animate-fade-in-up">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
              <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0122.56 9" />
              <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
              <path d="M8.53 16.11a6 6 0 016.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
            <span className="text-sm font-medium">
              Offline — using cached data
            </span>
          </div>
          <button
            onClick={() => setShowOfflineBanner(false)}
            className="rounded-full p-1 transition-colors hover:bg-amber-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Back Online Banner */}
      {isOnline && showOfflineBanner && (
        <div className="fixed inset-x-0 top-0 z-9999 flex items-center justify-between bg-green-500 px-4 py-2 text-white shadow-lg animate-fade-in-up">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.55a11 11 0 0114.08 0" />
              <path d="M1.42 9a16 16 0 0121.16 0" />
              <path d="M8.53 16.11a6 6 0 016.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
            <span className="text-sm font-medium">
              Connection restored — you&apos;re back online
            </span>
          </div>
          <button
            onClick={() => setShowOfflineBanner(false)}
            className="rounded-full p-1 transition-colors hover:bg-green-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* PWA Update / Offline-Ready Toast */}
      {(offlineReady || needRefresh) && (
        <div className="fixed right-4 bottom-4 left-4 z-9999 rounded-xl border border-(--border) bg-(--card) p-4 shadow-2xl sm:left-auto sm:w-96 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <div
              className={`rounded-full p-2 ${needRefresh ? "bg-blue-500/10" : "bg-green-500/10"}`}
            >
              {needRefresh ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-(--foreground)">
                {offlineReady ? "Ready for offline" : "Update available"}
              </p>
              <p className="mt-1 text-sm text-(--muted-foreground)">
                {offlineReady
                  ? "App can be used without an internet connection."
                  : "A new version is available. Reload to update."}
              </p>
            </div>
            <button
              onClick={close}
              className="rounded-full p-1 text-(--muted-foreground) transition-colors hover:text-(--foreground)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            {needRefresh && (
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold-btn px-4 py-2.5 text-sm font-semibold text-dark transition-all hover:opacity-90"
                onClick={() => updateServiceWorker(true)}
              >
                Reload
              </button>
            )}
            <button
              className={`${needRefresh ? "flex-1" : "w-full"} rounded-lg border border-(--border) bg-(--secondary) px-4 py-2.5 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--muted)`}
              onClick={close}
            >
              {needRefresh ? "Later" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PWABadge;
