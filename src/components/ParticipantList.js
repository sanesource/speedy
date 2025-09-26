function ParticipantRow({ participant, isAdmin }) {
  return (
    <li className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
      <div className="flex flex-col">
        <span>{participant.username}</span>
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
          {participant.userId}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase">
        {isAdmin ? (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
            Admin
          </span>
        ) : null}
        <span
          className={`rounded-full px-3 py-1 ${
            participant.isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
              : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          }`}
        >
          {participant.isActive ? "Active" : "Inactive"}
        </span>
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
    <div className="flex flex-col gap-3">
      <header className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Participants
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {participants.length}/{capacity} in room
          </span>
        </div>
      </header>

      <ul className="flex flex-col gap-2">
        {participants.map((participant) => (
          <ParticipantRow
            key={participant.userId}
            participant={participant}
            isAdmin={participant.userId === adminId}
          />
        ))}
        {participants.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
            Waiting for participants to join…
          </li>
        ) : null}
      </ul>
    </div>
  );
}
