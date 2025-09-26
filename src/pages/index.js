import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import {
  LandingView,
  RoomLobby,
  TestProgress,
  ResultsTable,
} from "@/components";
import { getSocketClient } from "@/lib/socketClient";
import { clearSession, loadSession, saveSession } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_PROGRESS = {
  value: 0,
  metric: "download",
};

const TEST_DURATION_MS = 45000;
const TEST_DURATION_SECONDS = Math.ceil(TEST_DURATION_MS / 1000);

function randomUsername() {
  const adjectives = [
    "Swift",
    "Rapid",
    "Turbo",
    "Lightning",
    "Quantum",
    "Blazing",
  ];
  const nouns = ["Koala", "Falcon", "Otter", "Panda", "Cheetah", "Pixel"];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}${noun}${Math.floor(Math.random() * 90 + 10)}`;
}

function normalizeRoomUpdate(payload) {
  return {
    participants: payload.participants ?? [],
    status: payload.status ?? "waiting",
    maxCapacity: payload.maxCapacity ?? 8,
    adminId: payload.adminId,
  };
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function progressMetric(value) {
  if (value < 0.25) {
    return "download";
  }
  if (value < 0.5) {
    return "upload";
  }
  if (value < 0.75) {
    return "latency";
  }
  return "ping";
}

function clampProgress(value) {
  if (Number.isNaN(value)) {
    return 0;
  }
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return value;
}

export default function Home() {
  const [view, setView] = useState("landing");
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [roomState, setRoomState] = useState({
    roomId: "",
    userId: "",
    adminId: "",
    status: "waiting",
    participants: [],
    maxCapacity: 8,
  });
  const [testProgress, setTestProgress] = useState({});
  const [results, setResults] = useState([]);
  const progressTimer = useRef(null);
  const [isPersisted, setIsPersisted] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(
    TEST_DURATION_SECONDS
  );
  const participantsRef = useRef([]);
  const simulationTimerRef = useRef(null);
  const testStartTimeRef = useRef(null);
  const progressOffsetsRef = useRef({});

  const clearProgressTimer = useCallback(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  }, []);

  const endSimulation = useCallback(() => {
    if (simulationTimerRef.current) {
      clearTimeout(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }

    clearProgressTimer();
    setRemainingSeconds(TEST_DURATION_SECONDS);
    testStartTimeRef.current = null;
    progressOffsetsRef.current = {};
  }, [clearProgressTimer]);

  const socket = useMemo(() => getSocketClient(), []);

  useEffect(() => {
    const session = loadSession();
    if (!session) {
      return;
    }

    setUsername(session.username ?? "");
    if (session.roomId && session.userId) {
      setRoomCode(session.roomId);
      setRoomState((prev) => ({
        ...prev,
        roomId: session.roomId,
        userId: session.userId,
        status: session.status ?? "waiting",
      }));
      participantsRef.current = session.participants ?? [];
      setView("lobby");
    }
  }, []);

  useEffect(() => {
    participantsRef.current = roomState.participants;
  }, [roomState.participants]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    function handleRoomCreated(payload) {
      setRoomState({
        roomId: payload.roomId,
        userId: payload.userId,
        adminId: payload.adminId,
        status: payload.status,
        participants: payload.participants,
        maxCapacity: payload.maxCapacity ?? 8,
      });
      participantsRef.current = payload.participants ?? [];
      setView("lobby");
      setError("");
      setIsPersisted(payload.isPersisted ?? true);
      setIsCreating(false);
      setIsJoiningRoom(false);
      saveSession({
        roomId: payload.roomId,
        userId: payload.userId,
        username,
        status: payload.status,
      });
    }

    function handleRoomJoined(payload) {
      setRoomState({
        roomId: payload.roomId,
        userId: payload.userId,
        adminId: payload.adminId,
        status: payload.status,
        participants: payload.participants,
        maxCapacity: payload.maxCapacity ?? 8,
      });
      participantsRef.current = payload.participants ?? [];
      setView("lobby");
      setError("");
      setIsPersisted(payload.isPersisted ?? true);
      setIsCreating(false);
      setIsJoiningRoom(false);
      saveSession({
        roomId: payload.roomId,
        userId: payload.userId,
        username,
        status: payload.status,
      });
    }

    function handleParticipantUpdate(payload) {
      setRoomState((prev) => ({
        ...prev,
        ...normalizeRoomUpdate(payload),
      }));
      const participants = payload.participants ?? [];
      if (participants.length > 0) {
        participantsRef.current = participants;
      }
      if (typeof payload.isPersisted === "boolean") {
        setIsPersisted(payload.isPersisted);
      }
    }

    function handleTestStarted(payload) {
      const participantsList = payload?.participants ?? roomState.participants;
      participantsRef.current = participantsList;
      setView("testing");
      setRoomState((prev) => ({
        ...prev,
        status: payload?.status ?? "testing",
        participants: participantsList,
      }));
      setTestProgress({});
      const offsets = participantsList.reduce((accumulator, participant) => {
        accumulator[participant.userId] = Math.random() * 0.05;
        return accumulator;
      }, {});
      offsets[roomState.userId] = 0;
      progressOffsetsRef.current = offsets;
      testStartTimeRef.current = Date.now();
      clearProgressTimer();
      setRemainingSeconds(TEST_DURATION_SECONDS);

      const completeSimulation = () => {
        const simulatedResults = participantsList.map((participant) => ({
          userId: participant.userId,
          username: participant.username,
          downloadSpeed: randomBetween(100, 400),
          uploadSpeed: randomBetween(50, 200),
          latency: randomBetween(10, 60),
          ping: randomBetween(5, 30),
          testedAt: new Date().toISOString(),
        }));
        endSimulation();
        setResults(simulatedResults);
        setView("results");
        setRoomState((prev) => ({
          ...prev,
          status: "results",
        }));
      };

      simulationTimerRef.current = setTimeout(
        completeSimulation,
        TEST_DURATION_MS
      );

      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
      progressTimer.current = setInterval(() => {
        if (!testStartTimeRef.current) {
          return;
        }
        const elapsed = Date.now() - testStartTimeRef.current;
        const normalizedTime = Math.min(1, elapsed / TEST_DURATION_MS);
        const secondsRemaining = Math.max(
          0,
          Math.ceil((TEST_DURATION_MS - elapsed) / 1000)
        );
        setRemainingSeconds(secondsRemaining);

        setTestProgress((prev) => {
          const updated = { ...prev };
          const currentParticipants = participantsRef.current;
          const offsetsMap = progressOffsetsRef.current;

          currentParticipants.forEach((participant) => {
            if (!participant?.userId) {
              return;
            }
            const offset = offsetsMap[participant.userId] ?? 0;
            const current = updated[participant.userId] ?? DEFAULT_PROGRESS;
            const simulatedValue = Math.min(1, normalizedTime + offset);
            const nextValue = Math.max(current.value, simulatedValue);
            const metric = progressMetric(nextValue);

            updated[participant.userId] = {
              value: clampProgress(nextValue),
              metric,
            };
          });

          return updated;
        });
      }, 1000);

      saveSession({
        roomId: roomState.roomId,
        userId: roomState.userId,
        username,
        status: "testing",
      });
      setIsStarting(false);
    }

    function handleTestProgress(payload) {
      setTestProgress((prev) => ({
        ...prev,
        [payload.userId]: {
          value: payload.progress ?? 0,
          metric: payload.currentMetric ?? DEFAULT_PROGRESS.metric,
        },
      }));
    }

    function handleTestCompleted(payload) {
      endSimulation();
      setResults((prev) => {
        const filtered = prev.filter(
          (entry) => entry.userId !== payload.userId
        );
        return [...filtered, payload];
      });
    }

    function handleAllResults(payload) {
      endSimulation();
      setResults(payload.results ?? []);
      setView("results");
      setRoomState((prev) => ({
        ...prev,
        status: "results",
      }));
      saveSession({
        roomId: roomState.roomId,
        userId: roomState.userId,
        username,
        status: "results",
      });
    }

    function handleRoomClosed() {
      endSimulation();
      setError("Room closed by admin");
      setView("landing");
      setRoomState({
        roomId: "",
        userId: "",
        adminId: "",
        status: "waiting",
        participants: [],
        maxCapacity: 8,
      });
      setResults([]);
      setTestProgress({});
      clearSession();
      setIsLeaving(false);
    }

    socket.on("room-created", handleRoomCreated);
    socket.on("room-joined", handleRoomJoined);
    socket.on("participant-list-update", handleParticipantUpdate);
    socket.on("test-started", handleTestStarted);
    socket.on("test-progress", handleTestProgress);
    socket.on("test-completed", handleTestCompleted);
    socket.on("all-results-ready", handleAllResults);
    socket.on("test-restarted", () => {
      setView("lobby");
      setResults([]);
      setTestProgress({});
      setRoomState((prev) => ({
        ...prev,
        status: "waiting",
      }));
    });
    socket.on("room-closed", handleRoomClosed);
    socket.on("error", (payload) =>
      setError(payload.message ?? "Unexpected error")
    );
    socket.on("room-full", () => setError("Room is full"));

    return () => {
      clearProgressTimer();
      socket.off("room-created", handleRoomCreated);
      socket.off("room-joined", handleRoomJoined);
      socket.off("participant-list-update", handleParticipantUpdate);
      socket.off("test-started", handleTestStarted);
      socket.off("test-progress", handleTestProgress);
      socket.off("test-completed", handleTestCompleted);
      socket.off("all-results-ready", handleAllResults);
      socket.off("test-restarted");
      socket.off("room-closed", handleRoomClosed);
    };
  }, [
    socket,
    username,
    roomState.roomId,
    roomState.userId,
    clearProgressTimer,
    roomState.participants,
    endSimulation,
  ]);

  useEffect(() => {
    if (view !== "testing") {
      clearProgressTimer();
      return;
    }

    clearProgressTimer();

    const tick = () => {
      if (!testStartTimeRef.current) {
        progressTimer.current = setTimeout(tick, 800);
        return;
      }

      const elapsed = Date.now() - testStartTimeRef.current;
      const normalizedTime = Math.min(1, elapsed / TEST_DURATION_MS);

      setTestProgress((prev) => {
        const updated = { ...prev };
        const currentParticipants = participantsRef.current;
        const offsets = progressOffsetsRef.current;

        currentParticipants.forEach((participant) => {
          if (!participant?.userId) {
            return;
          }
          const offset = offsets[participant.userId] ?? 0;
          const current = updated[participant.userId] ?? DEFAULT_PROGRESS;
          const simulatedValue = Math.min(1, normalizedTime + offset);
          const nextValue = Math.max(current.value, simulatedValue);
          const metric = progressMetric(nextValue);

          updated[participant.userId] = {
            value: clampProgress(nextValue),
            metric,
          };
        });

        return updated;
      });

      progressTimer.current = setTimeout(tick, 800);
    };

    progressTimer.current = setTimeout(tick, 800);

    return () => {
      clearProgressTimer();
    };
  }, [view, clearProgressTimer]);

  const handleCreateRoom = useCallback(() => {
    if (!socket) {
      setError("Unable to connect to server");
      return;
    }

    if (!username.trim()) {
      setError("Please enter a display name to create a room.");
      return;
    }

    setIsCreating(true);
    socket.emit("create-room", { username });
  }, [socket, username]);

  const handleJoinRoom = useCallback(() => {
    if (!socket) {
      setError("Unable to connect to server");
      return;
    }
    if (!roomCode) {
      setError("Enter a room ID");
      return;
    }
    if (!username.trim()) {
      setError("Please enter a display name before joining.");
      return;
    }

    setIsJoiningRoom(true);
    socket.emit("join-room", { roomId: roomCode, username });
  }, [socket, username, roomCode]);

  const handleStartTest = useCallback(() => {
    if (!socket) {
      return;
    }
    setIsStarting(true);
    socket.emit("start-speed-test", { roomId: roomState.roomId });
    setView("testing");
  }, [socket, roomState.roomId]);

  const handleLeaveRoom = useCallback(() => {
    if (!socket) {
      return;
    }
    setIsLeaving(true);
    socket.emit("leave-room", {
      roomId: roomState.roomId,
      userId: roomState.userId,
    });
    endSimulation();
    clearSession();
    setRoomState({
      roomId: "",
      userId: "",
      adminId: "",
      status: "waiting",
      participants: [],
      maxCapacity: 8,
    });
    participantsRef.current = [];
    setView("landing");
    setIsLeaving(false);
  }, [socket, roomState.roomId, roomState.userId, endSimulation]);

  const handleRestart = useCallback(() => {
    if (!socket) {
      return;
    }
    setIsRestarting(true);
    socket.emit("restart-test", { roomId: roomState.roomId });
    setResults([]);
    setTestProgress({});
    endSimulation();
    setView("lobby");
    setRoomState((prev) => ({
      ...prev,
      status: "waiting",
    }));
    setIsRestarting(false);
  }, [socket, roomState.roomId, endSimulation]);

  useEffect(() => {
    setError("");
  }, [view]);

  const maxDownload = useMemo(() => {
    if (results.length === 0) {
      return 0;
    }
    return Math.max(...results.map((result) => result.downloadSpeed ?? 0));
  }, [results]);

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 p-6 font-sans dark:from-gray-950 dark:via-gray-900 dark:to-gray-950`}
    >
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {view === "landing" ? (
          <LandingView
            username={username}
            onUsernameChange={setUsername}
            roomCode={roomCode}
            onRoomCodeChange={setRoomCode}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            isJoinDisabled={!roomCode}
            error={error}
          />
        ) : null}

        {view === "lobby" ? (
          <RoomLobby
            roomId={roomState.roomId}
            adminId={roomState.adminId}
            userId={roomState.userId}
            participants={roomState.participants}
            status={roomState.status}
            capacity={roomState.maxCapacity}
            onStartTest={handleStartTest}
            onLeaveRoom={handleLeaveRoom}
            isPersisted={isPersisted}
            isStarting={isStarting}
            isLeaving={isLeaving}
          />
        ) : null}

        {view === "testing" ? (
          <TestProgress
            participants={roomState.participants}
            progressByUser={testProgress}
            statusMessage="Collecting real-time metrics"
            remainingSeconds={remainingSeconds}
          />
        ) : null}

        {view === "results" ? (
          <ResultsTable
            results={results}
            participants={roomState.participants}
            maxDownload={maxDownload}
            onRestart={handleRestart}
            onExit={handleLeaveRoom}
            isAdmin={roomState.userId === roomState.adminId}
            isPersisted={isPersisted}
            isRestarting={isRestarting}
            isLeaving={isLeaving}
          />
        ) : null}
      </main>
    </div>
  );
}
