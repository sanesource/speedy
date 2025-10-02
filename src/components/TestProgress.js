const METRIC_COPY = {
  download: "Measuring download speed",
  upload: "Measuring upload speed",
  latency: "Capturing latency",
  ping: "Collecting ping",
};

export default function TestProgress({
  participants,
  statusMessage,
  remainingSeconds,
}) {
  const normalizedTime = Math.max(
    0,
    Math.min(100, ((20 - Math.max(0, remainingSeconds)) / 20) * 100)
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-2xl border border-black/5 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-emerald-500/20 p-4 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:from-blue-500/10 dark:via-purple-500/5 dark:to-emerald-500/10 sm:gap-6 sm:rounded-3xl sm:p-6">
      <header className="flex flex-col gap-1 text-center sm:gap-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 sm:text-2xl">
          Speed Test Running
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
          Running server-side speed test for all {participants.length}{" "}
          participants.
        </p>
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-200 sm:text-sm">
          {statusMessage || "Running Ookla speed test"}
        </p>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Estimated time remaining: {Math.max(0, remainingSeconds)}s
        </p>
      </header>

      <div className="flex flex-col items-center gap-4 sm:gap-6">
        <div className="relative h-24 w-24 sm:h-32 sm:w-32">
          <svg
            className="h-24 w-24 transform -rotate-90 sm:h-32 sm:w-32"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${
                2 * Math.PI * 40 * (1 - normalizedTime / 100)
              }`}
              className="text-blue-500 transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
              {Math.round(normalizedTime)}%
            </span>
          </div>
        </div>

        <div className="grid gap-2 text-center sm:gap-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">
            Participants ({participants.length})
          </h3>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {participants.map((participant) => (
              <span
                key={participant.userId}
                className="rounded-full bg-white/50 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-white/10 dark:text-gray-300 sm:px-3 sm:py-1 sm:text-sm"
              >
                {participant.username}
              </span>
            ))}
          </div>
        </div>
      </div>

      <footer className="text-center text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
        We&apos;ll display comparative results as soon as the test completes.
      </footer>
    </div>
  );
}
