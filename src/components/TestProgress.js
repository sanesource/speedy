const METRIC_COPY = {
  download: "Measuring download speed",
  upload: "Measuring upload speed",
  latency: "Capturing latency",
  ping: "Collecting ping",
};

export default function TestProgress({
  participants,
  progressByUser,
  statusMessage,
  remainingSeconds,
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-3xl border border-black/5 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-emerald-500/20 p-8 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:from-blue-500/10 dark:via-purple-500/5 dark:to-emerald-500/10">
      <header className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Speed Test Running
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sit tight while we measure everyone’s download, upload, latency, and
          ping metrics.
        </p>
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-200">
          {statusMessage || "Synchronizing measurements"}
        </p>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Estimated time remaining: {Math.max(0, remainingSeconds)}s
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {participants.map((participant) => {
          const progress = progressByUser[participant.userId] ?? {
            value: 0,
            metric: "download",
          };
          const normalizedValue = Number.isFinite(progress.value)
            ? progress.value
            : 0;
          const percentage = Math.round(
            normalizedValue > 1
              ? Math.min(normalizedValue, 100)
              : normalizedValue * 100
          );
          const label = METRIC_COPY[progress.metric] ?? "Preparing test";
          return (
            <div
              key={participant.userId}
              className="flex flex-col gap-3 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-white/10"
            >
              <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-100">
                <span>{participant.username}</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <footer className="text-center text-xs text-gray-500 dark:text-gray-400">
        We’ll display comparative results as soon as every participant finishes.
      </footer>
    </div>
  );
}
