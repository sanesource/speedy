import { useMemo } from "react";

function LoadingIndicator({ label }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <span
        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

const columns = [
  { id: "username", label: "Participant" },
  { id: "downloadSpeed", label: "Download (Mbps)" },
  { id: "uploadSpeed", label: "Upload (Mbps)" },
  { id: "ping", label: "Ping (ms)" },
  { id: "testedAt", label: "Completed" },
];

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function ResultsTable({
  results = [],
  participants = [],
  maxDownload,
  onRestart,
  onExit,
  isAdmin,
  isPersisted,
  isRestarting,
  isLeaving,
}) {
  const enrichedResults = useMemo(() => {
    const participantMap = Object.fromEntries(
      participants.map((participant) => [participant.userId, participant])
    );
    return results.map((result) => ({
      ...result,
      username:
        participantMap[result.userId]?.username ??
        result.username ??
        result.userId,
    }));
  }, [results, participants]);
  const data = enrichedResults;

  const winners = useMemo(() => {
    if (!enrichedResults || enrichedResults.length === 0) {
      return { download: null, upload: null, ping: null };
    }
    let download = null;
    let upload = null;
    let ping = null;
    for (const entry of enrichedResults) {
      const d = Number(entry.downloadSpeed);
      const u = Number(entry.uploadSpeed);
      const p = Number(entry.ping);
      if (
        Number.isFinite(d) &&
        (download === null || d > download.downloadSpeed)
      ) {
        download = entry;
      }
      if (Number.isFinite(u) && (upload === null || u > upload.uploadSpeed)) {
        upload = entry;
      }
      if (Number.isFinite(p) && (ping === null || p < ping.ping)) {
        ping = entry;
      }
    }
    return { download, upload, ping };
  }, [enrichedResults]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-none border border-black/5 bg-white/80 p-4 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-black/40 sm:gap-6 sm:rounded-none sm:p-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 sm:text-2xl">
          Results
        </h2>
      </header>

      <div className="overflow-x-auto rounded-none border border-gray-200 shadow-sm dark:border-gray-700 sm:rounded-none">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:px-4 sm:py-3"
                >
                  <div className="flex items-center gap-1">
                    <span className="truncate">{column.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {data.map((result) => {
              const isBest = result.downloadSpeed === maxDownload;
              return (
                <tr
                  key={result.userId}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <td className="px-2 py-2 text-xs font-medium text-gray-900 dark:text-gray-100 sm:px-4 sm:py-3 sm:text-sm">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <span className="truncate max-w-[80px] sm:max-w-none">
                        {result.username}
                      </span>
                      {isBest ? (
                        <span className="rounded-none bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200 sm:px-2 sm:text-xs">
                          Fastest
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-700 dark:text-gray-200 sm:px-4 sm:py-3 sm:text-sm">
                    <span className="font-medium">
                      {result.downloadSpeed?.toFixed(1) ?? "—"}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-700 dark:text-gray-200 sm:px-4 sm:py-3 sm:text-sm">
                    <span className="font-medium">
                      {result.uploadSpeed?.toFixed(1) ?? "—"}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-700 dark:text-gray-200 sm:px-4 sm:py-3 sm:text-sm">
                    {result.ping?.toFixed(0) ?? "—"}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-700 dark:text-gray-200 sm:px-4 sm:py-3 sm:text-sm">
                    <span className="block sm:hidden">
                      {formatTimestamp(result.testedAt).slice(0, 5)}
                    </span>
                    <span className="hidden sm:block">
                      {formatTimestamp(result.testedAt)}
                    </span>
                  </td>
                </tr>
              );
            })}
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400 sm:py-10 sm:text-sm"
                >
                  Awaiting results from participants…
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid gap-2 rounded-none border border-gray-200 bg-white p-3 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 sm:mt-4 sm:p-4 sm:text-sm">
        <div className="font-semibold text-gray-900 dark:text-gray-100">
          🏆 Category Winners
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">🚀 Download:</span>
            {winners.download ? (
              <span className="whitespace-nowrap">
                {winners.download.username} (
                {(winners.download.downloadSpeed ?? 0).toFixed(1)} Mbps)
              </span>
            ) : (
              <span>—</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">📤 Upload:</span>
            {winners.upload ? (
              <span className="whitespace-nowrap">
                {winners.upload.username} (
                {(winners.upload.uploadSpeed ?? 0).toFixed(1)} Mbps)
              </span>
            ) : (
              <span>—</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">⏱️ Ping:</span>
            {winners.ping ? (
              <span className="whitespace-nowrap">
                {winners.ping.username} ({Math.round(winners.ping.ping ?? 0)}{" "}
                ms)
              </span>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
      </div>

      <footer className="flex flex-col gap-2 text-xs text-gray-600 dark:text-gray-400 sm:gap-3 sm:text-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={isRestarting || !isAdmin ? undefined : onRestart}
            disabled={!isAdmin || isRestarting}
            aria-busy={isRestarting}
            className="cursor-pointer rounded-none bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-200 disabled:text-blue-400 sm:px-4 sm:py-3 sm:text-sm"
          >
            {isRestarting ? (
              <LoadingIndicator label="Restarting" />
            ) : isAdmin ? (
              "Run New Test"
            ) : (
              "Waiting for admin"
            )}
          </button>
          <button
            type="button"
            onClick={isLeaving ? undefined : onExit}
            disabled={isLeaving}
            aria-busy={isLeaving}
            className="cursor-pointer rounded-none border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 sm:px-4 sm:py-3 sm:text-sm"
          >
            {isLeaving ? <LoadingIndicator label="Leaving" /> : "Exit Room"}
          </button>
          {!isPersisted ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200 sm:px-3 sm:text-xs">
              In-memory mode
            </span>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
