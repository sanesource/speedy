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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 overflow-hidden rounded-2xl border border-gray-200/60 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 shadow-2xl backdrop-blur-2xl dark:border-gray-800/60 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 sm:gap-6 sm:rounded-3xl sm:p-6 lg:p-8">
      {/* Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-400/20 blur-3xl" />
        <div
          className="absolute -bottom-1/4 -right-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-400/20 blur-3xl"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4 sm:gap-6">
        {/* Header */}
        <header className="flex flex-col gap-2 text-center sm:gap-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30 sm:h-20 sm:w-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-8 w-8 animate-pulse text-white sm:h-10 sm:w-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
              Speed Test Running
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
              Testing {participants.length} participant
              {participants.length !== 1 ? "s" : ""} simultaneously
            </p>
          </div>
        </header>

        {/* Progress Circle */}
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <div className="relative">
            {/* SVG Circle Progress */}
            <svg
              className="h-32 w-32 -rotate-90 transform sm:h-40 sm:w-40"
              viewBox="0 0 100 100"
            >
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                strokeWidth="8"
                fill="none"
                className="stroke-gray-200 dark:stroke-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className="stroke-blue-600 dark:stroke-blue-400"
                style={{
                  strokeDasharray: `${2 * Math.PI * 40}`,
                  strokeDashoffset: `${
                    2 * Math.PI * 40 * (1 - normalizedTime / 100)
                  }`,
                  transition: "stroke-dashoffset 0.5s ease",
                }}
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
                {Math.round(normalizedTime)}%
              </span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm">
                Complete
              </span>
            </div>
          </div>

          {/* Timer Card */}
          <div className="flex flex-col items-center gap-2 rounded-xl bg-white/80 px-6 py-4 shadow-lg backdrop-blur-sm dark:bg-gray-800/80 sm:px-8">
            <div className="flex items-center gap-2">
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
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 sm:text-base">
                Time Remaining
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100 sm:text-4xl">
                {Math.max(0, remainingSeconds)}
              </span>
              <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                seconds
              </span>
            </div>
          </div>

          {/* Status Message */}
          <div className="flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 dark:bg-blue-900/30">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600 dark:bg-blue-400" />
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {statusMessage || "Running Ookla speed test"}
            </p>
          </div>
        </div>

        {/* Participants Grid */}
        <div className="flex flex-col gap-3 rounded-xl bg-white/50 p-4 backdrop-blur-sm dark:bg-gray-800/50 sm:p-6">
          <div className="flex items-center gap-2">
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
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 sm:text-lg">
              Testing Participants
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            {participants.map((participant) => (
              <div
                key={participant.userId}
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-800 sm:px-4"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                  {participant.username.charAt(0).toUpperCase()}
                </div>
                <span className="truncate text-xs font-medium text-gray-900 dark:text-gray-100 sm:text-sm">
                  {participant.username}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <footer className="text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
            Results will be displayed automatically when the test completes
          </p>
        </footer>
      </div>
    </div>
  );
}
