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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-none border border-black/5 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-black/40">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2.5xl font-semibold text-gray-900 dark:text-gray-100">
              Room {roomId}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share the room code to invite teammates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(roomId)}
            className="cursor-pointer rounded-none border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            Copy ID
          </button>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span
            className={`rounded-none px-3 py-1 font-semibold uppercase ${
              status === "ready"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                : status === "testing"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                : status === "results"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            {statusCopy[status] ?? "Waiting"}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {participants.length}/{capacity} participants
          </span>
          {!isPersisted ? (
            <span className="rounded-none border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
              In-memory mode
            </span>
          ) : null}
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="rounded-none border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Waiting Room
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Once the room has at least two participants, the admin can start
              the synchronized speed test. All participants will receive
              countdown and progress updates.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={!canStart || isStarting}
                aria-busy={isStarting}
                onClick={isStarting ? undefined : onStartTest}
                className="cursor-pointer rounded-none bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-200 disabled:text-blue-400"
              >
                {isStarting ? (
                  <LoadingIndicator label="Starting" />
                ) : (
                  "Start Speed Test"
                )}
              </button>
              {!isAdmin ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Waiting for the room admin to initiate the test…
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={isLeaving ? undefined : onLeaveRoom}
              disabled={isLeaving}
              aria-busy={isLeaving}
              className="cursor-pointer rounded-none border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:border-red-200 disabled:bg-red-100 disabled:text-red-400 dark:border-red-500/20 dark:text-red-300 dark:hover:bg-red-500/10"
            >
              {isLeaving ? <LoadingIndicator label="Leaving" /> : "Leave Room"}
            </button>
          </div>
        </section>

        <section className="rounded-none border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
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
