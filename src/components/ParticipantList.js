function ParticipantRow({ participant, isAdmin }) {
  return (
    <li className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        {/* Avatar and Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white shadow-md sm:h-12 sm:w-12 sm:text-base">
            {participant.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="truncate text-sm font-bold text-gray-900 dark:text-gray-100 sm:text-base">
              {participant.username}
            </span>
            <span className="truncate text-xs font-mono tabular-nums text-gray-500 dark:text-gray-400">
              {participant.userId}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:gap-2">
          {isAdmin ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-300 sm:px-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-3 w-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden sm:inline">Admin</span>
              <span className="sm:hidden">A</span>
            </span>
          ) : null}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold shadow-sm sm:px-3 ${
              participant.isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                participant.isActive
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-gray-500"
              }`}
            />
            {participant.isActive ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </li>
  );
}

export default function ParticipantList({
  participants = [],
  adminId,
  capacity,
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <header className="flex items-center justify-between">
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
              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
            />
          </svg>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Participants
            </h2>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {participants.length} of {capacity} joined
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="relative h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
            style={{ width: `${(participants.length / capacity) * 100}%` }}
          />
        </div>
      </div>

      {/* Participants List */}
      <ul className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {participants.map((participant) => (
          <ParticipantRow
            key={participant.userId}
            participant={participant}
            isAdmin={participant.userId === adminId}
          />
        ))}
        {participants.length === 0 ? (
          <li className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center dark:border-gray-700 dark:bg-gray-800/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-12 w-12 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                No participants yet
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Share the room ID to invite others
              </p>
            </div>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
