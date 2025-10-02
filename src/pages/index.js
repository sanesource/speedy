import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import {
  LandingView,
  RoomLobby,
  TestProgress,
  ResultsTable,
} from "../components/index.js";
import { getSocketClient } from "../lib/socketClient.js";
import { clearSession, loadSession, saveSession } from "../lib/session.js";
import { runClientSpeedTest } from "../lib/clientSpeedtest.js";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const DEFAULT_PROGRESS = {
  value: 0,
  metric: "download",
};

const TEST_DURATION_MS = 20000;
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
  const [testStartTime, setTestStartTime] = useState(null);
  const participantsRef = useRef([]);
  const testStartTimeRef = useRef(null);
  const resultsRef = useRef([]);

  const clearProgressTimer = useCallback(() => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  }, []);

  const endSimulation = useCallback(() => {
    clearProgressTimer();
    setRemainingSeconds(TEST_DURATION_SECONDS);
    testStartTimeRef.current = null;
    setTestStartTime(null);
  }, [clearProgressTimer]);

  const resetTestState = useCallback(() => {
    clearProgressTimer();
    setRemainingSeconds(TEST_DURATION_SECONDS);
    testStartTimeRef.current = null;
    setTestStartTime(null);
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
    resultsRef.current = results;
  }, [results]);

  // Handle showing results when they arrive and timer is done
  useEffect(() => {
    if (view === "testing" && results.length > 0 && remainingSeconds <= 0) {
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
  }, [
    view,
    results.length,
    remainingSeconds,
    roomState.roomId,
    roomState.userId,
    username,
  ]);

  // Start timer when view changes to testing
  useEffect(() => {
    if (view === "testing" && testStartTime) {
      // Clear any existing timer
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }

      progressTimer.current = setInterval(() => {
        if (!testStartTimeRef.current) {
          return;
        }
        const elapsed = Date.now() - testStartTimeRef.current;
        const secondsRemaining = Math.max(
          0,
          Math.ceil((TEST_DURATION_MS - elapsed) / 1000)
        );

        setRemainingSeconds(secondsRemaining);

        // When timer reaches zero, show results if we have them
        if (secondsRemaining <= 0) {
          clearProgressTimer();

          // If we have results, show them
          if (resultsRef.current.length > 0) {
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
        }
      }, 1000);
    }

    return () => {
      if (view !== "testing" && progressTimer.current) {
        clearInterval(progressTimer.current);
        progressTimer.current = null;
      }
    };
  }, [view, testStartTime, roomState.roomId, roomState.userId, username]);

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

      const startTime = Date.now();
      testStartTimeRef.current = startTime;
      setTestStartTime(startTime);
      setRemainingSeconds(TEST_DURATION_SECONDS);

      // Kick off client-side speed test and report result when done
      (async () => {
        try {
          const result = await runClientSpeedTest();
          socket.emit("client-test-completed", {
            roomId: roomState.roomId,
            userId: roomState.userId,
            ...result,
          });
        } catch (e) {
          socket.emit("client-test-completed", {
            roomId: roomState.roomId,
            userId: roomState.userId,
            downloadSpeed: 0,
            uploadSpeed: 0,
            latency: 0,
            ping: 0,
            jitter: 0,
            testedAt: new Date().toISOString(),
            error: e?.message ?? "client test failed",
          });
        }
      })();

      saveSession({
        roomId: roomState.roomId,
        userId: roomState.userId,
        username,
        status: "testing",
      });
      setIsStarting(false);
    }

    function handleTestProgress(payload) {
      // this handler no longer needs to update state after removing testProgress
    }

    function handleTestCompleted(payload) {
      setResults((prev) => {
        const filtered = prev.filter(
          (entry) => entry.userId !== payload.userId
        );
        return [...filtered, payload];
      });
    }

    function handleAllResults(payload) {
      setResults(payload.results ?? []);
      // Results will be shown automatically by useEffect when timer completes
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
      setRoomState((prev) => ({
        ...prev,
        status: "waiting",
      }));
    });
    socket.on("room-closed", handleRoomClosed);
    socket.on("error", (payload) => {
      setIsCreating(false);
      setIsJoiningRoom(false);
      setError(payload.message ?? "Unexpected error");
    });
    socket.on("room-full", () => {
      setIsJoiningRoom(false);
      setError("Room is full");
    });
    socket.on("room-locked", () => {
      setIsJoiningRoom(false);
      setError("Room is locked while testing");
    });

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
      socket.off("room-locked");
    };
  }, [
    socket,
    username,
    roomState.roomId,
    roomState.userId,
    clearProgressTimer,
    roomState.participants,
    endSimulation,
    isCreating,
    isJoiningRoom,
  ]);

  const handleCreateRoom = useCallback(() => {
    if (!socket) {
      setError("Unable to connect to server");
      return;
    }

    if (!username.trim()) {
      setError("Please enter a display name to create a room.");
      return;
    }

    if (isCreating) {
      return;
    }

    setIsCreating(true);
    socket.emit("create-room", { username });
  }, [socket, username, isCreating]);

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

    if (isJoiningRoom) {
      return;
    }

    setIsJoiningRoom(true);
    socket.emit("join-room", { roomId: roomCode, username });
  }, [socket, username, roomCode, isJoiningRoom]);

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
      className={`${inter.className} ${jetbrainsMono.className} min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 p-6 font-sans dark:from-gray-950 dark:via-gray-900 dark:to-gray-950`}
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
            isCreating={isCreating}
            isJoining={isJoiningRoom}
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

      {/* Desktop: sidebar star button */}
      <a
        href="https://github.com/sanesource/speedy"
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed right-4 top-1/2 hidden -translate-y-1/2 transform items-center gap-2 rounded-none bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800 md:flex"
        aria-label="Star speedy on GitHub"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M11.48 3.499a.75.75 0 0 1 1.04 0l2.46 2.46a.75.75 0 0 0 .424.214l3.407.494a.75.75 0 0 1 .416 1.277l-2.463 2.4a.75.75 0 0 0-.216.664l.581 3.39a.75.75 0 0 1-1.088.791l-3.045-1.6a.75.75 0 0 0-.698 0l-3.045 1.6a.75.75 0 0 1-1.088-.79l.58-3.392a.75.75 0 0 0-.216-.663L4.272 7.944a.75.75 0 0 1 .416-1.277l3.407-.494a.75.75 0 0 0 .424-.214l2.96-2.46Z" />
        </svg>
        <span>Star on GitHub</span>
      </a>

      {/* Mobile: footer star button */}
      <div className="fixed inset-x-0 bottom-4 flex justify-center md:hidden">
        <a
          href="https://github.com/sanesource/speedy"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-none bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800"
          aria-label="Star speedy on GitHub"
        >
          ⭐ Star on GitHub
        </a>
      </div>
    </div>
  );
}
