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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-none border border-black/5 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-emerald-500/20 p-4 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:from-blue-500/10 dark:via-purple-500/5 dark:to-emerald-500/10 sm:gap-6 sm:rounded-none sm:p-6">
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
        <div className="relative w-full max-w-2xl mt-2 sm:mt-4">
          <svg
            className="w-full h-24 sm:h-28"
            viewBox="0 0 100 24"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Track */}
            <line
              x1="5"
              y1="18"
              x2="95"
              y2="18"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-gray-300 dark:text-gray-700"
            />
            {/* Ticks */}
            {Array.from({ length: 10 }).map((_, i) => (
              <line
                key={i}
                x1={5 + i * 9}
                y1="16"
                x2={5 + i * 9}
                y2="20"
                stroke="currentColor"
                strokeWidth="0.8"
                className="text-gray-300 dark:text-gray-700"
              />
            ))}
            {/* Checkpoint flag at end */}
            <g transform="translate(95,16)">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="-10"
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-500 dark:text-gray-400"
              />
              <polygon points="0,-10 6,-7 0,-4" className="fill-blue-500" />
            </g>

            {/* Car position */}
            {(() => {
              const startX = 5;
              const endX = 95;
              const progress = Math.max(0, Math.min(100, normalizedTime));
              const x = startX + ((endX - startX) * progress) / 100;
              const y = 13; // baseline for car body
              return (
                <g
                  transform={`translate(${x},${y})`}
                  style={{
                    transition:
                      "transform 800ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  {/* Car body */}
                  <rect
                    x="-6"
                    y="-4"
                    width="12"
                    height="6"
                    rx="0.5"
                    className="fill-blue-600"
                  />
                  {/* Roof */}
                  <rect
                    x="-3"
                    y="-7"
                    width="6"
                    height="4"
                    rx="0.5"
                    className="fill-blue-500"
                  />
                  {/* Wheels */}
                  <circle
                    cx="-4"
                    cy="3"
                    r="2"
                    className="fill-gray-800 dark:fill-gray-200"
                  />
                  <circle
                    cx="4"
                    cy="3"
                    r="2"
                    className="fill-gray-800 dark:fill-gray-200"
                  />
                  {/* Headlight */}
                  <rect
                    x="6"
                    y="-2"
                    width="1.5"
                    height="2"
                    className="fill-amber-300"
                  />
                </g>
              );
            })()}
          </svg>
          <div className="absolute inset-0 flex items-start justify-center pt-1 ">
            <span className="text-sm font-semibold text-gray-900 pb-4 dark:text-gray-100 sm:text-base">
              {Math.round(normalizedTime)}% complete
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
                className="rounded-none bg-white/50 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-white/10 dark:text-gray-300 sm:px-3 sm:py-1 sm:text-sm"
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
