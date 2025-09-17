# Easy Read Toolkit (monorepo)

This repository stitches together the previously separate prototypes for the Easy Read Toolkit into a single developer-friendly project. It now ships with:

- **`backend/`** – a Node.js (Express) API that can parse PDFs, run OCR on images and keep an in-memory library of simplified documents.
- **`frontend/`** – an Expo (React Native) application with three tabs:
  - _Home_ – call the AI rewrite endpoint and preview the suggested plain-language alternatives.
  - _Files_ – browse the shared document library, add manual notes or sample content, and view/delete/share stored text.
  - _Menu_ – quick start instructions plus connection details for the running API.
- The `Easy-Read-Toolkit/...` folders from the original hand-off are preserved for reference but are no longer used by the app.

## Prerequisites

- Node.js 18+ (for both backend and frontend tooling).
- npm 9+ (yarn/pnpm will also work if you prefer, but the repo ships with npm lockfiles).

## Getting started

### 1. Boot the API

```bash
cd backend
npm install
npm start
```

The server listens on port `5000` by default. You can change the port or CORS whitelist by creating a `.env` file – copy `.env.example` if you add one – and setting `PORT` or `ALLOWED_ORIGIN`.

Available endpoints:

| Method | Path              | Description |
| ------ | ----------------- | ----------- |
| GET    | `/health`         | Simple ping used by the client. |
| POST   | `/ai/rewrite`     | Returns up to five simplified rewrites for the submitted sentence. |
| POST   | `/documents/text` | Store manual notes/snippets in the shared library. |
| POST   | `/upload/pdf`     | Parse embedded text in PDF uploads (stores the result as a document). |
| POST   | `/upload/image`   | OCR image uploads and store the extracted text. |
| GET    | `/documents`      | List the saved documents (newest first). |
| GET    | `/documents/:id`  | Fetch the full text for a document. |
| DELETE | `/documents/:id`  | Remove a document from the in-memory store. |

The server keeps everything in RAM for simplicity. Restarting will clear the library – ideal for demos and test runs.

### 2. Run the Expo app

```bash
cd frontend
npm install
npm start
```

Press `w` to open the web preview or scan the QR code with Expo Go. When running on a physical device, expose the backend via your machine's LAN IP and set an environment variable before starting Expo:

```bash
EXPO_PUBLIC_API_URL="http://192.168.x.x:5000" npm start
```

The app falls back to `http://localhost:5000` (iOS/web) or `http://10.0.2.2:5000` (Android emulator) when no variable is supplied.

## Repository layout

```
backend/   # Express server with PDF/OCR routes and AI rewrite stub
frontend/  # Expo app talking to the API
```

Legacy material that arrived with the original brief lives under `Easy-Read-Toolkit/` for historical reference.

## Next steps

- Replace the heuristic rewrite stub with calls to the large language model of your choice.
- Wire the floating button actions to real capture sources (camera, PDF picker, URL import).
- Persist documents in a database or object storage service to keep a permanent library.

Happy building!
