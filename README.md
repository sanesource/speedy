# Speedy

Speedy is a collaborative internet speed testing app where friends, teammates, and communities can jump into shared rooms, kick off simultaneous tests, and instantly compare network stats in real time.

> **Vibe coded disclaimer:** the entire application is vibe coded—no line of code was manually written.

**Hosted Link**: https://speedy.sanesource.org/

**Backup Link**: https://speedy-vexl.onrender.com/

## What You Can Do

- Run synchronized download, upload, latency, and ping tests with everyone in your room.
- Watch live progress indicators as each participant races through their test.
- Sort and compare results in an interactive leaderboard-style table.
- Hop between rooms or spin up new ones in seconds.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Launch the dev server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` to start vibing with the app.

## How to Use the App

- **Create a room:** Pick a display name (or keep the auto-generated one), click **Create Room**, then share the room ID with friends.
- **Join a room:** Enter the room ID you received and hop right in—no accounts, no fuss.
- **Start the test:** Once at least two participants are present, the room admin hits **Start Speed Test** and everyone runs the benchmark together.
- **Review results:** The results table updates live so you can compare download, upload, latency, and ping numbers, toggle sorting, and celebrate the top performer.

## Tech Stack

- Next.js 14 for the UI and server-rendered routes
- Socket.io for real-time collaboration
- MongoDB for ephemeral room and session data
- Vercel-ready configuration for effortless deployment

## Contributing

This project is a vibe-coded playground. If you want to add to the vibes, feel free to open a PR—just keep the spirit alive and remember that no one touched a keyboard to write the original code.
