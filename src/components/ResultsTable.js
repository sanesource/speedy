import { useMemo, useState } from "react";

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

// Mobile Card Component
function ResultCard({ result, isWinner, winners }) {
  const isDownloadWinner = winners.download?.userId === result.userId;
  const isUploadWinner = winners.upload?.userId === result.userId;
  const isPingWinner = winners.ping?.userId === result.userId;

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-md dark:border-gray-700 dark:bg-gray-800">
      {isWinner && (
        <div className="absolute right-0 top-0">
          <div className="relative overflow-hidden rounded-bl-xl bg-gradient-to-br from-amber-400 to-orange-500 px-3 py-1">
            <span className="relative z-10 text-xs font-bold text-white">
              👑 Fastest
            </span>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white shadow-md">
          {result.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-base font-bold text-gray-900 dark:text-gray-100">
            {result.username}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimestamp(result.testedAt)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div
          className={`flex flex-col items-center rounded-lg p-3 ${
            isDownloadWinner
              ? "bg-gradient-to-br from-blue-50 to-blue-100 ring-2 ring-blue-500 dark:from-blue-950 dark:to-blue-900 dark:ring-blue-400"
              : "bg-gray-50 dark:bg-gray-900"
          }`}
        >
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`h-4 w-4 ${
                isDownloadWinner
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            {isDownloadWinner && <span className="text-xs">🏆</span>}
          </div>
          <span
            className={`mt-1 text-lg font-bold tabular-nums ${
              isDownloadWinner
                ? "text-blue-700 dark:text-blue-300"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {result.downloadSpeed?.toFixed(1) ?? "—"}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Mbps ↓
          </span>
        </div>

        <div
          className={`flex flex-col items-center rounded-lg p-3 ${
            isUploadWinner
              ? "bg-gradient-to-br from-purple-50 to-purple-100 ring-2 ring-purple-500 dark:from-purple-950 dark:to-purple-900 dark:ring-purple-400"
              : "bg-gray-50 dark:bg-gray-900"
          }`}
        >
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`h-4 w-4 ${
                isUploadWinner
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            {isUploadWinner && <span className="text-xs">🏆</span>}
          </div>
          <span
            className={`mt-1 text-lg font-bold tabular-nums ${
              isUploadWinner
                ? "text-purple-700 dark:text-purple-300"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {result.uploadSpeed?.toFixed(1) ?? "—"}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Mbps ↑
          </span>
        </div>

        <div
          className={`flex flex-col items-center rounded-lg p-3 ${
            isPingWinner
              ? "bg-gradient-to-br from-emerald-50 to-emerald-100 ring-2 ring-emerald-500 dark:from-emerald-950 dark:to-emerald-900 dark:ring-emerald-400"
              : "bg-gray-50 dark:bg-gray-900"
          }`}
        >
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`h-4 w-4 ${
                isPingWinner
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {isPingWinner && <span className="text-xs">🏆</span>}
          </div>
          <span
            className={`mt-1 text-lg font-bold tabular-nums ${
              isPingWinner
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {result.ping?.toFixed(0) ?? "—"}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">ms</span>
        </div>
      </div>
    </div>
  );
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
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "table"

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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-2xl border border-gray-200/60 bg-white/90 p-4 shadow-2xl backdrop-blur-2xl dark:border-gray-800/60 dark:bg-gray-900/90 sm:gap-6 sm:rounded-3xl sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-6 w-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
              Test Results
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {enrichedResults.length} participant
              {enrichedResults.length !== 1 ? "s" : ""} tested
            </p>
          </div>
        </div>

        {/* View Toggle - Hidden on mobile, shown on tablet+ */}
        <div className="hidden sm:flex items-center gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <button
            onClick={() => setViewMode("cards")}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-all ${
              viewMode === "cards"
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-all ${
              viewMode === "table"
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Winners Banner */}
      {enrichedResults.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 ring-2 ring-amber-200 dark:from-amber-950 dark:to-orange-950 dark:ring-amber-800 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏆</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Category Winners
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Download
                </p>
                {winners.download ? (
                  <>
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">
                      {winners.download.username}
                    </p>
                    <p className="text-xs font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                      {winners.download.downloadSpeed.toFixed(1)} Mbps
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">—</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 text-purple-600 dark:text-purple-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Upload
                </p>
                {winners.upload ? (
                  <>
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">
                      {winners.upload.username}
                    </p>
                    <p className="text-xs font-semibold tabular-nums text-purple-600 dark:text-purple-400">
                      {winners.upload.uploadSpeed.toFixed(1)} Mbps
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">—</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Best Ping
                </p>
                {winners.ping ? (
                  <>
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">
                      {winners.ping.username}
                    </p>
                    <p className="text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {Math.round(winners.ping.ping)} ms
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">—</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {enrichedResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-12 dark:border-gray-700 dark:bg-gray-800/40">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-16 w-16 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-center">
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">
              No results yet
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Waiting for participants to complete the test
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile: Always Cards, Desktop: Toggle */}
          <div className="sm:hidden">
            <div className="grid gap-4">
              {enrichedResults.map((result) => (
                <ResultCard
                  key={result.userId}
                  result={result}
                  isWinner={result.downloadSpeed === maxDownload}
                  winners={winners}
                />
              ))}
            </div>
          </div>

          {/* Desktop: Cards or Table based on toggle */}
          <div className="hidden sm:block">
            {viewMode === "cards" ? (
              <div className="grid gap-4 md:grid-cols-2">
                {enrichedResults.map((result) => (
                  <ResultCard
                    key={result.userId}
                    result={result}
                    isWinner={result.downloadSpeed === maxDownload}
                    winners={winners}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Participant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Download
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Upload
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Ping
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Completed
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                      {enrichedResults.map((result) => {
                        const isBest = result.downloadSpeed === maxDownload;
                        return (
                          <tr
                            key={result.userId}
                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                                  {result.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {result.username}
                                  </p>
                                  {isBest && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                      <span>👑</span> Fastest
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                              {result.downloadSpeed?.toFixed(1) ?? "—"}{" "}
                              <span className="text-xs font-normal text-gray-500">
                                Mbps
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                              {result.uploadSpeed?.toFixed(1) ?? "—"}{" "}
                              <span className="text-xs font-normal text-gray-500">
                                Mbps
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                              {result.ping?.toFixed(0) ?? "—"}{" "}
                              <span className="text-xs font-normal text-gray-500">
                                ms
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {formatTimestamp(result.testedAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Actions Footer */}
      <footer className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={isRestarting || !isAdmin ? undefined : onRestart}
            disabled={!isAdmin || isRestarting}
            aria-busy={isRestarting}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:hover:scale-100 dark:disabled:from-gray-700 dark:disabled:to-gray-800"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative flex items-center justify-center gap-2">
              {isRestarting ? (
                <LoadingIndicator label="Restarting..." />
              ) : isAdmin ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                  Run New Test
                </>
              ) : (
                "Waiting for admin"
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={isLeaving ? undefined : onExit}
            disabled={isLeaving}
            aria-busy={isLeaving}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-gray-500/30 active:scale-95 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {isLeaving ? (
              <LoadingIndicator label="Leaving..." />
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                Exit Room
              </>
            )}
          </button>
        </div>
        {!isPersisted && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full border-2 border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 shadow-sm dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-3.5 w-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            In-Memory Mode
          </span>
        )}
      </footer>
    </div>
  );
}
