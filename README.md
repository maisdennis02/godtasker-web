# GodTasker Web

Front-end web client for the GodTasker API (`../godTaskerServer1-2`).

- **Stack:** Vite + React + TypeScript, TanStack Query, React Router, Tailwind v4,
  axios, socket.io-client.
- **Covers every REST endpoint** the server exposes, plus a **real-time chat**
  between users (everyone is a peer) over Socket.io.

## Prerequisites

The backend must be running on `http://localhost:3333`:

```bash
cd ../godTaskerServer1-2
npm run dev        # Postgres (godtasker-postgres) must be up; migrations applied
```

The chat feature relies on a backend extension added alongside this app:
`chat_messages` table + `POST /messages/start`, `POST /messages/:chatId/send`,
`GET /messages/:chatId/thread`, and Socket.io rooms. Run `npm run db:migrate` in the
server if you haven't.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

Configure the API URL in `.env` (defaults to `http://localhost:3333`):

```
VITE_API_URL=http://localhost:3333
```

## Usage

- **Login** is pre-filled with the seeded test account `alice@test.com` /
  `password123`. Register creates a single User (everyone is a peer).
- **Dashboard / Tasks (Sent & Received) / People / Offerings** — product pages.
  Offerings are task templates on your profile; requesting one spawns a task.
- **API Console** — a card for every endpoint, grouped by entity; the bearer token is
  attached automatically and identity-dependent fields are pre-filled.
- **Chat** — real-time messaging. To see live delivery between two users,
  log in as two different accounts in two browser tabs (e.g. `insomnia@test.com` and
  `bob@test.com`); a message sent from one appears instantly in the other.

## Scripts

```bash
npm run dev      # dev server
npm run build    # typecheck + production build
npm run lint     # eslint
```
