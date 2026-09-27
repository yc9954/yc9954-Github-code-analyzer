<h1 align="center">GitHub Code Analyzer</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React%2018-Vite%206-4493F8?style=flat" alt="React 18 on Vite 6" />
  <img src="https://img.shields.io/badge/Tailwind%204-shadcn%2Fui-4493F8?style=flat" alt="Tailwind 4 and shadcn/ui" />
  <img src="https://img.shields.io/badge/API-Next.js%2016-4493F8?style=flat" alt="Next.js 16 API layer" />
  <img src="https://img.shields.io/badge/backend-SprintGit%20API-4493F8?style=flat" alt="SprintGit backend" />
</p>

<p align="center">
  <strong>Developer analytics for GitHub teams: repositories, commits, sprints and rankings in one dashboard.</strong><br/>
  A Vite + React front end for the SprintGit service. Sign in with GitHub, sync your repositories,<br/>
  read AI reviews of individual commits, and run team sprints with live leaderboards.
</p>

<h3 align="center"><a href="#getting-started"><ins>Getting started</ins></a></h3>

## Features

- **GitHub login with token refresh.** Login redirects to the SprintGit OAuth flow (`/oauth2/authorization/github`); `AuthCallback` stores the access and refresh tokens, and `src/lib/api.ts` retries a request once after a silent refresh on `401`.
- **Dashboard.** Personal stats and recent commits from `/api/users/me/dashboard` and `/api/users/me/commits/recent`. The client also captures the `X-RateLimit-*` headers on every response.
- **Repositories.** Lists the signed-in user's repositories, their branches and metrics, and triggers a background `POST /api/repos/{id}/sync`.
- **Commits with an AI reviewer.** Browse commits per branch, select one, and chat about it. The `server/` chat route sends the selected commit to OpenAI (`gpt-4o-mini`) with a fixed review rubric: message quality, code quality, functionality, documentation and tests, scored out of 100.
- **Sprints and rankings.** Create a sprint, register a team, approve or ban registrations, and watch the sprint ranking. `/ranking` shows global user and commit rankings.
- **Teams.** Create a team, request to join, approve members, and attach repositories from the ones the team's members own.
- **Search.** One search box for repositories (GitHub search API) and for teams or sprints (SprintGit).

**Also included**

- **`api-docs-v3.json`**: the OpenAPI document for the SprintGit backend (`GitHub Analyzer API v1.0.0`), the source of truth for every endpoint the client calls.
- **`verify_api.sh`**: a curl-based smoke test of the public and authenticated endpoints on `https://api.sprintgit.com`.
- **`backend-callback-redirect.html`**: the static page the backend redirects to after OAuth; it forwards tokens (or a GitHub App `installation_id`) to the front end on `localhost:5173`.

---

## How it works

```text
Browser (Vite + React 18, react-router 7)
   │  src/lib/api.ts  — Bearer token, refresh-on-401, rate-limit capture
   │
   ├── VITE_API_URL unset ──────────────▶ https://api.sprintgit.com   (SprintGit backend, not in this repo)
   │
   └── VITE_API_URL=http://localhost:3000
                 ▼
        server/ (Next.js 16 route handlers, CORS for :5173)
          ├─ /api/sprints, /api/teams, /api/users/me, /api/rankings … ──▶ proxied to api.sprintgit.com
          ├─ /api/search, /api/repositories/{owner}/{repo}/commits ─────▶ GitHub REST API (GITHUB_TOKEN)
          └─ /api/chat ───────────────────────────────────────────────▶ OpenAI chat completions
```

1. **Sign in.** `LoginPage` sends the browser to the SprintGit GitHub OAuth endpoint. The callback lands on `/auth/callback`, which stores `accessToken` and `refreshToken` in `localStorage` and loads the profile into `UserContext`.
2. **Call the API.** Every page goes through `apiCall()` in `src/lib/api.ts`. It unwraps the `{ status, data }` envelope, records `X-RateLimit-*` headers, and on a `401` refreshes the token once and replays the request.
3. **Optionally route through `server/`.** The Next.js app mirrors the SprintGit paths and forwards them with the caller's `Authorization` header, adds a server-side `GITHUB_TOKEN` for GitHub search and commit listing, and hosts the OpenAI-backed `/api/chat`.

---

## Tech stack

<p>
  <kbd>React&nbsp;18</kbd> &nbsp; <kbd>TypeScript</kbd> &nbsp; <kbd>Vite&nbsp;6</kbd> &nbsp; <kbd>react-router&nbsp;7</kbd> &nbsp; <kbd>Tailwind&nbsp;4</kbd> &nbsp; <kbd>shadcn/ui&nbsp;+&nbsp;Radix</kbd> &nbsp; <kbd>MUI&nbsp;7</kbd> &nbsp; <kbd>Recharts</kbd> &nbsp; <kbd>d3</kbd> &nbsp; <kbd>motion</kbd> &nbsp;
  <kbd>Next.js&nbsp;16</kbd> &nbsp; <kbd>OpenAI&nbsp;API</kbd> &nbsp; <kbd>GitHub&nbsp;REST&nbsp;API</kbd>
