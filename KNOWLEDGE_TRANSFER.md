# Femigrants Frontend — Knowledge Transfer (KT)

**Document purpose:** Handoff guide for a new developer taking over this repository.  
**Last updated:** May 2026  
**Repository:** `femigrants-tech/chatbot-frontend` (Git remote: `git@github-femigrants:femigrants-tech/chatbot-frontend.git`)  
**Product name:** Femibot AI Assistant (Femigrants RAG chatbot frontend)

---

## Table of contents

1. [What this project is](#1-what-this-project-is)
2. [System context (frontend + backend)](#2-system-context-frontend--backend)
3. [Two ways this code is used](#3-two-ways-this-code-is-used)
4. [Tech stack](#4-tech-stack)
5. [Repository layout](#5-repository-layout)
6. [Environment variables](#6-environment-variables)
7. [Getting started locally](#7-getting-started-locally)
8. [Application architecture](#8-application-architecture)
9. [Key source files (what to read first)](#9-key-source-files-what-to-read-first)
10. [Pages and user flows](#10-pages-and-user-flows)
11. [API integration](#11-api-integration)
12. [State management](#12-state-management)
13. [Branding and styling](#13-branding-and-styling)
14. [WordPress embed widget](#14-wordpress-embed-widget)
15. [Build, deploy, and scripts](#15-build-deploy-and-scripts)
16. [Known limitations and gaps](#16-known-limitations-and-gaps)
17. [Troubleshooting](#17-troubleshooting)
18. [Other documentation in this repo](#18-other-documentation-in-this-repo)
19. [Handoff checklist for the new developer](#19-handoff-checklist-for-the-new-developer)
20. [Contacts and access (fill in)](#20-contacts-and-access-fill-in)

---

## 1. What this project is

This is the **frontend** for **Femibot**, an AI assistant for [Femigrants](https://femigrants.com/). It does **not** run the AI or store documents by itself. It is a UI that talks to a **separate RAG backend** (Retrieval-Augmented Generation):

- Users **upload documents** into a knowledge base (Files page).
- Users **ask questions** in chat; the backend retrieves relevant chunks and returns an answer (Chat page).
- Optionally, the same chat experience is shipped as a **floating widget** embeddable on WordPress or any HTML page.

**Default production backend URL (if `.env` is missing):**  
`https://femigrants-chatbot-backend.vercel.app`

**Default AI model:** `gemini-2.5-flash` (sent on every `/chat` request; backend must support it).

There is **no user authentication** in this frontend today. Anyone with access to the deployed app can chat and manage files (security must be handled at infra/backend if required).

---

## 2. System context (frontend + backend)

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                         │
│  ┌──────────────────────┐    ┌──────────────────────────────┐ │
│  │  React SPA (Vite)     │    │  OR: WordPress + widget JS    │ │
│  │  localhost:3000       │    │  femibot-chat-widget.js       │ │
│  │  /chat, /files        │    │  window.FEMIBOT_CONFIG          │ │
│  └──────────┬───────────┘    └──────────────┬───────────────┘ │
└─────────────┼───────────────────────────────┼─────────────────┘
              │  HTTPS + JSON (Axios)          │
              ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  RAG Backend (FastAPI-style API, not in this repo)               │
│  e.g. femigrants-chatbot-backend.vercel.app or localhost:8000  │
│  - Ingests/uploads files, vector search, LLM (Gemini)          │
│  - Returns chat answers + optional source metadata             │
└─────────────────────────────────────────────────────────────────┘
```

**You need access to the backend repository and deployment** to change API behavior, API keys, CORS, or document processing. This KT doc covers **only the frontend**.

---

## 3. Two ways this code is used

| Mode | Entry | Build command | Output |
|------|--------|---------------|--------|
| **Full admin app** | `src/main.tsx` → `App.tsx` | `npm run build` | `dist/` — SPA with Chat + Files + nav |
| **Embeddable widget** | `src/widget/widget-entry.tsx` | `npm run build:widget` | `dist-widget/femibot-chat-widget.js` (+ copied to `wordpress-embed/`) |

The widget is a **chat-only** bundle (no Files page). Configuration is passed via `window.FEMIBOT_CONFIG` (see WordPress plugin).

---

## 4. Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 18, TypeScript |
| Build | Vite 5 |
| Routing | React Router 6 (`/`, `/chat`, `/files`) |
| HTTP | Axios |
| Styling | Tailwind CSS 3 + custom CSS in `src/index.css` |
| Markdown in chat | `react-markdown` + `remark-gfm` |
| State | React Context (`ChatContext`) + local `useState` on Files page |

**Node:** v18+ recommended.

---

## 5. Repository layout

```
Frontend/
├── KNOWLEDGE_TRANSFER.md     ← This file (start here for handoff)
├── README.md                 ← User-facing setup (partially outdated URLs)
├── ARCHITECTURE.md           ← Deep architecture notes
├── PROJECT_OVERVIEW.md       ← Feature checklist
├── MODEL_CONFIG.md           ← Gemini / VITE_AI_MODEL
├── ACTUAL_BACKEND_STRUCTURE.md ← Signed URLs in chat context (historical)
├── QUICKSTART.md, TESTING_GUIDE.md, FRONTEND_SPECIFICATION.md, ...
│
├── .env                      ← Local env (not committed; see §6)
├── package.json
├── vite.config.ts            ← Dev server port 3000
├── vite.widget.config.ts     ← Widget IIFE bundle
├── tailwind.config.js
│
├── src/
│   ├── main.tsx              ← SPA bootstrap
│   ├── App.tsx               ← Router + ChatProvider
│   ├── index.css             ← Tailwind + glass/animations
│   ├── components/
│   │   └── Navigation.tsx
│   ├── context/
│   │   └── ChatContext.tsx   ← Chat messages (in-memory only)
│   ├── pages/
│   │   ├── ChatPage.tsx      ← Hero + chat UI
│   │   └── FilesPage.tsx     ← Upload, list, delete, stats
│   ├── services/
│   │   └── api.ts            ← All backend HTTP calls
│   ├── types/
│   │   └── index.ts          ← TS interfaces matching API
│   ├── theme/
│   │   └── femigrants.ts     ← Brand colors (#582BB6)
│   └── widget/
│       ├── ChatWidget.tsx    ← Standalone floating chat
│       └── widget-entry.tsx  ← Mount + FEMIBOT_CONFIG
│
├── wordpress-embed/
│   ├── femibot-chat-widget.php   ← WP plugin (v1.3.0)
│   └── femibot-chat-widget.js    ← Built bundle (commit after build:widget)
│
└── dist-widget/              ← Widget build output (may exist locally)
```

---

## 6. Environment variables

Vite only exposes variables prefixed with `VITE_`.

Create `.env` in the project root (see existing `.env` on your machine):

```bash
VITE_API_BASE_URL=https://femigrants-chatbot-backend.vercel.app
VITE_AI_MODEL=gemini-2.5-flash
```

Optional (documented in `MODEL_CONFIG.md` but not required by code):

```bash
VITE_APP_NAME=Femibot AI Assistant
```

| Variable | Used in | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `src/services/api.ts` | Backend base URL for SPA |
| `VITE_AI_MODEL` | `api.ts`, `ChatPage.tsx` | Sent as `model` in `POST /chat`; shown in UI |

**Important:** After changing `.env`, restart `npm run dev`. For production, set these in the hosting provider (Vercel/Netlify env UI) before `npm run build`.

**Do not commit** API keys here — keys belong on the **backend**.

---

## 7. Getting started locally

```bash
cd Frontend
npm install
# Ensure .env points to a running backend (local or Vercel)
npm run dev
```

Open **http://localhost:3000** (redirects to `/chat`).

**Smoke test:**

1. Backend reachable: open Files page — list should load (or show alert if down).
2. Upload a PDF/TXT/DOCX on `/files`, wait until status is **Available**.
3. On `/chat`, click **Start Chatting**, ask a question, confirm reply.

Verify backend manually:

```bash
curl -s "$VITE_API_BASE_URL/files" | head
```

(Replace with your actual base URL.)

---

## 8. Application architecture

### SPA routing (`App.tsx`)

| Path | Component | Notes |
|------|-----------|--------|
| `/` | Redirect → `/chat` | |
| `/chat` | `ChatPage` | Wrapped in `ChatProvider` |
| `/files` | `FilesPage` | Same provider (chat state persists when switching tabs) |

### Data flow — chat

1. User sends message → `addMessage` (user) in `ChatContext`.
2. `chatContext` = last **10** messages `{ role, content }` (see `ChatPage.tsx` `handleSend`).
3. `POST /chat` with body: `{ message, chat_context, model }`.
4. Assistant reply appended to context; **response is plain text/markdown** in UI.

**Note:** API returns `context_used` (source chunks, scores, signed URLs). The SPA **currently does not** attach or render `context_used` on `ChatPage` (types support `contextUsed` on `Message`, but it is unused). Source viewing exists on **Files** page via **View** button only.

### Data flow — files

1. `FilesPage` loads `GET /files` and `GET /files/statistics` on mount.
2. Upload → `POST /files/upload` (multipart: `file`, optional `metadata` JSON string).
3. Delete / bulk delete → refresh list + stats.
4. **View** → `file.signed_url` if present, else `GET /files/{id}/view-url`.

---

## 9. Key source files (what to read first)

Read in this order for fastest onboarding:

1. **`src/services/api.ts`** — Single source of truth for all backend URLs and payloads.
2. **`src/types/index.ts`** — Contract with backend (`chat_context` naming, `ContextItem`, file statuses).
3. **`src/context/ChatContext.tsx`** — Global chat state (lost on full page refresh).
4. **`src/pages/ChatPage.tsx`** — Largest UI file; hero, chat panel, markdown, send logic.
5. **`src/pages/FilesPage.tsx`** — Upload, filters, bulk delete, `viewDocument`.
6. **`src/widget/ChatWidget.tsx`** + **`wordpress-embed/femibot-chat-widget.php`** — If maintaining embed.

---

## 10. Pages and user flows

### Chat page (`/chat`)

- **Welcome screen** when chat is closed: marketing hero, feature cards, **Start Chatting**.
- **Chat panel** when open: header (#582BB6), Clear, Minimize, message list, input (Enter send, Shift+Enter newline).
- **Example questions** populate input only (do not auto-send).
- **Floating button** if user minimized but has assistant messages.
- AI replies rendered with **ReactMarkdown**; `convertUrlsToMarkdown()` turns `Label: https://...` into clickable links.
- Character counter shown (2000) but **not enforced** in code — backend should validate.

### Files page (`/files`)

- Statistics: total files, storage MB, Available count, Processing count.
- Upload: `.pdf`, `.txt`, `.docx`, `.doc` (accept attribute); metadata `{ uploaded_at, category: 'general' }`.
- Client-side **search** (filename) and **status filter** (no server-side pagination).
- Per-file: checkbox, View, info alert, Delete; bulk delete for selection.
- Status values: `Available` | `Processing` | `Failed` — must match backend exactly.

---

## 11. API integration

All calls go through `src/services/api.ts`.

**Base URL:** `import.meta.env.VITE_API_BASE_URL || 'https://femigrants-chatbot-backend.vercel.app'`

### Critical naming

The backend expects **`chat_context`** (snake_case), not `chatContext`. Wrong field name = broken multi-turn context.

### Endpoints used

| Method | Path | Used by | Purpose |
|--------|------|---------|---------|
| POST | `/chat` | Chat, Widget | `{ message, chat_context, model }` → `{ response, context_used }` |
| POST | `/files/upload` | Files | multipart `file` + optional `metadata` |
| GET | `/files` | Files | List files; optional `filter_metadata` query |
| GET | `/files/{id}` | api helper | File detail; `include_url` param |
| DELETE | `/files/{id}` | Files | Single delete |
| POST | `/files/bulk-delete` | Files | `{ file_ids: string[] }` |
| GET | `/files/statistics` | Files | Dashboard stats |
| GET | `/files/by-status/{status}` | api helper | Not used in UI currently |
| GET | `/files/{id}/view-url` | Files | Fallback signed URL for View |
| POST | `/documents/search` | api helper | Not used in UI currently |
| GET | `/documents/preview/{id}` | api helper | Not used in UI currently |

### Chat request example

```json
{
  "message": "What is your mission?",
  "chat_context": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "model": "gemini-2.5-flash"
}
```

### Signed URLs (documents)

Backend may return signed URLs in several shapes (see `ACTUAL_BACKEND_STRUCTURE.md`):

- `context.reference.file.signed_url` (common in chat `context_used`)
- `file.signed_url` on file list objects
- Fallback: `GET /files/{file_id}/view-url`

`FilesPage.viewDocument()` implements file-list viewing; chat citations UI was not wired in the current `ChatPage`.

### CORS

Frontend origin must be allowed by the backend. Local dev: `http://localhost:3000`. Production: your deployed frontend URL. Widget on WordPress: the **site origin** must be allowed.

---

## 12. State management

### `ChatContext` (global, SPA only)

- `messages: Message[]` — in memory; **cleared on browser refresh**.
- `isLoading` — disables input during API call.
- `clearMessages()` — header Clear button.

Widget (`ChatWidget.tsx`) keeps its **own** local state (does not use `ChatContext`).

### `FilesPage` (local state)

- `files`, `stats`, `selectedFiles`, `searchTerm`, `filterStatus`
- Loading flags: `loading`, `uploading`, `deletingFileId`, `bulkDeleting`

No Redux, no React Query, no persistence layer.

---

## 13. Branding and styling

**Primary brand purple:** `#582BB6` (also `primaryDark` `#452094`, light `#7B52C9`)

Defined in:

- `src/theme/femigrants.ts`
- `tailwind.config.js` (`primary` scale)
- Hard-coded in some `ChatPage` header/button classes

**Fonts:** Poppins referenced in headings; widget injects Inter via Google Fonts.

**Utility classes:** `glass`, `gradient-text`, animations (`animate-float`, `animate-fadeIn`, etc.) in `index.css`.

To rebrand: update `femigrants.ts`, Tailwind `primary` palette, and search for `#582BB6` / `582BB6`.

---

## 14. WordPress embed widget

### Build and sync

```bash
npm run build:widget
```

This runs Vite with `vite.widget.config.ts`, outputs `dist-widget/femibot-chat-widget.js`, and **copies** it to `wordpress-embed/femibot-chat-widget.js`.

**Always commit both** the PHP plugin and the JS bundle together when releasing widget changes (see git message: *"Sync WordPress embed bundle..."*).

### WordPress installation (summary)

1. Folder `wp-content/plugins/femibot-chat-widget/`
2. Files: `femibot-chat-widget.php` + `femibot-chat-widget.js`
3. Activate plugin
4. Edit `$config` in PHP: **`apiBaseUrl`**, colors, example questions

Plugin sets `window.FEMIBOT_CONFIG` before loading the script; `widget-entry.tsx` reads it.

### Widget vs SPA differences

| Feature | SPA | Widget |
|---------|-----|--------|
| Files management | Yes | No |
| Chat | Yes | Yes |
| Config | `.env` | `FEMIBOT_CONFIG` / PHP |
| API client | `services/api.ts` | Inline axios in `ChatWidget.tsx` |

When fixing chat bugs, check **both** `ChatPage.tsx` and `ChatWidget.tsx` (logic can drift).

---

## 15. Build, deploy, and scripts

| Script | Command | Output |
|--------|---------|--------|
| Dev | `npm run dev` | Port **3000** |
| Production SPA | `npm run build` | `dist/` |
| Preview SPA | `npm run preview` | Serves `dist/` |
| Lint | `npm run lint` | ESLint strict (0 warnings) |
| Widget | `npm run build:widget` | `dist-widget/` + copy to `wordpress-embed/` |

### Typical SPA deployment

1. Set `VITE_API_BASE_URL` and `VITE_AI_MODEL` in CI/hosting env.
2. `npm run build`
3. Publish **`dist/`** to static host (Netlify, Vercel, S3+CloudFront, etc.)
4. Ensure backend CORS includes production frontend URL.

### `.gitignore`

`node_modules`, `dist`, `dist-ssr` are ignored. **`wordpress-embed/femibot-chat-widget.js` is tracked** intentionally for WordPress installs without a build step.

---

## 16. Known limitations and gaps

| Area | Current state |
|------|----------------|
| Authentication | None |
| Chat persistence | Lost on refresh; no localStorage |
| Source citations in chat UI | API returns `context_used`; **not displayed** in `ChatPage` |
| `Message.contextUsed` | Typed but unused in chat flow |
| File preview in chat | Not implemented (only Files → View) |
| Drag-and-drop upload | UI copy mentions it; only `<input type="file">` works |
| Real-time processing updates | No polling/WebSocket; user must Refresh |
| Pagination | All files loaded at once |
| Error UX | Mostly `alert()` + `console.error` |
| Nav “Online” indicator | Static UI, not health-checked |
| Input length | Display 2000 chars, no hard limit in code |
| Security | Relies on backend; use HTTPS in production |

### Possible next tasks (product/engineering)

- Show `context_used` with “View source” in chat (types + `ACTUAL_BACKEND_STRUCTURE.md` already describe shapes).
- Add auth if admin/files should be protected.
- Poll file status while `Processing`.
- Share chat logic between `ChatPage` and `ChatWidget` to avoid duplication.
- Replace `alert()` with toast component.

---

## 17. Troubleshooting

| Symptom | Likely cause | What to do |
|---------|----------------|------------|
| Failed to load files | Backend down or CORS | Check URL in `.env`, `curl` backend, backend CORS logs |
| Chat generic error message | Backend error or no indexed docs | Upload files; ensure status **Available** |
| Upload fails | Format/size/backend storage | Check network tab; backend logs |
| View document 404 | `/view-url` missing on backend | Use `signed_url` on file object; see console in `viewDocument` |
| Widget works locally, not on WP | Old JS cache, wrong `apiBaseUrl` | Bump plugin version, hard refresh, verify `FEMIBOT_CONFIG` |
| Env change has no effect | Vite cache | Restart dev server; rebuild for prod |
| Port in use | Default 3000 | Change `vite.config.ts` `server.port` |

**Browser debugging:** Network tab → `/chat` and `/files` requests; confirm `chat_context` payload and response shape.

---

## 18. Other documentation in this repo

| File | Use when |
|------|----------|
| `README.md` | General overview (note: mentions `localhost:8000` default; code defaults to Vercel URL) |
| `ARCHITECTURE.md` | Diagrams, data flows, scaling notes |
| `PROJECT_OVERVIEW.md` | Feature completion checklist |
| `MODEL_CONFIG.md` | Gemini model and backend expectations |
| `ACTUAL_BACKEND_STRUCTURE.md` | Signed URL nesting in `context_used` |
| `QUICKSTART.md` | Short setup steps |
| `TESTING_GUIDE.md` | Manual QA |
| `FRONTEND_SPECIFICATION.md` | Original product spec |
| `DESIGN_FEATURES.md`, `UI_UPGRADE_SUMMARY.md` | UI history |

**This KT doc is the single handoff entry point;** use the others as deep dives.

---

## 19. Handoff checklist for the new developer

### Access

- [ ] GitHub: `femigrants-tech/chatbot-frontend` (SSH remote `github-femigrants` on original machine — reconfigure as needed)
- [ ] Backend repo + Vercel (or other) deployment access
- [ ] Google/Gemini API keys (backend only)
- [ ] WordPress admin (if maintaining embed)
- [ ] Production/staging URLs for frontend and backend

### Local setup

- [ ] Node 18+ installed
- [ ] `npm install` succeeds
- [ ] `.env` created with correct `VITE_API_BASE_URL`
- [ ] `npm run dev` — chat + files work end-to-end

### Understand

- [ ] Read `src/services/api.ts` and `src/types/index.ts`
- [ ] Trace one chat message and one file upload in DevTools
- [ ] Know difference between SPA build and `build:widget`
- [ ] Know chat context uses last 10 messages and field name `chat_context`

### Deploy / release

- [ ] Know where production frontend is hosted
- [ ] Know how to set `VITE_*` on hosting provider
- [ ] After widget changes: `npm run build:widget` and deploy PHP + JS together

### Outstanding from previous owner (fill in)

- [ ] Production frontend URL: _______________
- [ ] Production backend URL: _______________
- [ ] WordPress site(s) using widget: _______________
- [ ] Open bugs / client requests: _______________

---

## 20. Contacts and access (fill in)

| Role | Name | Contact |
|------|------|---------|
| Previous frontend owner | | |
| Backend owner | | |
| DevOps / hosting | | |
| Product / Femigrants stakeholder | | |

---

## Quick reference — commands

```bash
npm install
npm run dev              # SPA at http://localhost:3000
npm run build            # Production SPA → dist/
npm run build:widget     # WordPress bundle → wordpress-embed/
npm run lint
npm run preview
```

---

**End of knowledge transfer document.**  
For questions about API contracts, coordinate with the **backend team**; this frontend is a thin client over that API.
