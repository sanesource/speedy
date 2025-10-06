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
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-2xl border border-gray-200/60 bg-white/90 p-6 shadow-2xl backdrop-blur-2xl transition-all hover:shadow-3xl dark:border-gray-800/60 dark:bg-gray-900/90 sm:max-w-lg sm:gap-8 sm:rounded-3xl sm:p-8 lg:max-w-xl">
      {/* Hero Header */}
      <header className="flex flex-col items-center gap-3 text-center sm:gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30 sm:h-20 sm:w-20 sm:rounded-3xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8 text-white sm:h-10 sm:w-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
            />
          </svg>
        </div>
        <div>
          <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400 sm:text-4xl">
            SpeedRace Rooms
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            Collaborative internet speed testing
          </p>
        </div>
      </header>

      {/* Create Room Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Display Name
          </label>
          <input
            id="username"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            placeholder="Enter your name"
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400"
          />
        </div>

        <button
          type="button"
          onClick={isCreating ? undefined : onCreateRoom}
          disabled={isCreating}
          aria-busy={isCreating}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/40 focus:outline-none focus:ring-4 focus:ring-blue-500/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 sm:py-4 sm:text-lg"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="relative">
            {isCreating ? (
              <LoadingIndicator label="Creating Room..." />
            ) : (
              <>
                <span className="hidden sm:inline">Create New Room</span>
                <span className="sm:hidden">Create Room</span>
              </>
            )}
          </span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-700" />
        <span className="mx-4 flex-shrink text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          or
        </span>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-700" />
      </div>

      {/* Join Room Section */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!isJoining && !isJoinDisabled) {
            onJoinRoom();
          }
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="roomCode"
            className="text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Join Existing Room
          </label>
          <input
            id="roomCode"
            value={roomCode}
            onChange={(event) =>
              onRoomCodeChange(event.target.value.toUpperCase())
            }
            placeholder="ROOM-ID"
            maxLength={8}
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.2em] text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 placeholder:tracking-normal focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-purple-400 sm:text-xl"
          />
        </div>

        <button
          type="submit"
          disabled={isJoinDisabled || isJoining}
          aria-busy={isJoining}
          className="group relative w-full overflow-hidden rounded-xl border-2 border-gray-900 bg-gray-900 px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:border-gray-800 hover:bg-gray-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gray-500/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:scale-100 dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900 dark:hover:border-gray-200 dark:hover:bg-gray-200 dark:disabled:border-gray-700 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 sm:py-4 sm:text-lg"
        >
          {isJoining ? (
            <LoadingIndicator label="Joining..." />
          ) : (
            <>
              <span className="hidden sm:inline">Join Room</span>
              <span className="sm:hidden">Join</span>
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {error ? (
        <div className="animate-shake rounded-xl border-2 border-red-300 bg-red-50 p-4 shadow-sm dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        </div>
      ) : null}

      {/* Footer Info */}
      <footer className="flex flex-col gap-2 rounded-xl bg-gray-50 p-4 text-center text-xs text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 sm:text-sm">
        <div className="flex items-center justify-center gap-2">
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
              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
          </svg>
          <span className="font-semibold">Up to 8 participants</span>
        </div>
        <p>
          No account required • Synchronized testing • Share room ID to invite
        </p>
      </footer>
    </div>
  );
}