</p>

---

## Getting started

**Prerequisites**

- Node.js and npm.
- For the local API layer: a GitHub personal access token (`public_repo`, or `repo` for private repositories) and an OpenAI API key. Without a GitHub token, GitHub search is limited to 60 requests per hour per IP; with one, 5,000.

```bash
git clone https://github.com/yc9954/yc9954-Github-code-analyzer.git
cd yc9954-Github-code-analyzer

npm install                    # front end
npm --prefix server install    # Next.js API layer

# server/.env
#   GITHUB_TOKEN=...
#   OPENAI_API_KEY=...
# .env (optional, root) — point the UI at the local API layer instead of api.sprintgit.com
#   VITE_API_URL=http://localhost:3000

npm run dev                    # concurrently: vite (5173) + next dev (3000)
```

| Process | Port | Notes |
| --- | --- | --- |
| Vite dev server (`npm run dev:frontend`) | `5173` | `host: true`, opens the browser automatically |
| Next.js API (`npm run dev:backend`) | `3000` | CORS allows `localhost:5173` and `localhost:3000` only |

| Variable | Where | What it does |
| --- | --- | --- |
| `VITE_API_URL` | root `.env` | Base URL for `src/lib/api.ts`. Defaults to `https://api.sprintgit.com`. |
| `GITHUB_TOKEN` | `server/.env` | Sent to the GitHub REST API from the search and commit routes. |
| `OPENAI_API_KEY` | `server/.env` | Required by `POST /api/chat`. |

To check that the hosted backend is reachable: `./verify_api.sh [accessToken]`.

---

## Building and testing

```bash
npm run build                  # vite build → dist/
npm --prefix server run build  # next build
npm --prefix server run lint   # eslint (server only)
npm run clean:cache            # drop node_modules/.vite when HMR gets confused
```

There is no test suite and no CI workflow.

---

## Screens

| Route | What it does |
| --- | --- |
| `/` | Landing page. |
| `/login`, `/auth/callback` | GitHub OAuth entry and token hand-off. |
| `/dashboard` | Personal stats and recent commits. |
| `/repository` | Repository list, branches, metrics, sync. |
| `/commits` | Commit browser with the AI chat panel. |
| `/sprint` (`/ranking` redirects here) | Sprint list, details, registrations and rankings. |
| `/teams`, `/teams/:teamId` | Team directory, membership and repositories. |
| `/search` | Repositories, teams and sprints. |
| `/settings` | Profile editing and account withdrawal. |

---

## Repository structure

| Path | What lives there |
| --- | --- |
| `src/app/App.tsx` | Router and `UserProvider`. |
| `src/app/pages/` | One file per screen listed above. |
| `src/app/components/` | `DashboardLayout`, `Sidebar`, `TopBar`, landing sections, and `ui/` (shadcn/ui primitives, chart, chat input). |
| `src/lib/api.ts` | Typed client for the whole SprintGit contract: auth, users, repos, commits, sprints, rankings, teams, notifications. |
| `server/` | Next.js 16 API layer: `app/api/**/route.ts` handlers and `middleware.ts` (CORS). Its own `README.md` covers token setup. |
| `api-docs-v3.json` | OpenAPI 3 spec of the SprintGit backend. |
| `verify_api.sh` | Endpoint smoke test against `api.sprintgit.com`. |
| `backend-callback-redirect.html` | OAuth callback bridge page. |
| `guidelines/`, `ATTRIBUTIONS.md` | Figma Make export notes and third-party credits. |

---

## Project status

**Working today.** The UI covers login, dashboard, repositories, commits, sprints, rankings, teams, search and settings against the hosted SprintGit API. The client handles token refresh and rate-limit display. The Next.js layer proxies sprint, team, user and ranking calls and adds GitHub search and the OpenAI chat route.

**Not in this repo.** The SprintGit backend itself (`https://api.sprintgit.com`, described by `api-docs-v3.json`). If that service is down, only the GitHub and OpenAI routes in `server/` work.

**Placeholder data.** `server/app/api/repositories/route.ts` returns five hard-coded sample repositories instead of calling GitHub. The quality bars on the Commits page (Maintainability, Complexity, Duplication, Coverage) are constants in `CommitsPage.tsx`, not measurements. The last integration commit is labelled "frontend api connection 70%".

**Origin.** The UI was exported from Figma Make ([SaaS Developer Analytics UI](https://www.figma.com/design/rn4hQiMl986ZUFuh5E7hdr/SaaS-Developer-Analytics-UI)). It includes components from [shadcn/ui](https://ui.shadcn.com/) (MIT) and photos from [Unsplash](https://unsplash.com); see `ATTRIBUTIONS.md`.

---

## License

No LICENSE file is committed yet, so default copyright applies: all rights reserved.
