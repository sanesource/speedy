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

export default function LandingView({
  username,
  onUsernameChange,
  roomCode,
  onRoomCodeChange,
  onCreateRoom,
  onJoinRoom,
  isJoinDisabled,
  error,
  isCreating,
  isJoining,
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-10 rounded-3xl border border-black/5 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-black/40">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          Speedy Rooms
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Create or join a collaborative internet speed test room.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Display name
          </span>
          <input
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            placeholder="Enter username"
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </label>

        <button
          type="button"
          onClick={isCreating ? undefined : onCreateRoom}
          disabled={isCreating}
          aria-busy={isCreating}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isCreating ? (
            <LoadingIndicator label="Creating room" />
          ) : (
            "Create Room"
          )}
        </button>
      </div>

      <div className="relative flex items-center justify-between">
        <span
          className="h-px flex-1 bg-gray-200 dark:bg-gray-700"
          aria-hidden
        />
        <span className="px-4 text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
          Or join
        </span>
        <span
          className="h-px flex-1 bg-gray-200 dark:bg-gray-700"
          aria-hidden
        />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!isJoining && !isJoinDisabled) {
            onJoinRoom();
          }
        }}
        className="flex flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Room ID
          </span>
          <input
            value={roomCode}
            onChange={(event) =>
              onRoomCodeChange(event.target.value.toUpperCase())
            }
            placeholder="Enter 6-character room ID"
            maxLength={8}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-medium tracking-[0.3em] text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </label>

        <button
          type="submit"
          disabled={isJoinDisabled || isJoining}
          aria-busy={isJoining}
          className="w-full rounded-xl border border-gray-900/10 bg-gray-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-500 dark:border-gray-100/10 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 disabled:dark:border-gray-800 disabled:dark:bg-gray-800 disabled:dark:text-gray-500"
        >
          {isJoining ? <LoadingIndicator label="Joining room" /> : "Join Room"}
        </button>
      </form>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <footer className="flex flex-col gap-2 text-center text-xs text-gray-500 dark:text-gray-400">
        <span>
          Rooms support up to eight participants with synchronized testing.
        </span>
        <span>No account required — just share your room ID.</span>
      </footer>
    </div>
  );
}
