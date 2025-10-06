import ParticipantList from "./ParticipantList.js";

const statusCopy = {
  waiting: "Waiting for participants",
  ready: "Ready to start",
  testing: "Speed test in progress",
  results: "Results available",
};

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

export default function RoomLobby({
  roomId,
  adminId,
  userId,
  participants,
  status,
  capacity,
  onStartTest,
  onLeaveRoom,
  isPersisted,
  isStarting,
  isLeaving,
}) {
  const isAdmin = userId === adminId;
  const canStart =
    isAdmin &&
    status !== "testing" &&
    status !== "results" &&
    participants.length >= 2;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-2xl border border-gray-200/60 bg-white/90 p-4 shadow-2xl backdrop-blur-2xl dark:border-gray-800/60 dark:bg-gray-900/90 sm:gap-6 sm:rounded-3xl sm:p-6 lg:p-8">
      {/* Header Section */}
      <header className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md sm:h-12 sm:w-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 text-white sm:h-6 sm:w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
                  Room {roomId}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                  Share this code to invite others
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(roomId);
            }}
            className="group flex items-center gap-2 self-start rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-sm transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/30 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-400"
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
                d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
              />
            </svg>
            <span>Copy ID</span>
          </button>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm ${
              status === "ready"
                ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-700"
                : status === "testing"
                ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-700"
                : status === "results"
                ? "bg-purple-100 text-purple-700 ring-2 ring-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-700"
                : "bg-gray-200 text-gray-700 ring-2 ring-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                status === "ready"
                  ? "bg-emerald-500 animate-pulse"
                  : status === "testing"
                  ? "bg-blue-500 animate-pulse"
                  : status === "results"
                  ? "bg-purple-500"
                  : "bg-gray-500"
              }`}
            />
            {statusCopy[status] ?? "Waiting"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300">
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
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
            {participants.length}/{capacity}
          </span>
          {!isPersisted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 shadow-sm dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
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
              In-Memory
            </span>
          ) : null}
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Control Panel */}
        <section className="flex min-w-0 flex-col gap-4 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-lg dark:border-gray-800 dark:from-gray-900 dark:to-gray-950 sm:p-6">
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
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Control Panel
            </h2>
          </div>

          <div className="flex flex-col gap-3 rounded-lg bg-white p-4 dark:bg-gray-800/50">
            <p className="break-words text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {isAdmin ? (
                <>
                  You are the{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    room admin
                  </span>
                  . Once at least 2 participants join, you can start the
                  synchronized speed test.
                </>
              ) : (
                <>
                  Waiting for the{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    room admin
                  </span>{" "}
                  to start the test. All participants will be tested
                  simultaneously.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              disabled={!canStart || isStarting}
              aria-busy={isStarting}
              onClick={isStarting ? undefined : onStartTest}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:hover:scale-100 dark:disabled:from-gray-700 dark:disabled:to-gray-800 sm:px-6 sm:py-4 sm:text-base"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                {isStarting ? (
                  <LoadingIndicator label="Starting..." />
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                      />
                    </svg>
                    <span className="whitespace-nowrap">Start Speed Test</span>
                  </>
                )}
              </span>
            </button>

            {!isAdmin && (
              <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
                <p className="break-words text-xs font-medium text-blue-700 dark:text-blue-300">
                  Only the admin can start the test
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={isLeaving ? undefined : onLeaveRoom}
              disabled={isLeaving}
              aria-busy={isLeaving}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-red-300 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-50 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-red-500/30 active:scale-95 disabled:cursor-not-allowed disabled:border-red-200 disabled:bg-red-100 disabled:text-red-400 dark:border-red-800 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950 sm:px-6 sm:py-3 sm:text-base"
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
                    className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  <span className="whitespace-nowrap">Leave Room</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Participants List */}
        <section className="flex min-w-0 flex-col gap-4 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-lg dark:border-gray-800 dark:from-gray-900 dark:to-gray-950 sm:p-6">
          <ParticipantList
            participants={participants}
            adminId={adminId}
            capacity={capacity}
          />
        </section>
      </div>
    </div>
  );
}
