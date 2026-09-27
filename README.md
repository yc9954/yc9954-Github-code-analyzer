<h1 align="center">GitHub Code Analyzer</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React%2018-Vite%206-4493F8?style=flat" alt="React 18 on Vite 6" />
  <img src="https://img.shields.io/badge/Tailwind%204-shadcn%2Fui-4493F8?style=flat" alt="Tailwind 4 and shadcn/ui" />
  <img src="https://img.shields.io/badge/API-Next.js%2016-4493F8?style=flat" alt="Next.js 16 API layer" />
  <img src="https://img.shields.io/badge/backend-SprintGit%20API-4493F8?style=flat" alt="SprintGit backend" />
</p>

<p align="center">
  <strong>AI-scored commits, sprint leaderboards and team dashboards for GitHub repositories.</strong><br/>
  GitHub Code Analyzer is the web client (plus a thin Next.js proxy) for the SprintGit platform. Sign in with GitHub,<br/>
  connect repositories, ask an AI reviewer about any commit, and run time-boxed sprints where teams compete on<br/>
  commit scores. Rankings roll up per user, per team and per sprint.
</p>

<h3 align="center"><a href="#getting-started"><ins>Getting started</ins></a> · <a href="#api-reference">API reference</a></h3>

<p align="center">
  <img src="docs/screenshots/overview.png" alt="Six screens of GitHub Code Analyzer: landing page, commits with the AI assistant, dashboard globe, sprint rankings, team detail and search" width="960" />
</p>

## Features

<table>
<tr>
<td width="50%" valign="middle">

### Pick a repository, ask a question

After sign-in you land on `/repository`. Type a question, choose one of the repositories linked to your account (`GET /api/users/me/repositories`) and a branch. Picking a repository loads its branches from the GitHub API and queues a background `POST /api/repos/{owner/repo}/sync` on the backend; the choice is carried into the Commits view.

</td>
<td width="50%">
  <img src="docs/screenshots/repository.png" alt="The repository page: a prompt box asking What can I help you ship, with Repository and Branch pickers below it" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### An AI reviewer per commit

The Commits view lists commits for the branch with author, time and status, next to a language breakdown. Select a commit and ask; the request goes to the `server/` chat route, which sends the commit context to OpenAI (`gpt-4o-mini`) with a fixed rubric: total score out of 100, sub-scores for message quality, code quality, functionality, documentation and tests, then strengths, issues, a suggested next commit and a risk level.

</td>
<td width="50%">
  <img src="docs/screenshots/commit-analysis.png" alt="Commits page with a selected commit and the assistant's rendered review: total score, summary, strengths, issues and next step" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Sprints with live leaderboards

Browse public sprints, the ones you joined, the ones you manage and pending requests. Create a sprint, register a team with a repository, and as a manager approve, reject or ban registrations. The ranking view (`GET /api/sprints/{id}/ranking?type=TEAM|INDIVIDUAL`) shows the team or individual leaderboard; `/ranking` adds global user and top-commit rankings with period filters.

</td>
<td width="50%">
  <img src="docs/screenshots/sprint-ranking.png" alt="Sprint Rankings: a team leaderboard with rank, score, commits and members" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Teams that own repositories

Create public or private teams, join with a team id, approve pending members, and attach repositories. The detail page shows per-repository commit count, total score and average score, and a member table with role, commits and contribution.

</td>
<td width="50%">
  <img src="docs/screenshots/team-detail.png" alt="Team detail for Code Warriors: pending join request, two team repositories with metrics, and the member contribution table" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### A globe of activity

The dashboard draws a D3 wireframe globe. Blue dots are sprints, orange dots are detected issues; drag to rotate, scroll to zoom, click a dot for details. Data comes from `/api/users/me/dashboard`, `/api/sprints/my` and `/api/users/me/commits/recent`.

</td>
<td width="50%">
  <img src="docs/screenshots/dashboard.png" alt="Dashboard page with a rotating dotted wireframe globe and orange and blue event dots" width="100%" />
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### One search for everything

Integrated search across repositories, users, teams and sprints with language checkboxes and sort order. Repository queries hit the GitHub search API; team and sprint queries go to SprintGit.

</td>
<td width="50%">
  <img src="docs/screenshots/search.png" alt="Search page with repository and user filters, language checkboxes and three repository results" width="100%" />
</td>
</tr>
</table>

**Also included**

- **GitHub OAuth sign-in** with a stored access/refresh token pair and silent refresh on `401` (`src/lib/api.ts` retries the request once after refreshing).
- **Notifications tray** in the top bar backed by `GET /api/notifications` and `PUT /api/notifications/{id}/read`.
- **Profile and settings**: GitHub-synced profile, editable company and location, notification preferences, participating sprints, and account withdrawal.
- **`api-docs-v3.json`**: the OpenAPI document of the SprintGit backend (`GitHub Analyzer API v1.0.0`); **`verify_api.sh`**: a curl smoke test of its public and authenticated endpoints; **`backend-callback-redirect.html`**: a static OAuth callback page that forwards tokens (or a GitHub App `installation_id`) to the front end.

All screenshots were taken from the running Vite dev server at 1440×900 with API responses stubbed at the network layer, so the data shown is representative, not live.

---

## How it works

```text
Browser (Vite + React 18, react-router 7)
   │  src/lib/api.ts — Bearer token, refresh-on-401, rate-limit capture
   │
   ├── VITE_API_URL unset ──────────────▶ https://api.sprintgit.com   (SprintGit backend, not in this repo)
   │
   ├── VITE_API_URL=http://localhost:3000
   │             ▼
   │    server/ (Next.js 16 route handlers, CORS for :5173)
   │      ├─ /api/sprints, /api/teams, /api/users/me, /api/rankings, /api/notifications, /api/repos/*/metrics
   │      │        └──▶ proxied to api.sprintgit.com with the caller's Authorization header
   │      ├─ /api/search, /api/repositories/{owner}/{repo}/{branches,commits} ──▶ GitHub REST API (GITHUB_TOKEN)
   │      └─ /api/chat ──▶ OpenAI chat completions (OPENAI_API_KEY)
   │
   └── GET https://api.github.com/repos/{owner}/{repo}/branches  (direct, optional VITE_GITHUB_TOKEN)
```

1. **Sign in.** `LoginPage` redirects to `https://api.sprintgit.com/oauth2/authorization/github`. The backend sends the browser back to `/auth/callback?accessToken=…&refreshToken=…`; `AuthCallback` stores both in `localStorage` and goes to `/repository`. It also handles the GitHub App installation return (`type=installation&installation_id=…`). `DashboardLayout` guards every authenticated route and `UserContext` loads `GET /api/users/me` once.
2. **Call the API.** Every page goes through `apiCall()`, which unwraps the `{ status, message, data }` envelope, records `X-RateLimit-*` headers, and on `401` posts `/api/auth/refresh` once and replays queued requests.
3. **Analyze.** Analysis is asynchronous on the backend: commits carry `analysisStatus` (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) and the API exposes `/commits/{sha}/status` and `/commits/{sha}/analysis`. The chat panel in this client uses the OpenAI route in `server/`.
4. **Optionally route through `server/`.** The Next.js app mirrors the SprintGit paths, forwards them with your token, adds GitHub search and commit listing with a server-side token, and hosts the chat route.

<details>
<summary><strong>Routes</strong></summary>

| Path | Page | Auth |
| --- | --- | --- |
| `/` | Landing | no |
| `/login` | GitHub sign-in | no |
| `/auth/callback` | Token hand-off | no |
| `/repository` | Repository and branch picker with prompt | yes |
| `/commits` | Commit list and AI assistant | yes |
| `/dashboard` | Globe dashboard | yes |
| `/sprint` | Sprints (`?mode=list\|participate\|ranking\|create\|manage&sprintId=`) | yes |
| `/ranking` | Redirects to `/sprint?view=ranking` | yes |
| `/search` | Integrated search (`?q=`) | yes |
| `/teams`, `/teams/:teamId` | Teams and team detail | yes |
| `/settings` | Profile and settings | yes |

</details>

---

## Tech stack

<p>
  <kbd>React&nbsp;18</kbd> &nbsp; <kbd>TypeScript</kbd> &nbsp; <kbd>Vite&nbsp;6</kbd> &nbsp; <kbd>react-router&nbsp;7</kbd> &nbsp; <kbd>Tailwind&nbsp;4</kbd> &nbsp; <kbd>shadcn/ui&nbsp;+&nbsp;Radix</kbd> &nbsp; <kbd>MUI&nbsp;7</kbd> &nbsp; <kbd>d3&nbsp;7</kbd> &nbsp; <kbd>Recharts</kbd> &nbsp; <kbd>motion</kbd> &nbsp; <kbd>react-hook-form</kbd> &nbsp; <kbd>sonner</kbd> &nbsp;
  <kbd>Next.js&nbsp;16</kbd> &nbsp; <kbd>React&nbsp;19&nbsp;(server)</kbd> &nbsp; <kbd>OpenAI&nbsp;API</kbd> &nbsp; <kbd>GitHub&nbsp;REST&nbsp;API</kbd> &nbsp; <kbd>SprintGit&nbsp;REST&nbsp;API</kbd>
</p>

---

## Getting started

**Prerequisites**

- Node.js 20 or newer and npm.
- A GitHub account (sign-in is GitHub OAuth only; the email/password fields on the login page start the same flow).
- Optional, for the local proxy routes: a GitHub personal access token (`public_repo`, or `repo` for private repositories) and an OpenAI API key. Without a GitHub token, GitHub search is limited to 60 requests per hour per IP; with one, 5,000.

```bash
git clone https://github.com/yc9954/yc9954-Github-code-analyzer.git
cd yc9954-Github-code-analyzer

npm install                    # front end
npm --prefix server install    # Next.js API layer

cp .env.example .env           # VITE_API_URL, VITE_GITHUB_TOKEN
# server/.env.local (not committed):
#   GITHUB_TOKEN=...
#   OPENAI_API_KEY=...

npm run dev                    # concurrently: vite (5173) + next dev (3000)
```

Open the front end, click **Get Started**, sign in with GitHub, and you are redirected to `/repository`.

| Process | Port | Notes |
| --- | --- | --- |
| Vite dev server (`npm run dev:frontend`) | `5173` | `host: true`; falls back to the next free port |
| Next.js API (`npm run dev:backend`) | `3000` | CORS allows `localhost:5173` and `localhost:3000` only |

If you change the front-end port, add it to `allowedOrigins` in `server/middleware.ts` and to `FRONTEND_URL` in `backend-callback-redirect.html`.

| Variable | Where | Default | What it does |
| --- | --- | --- | --- |
| `VITE_API_URL` | root `.env` | `https://api.sprintgit.com` | Base URL for `src/lib/api.ts`. Set to `http://localhost:3000` to go through the local proxy. |
| `VITE_GITHUB_TOKEN` | root `.env` | none | Token for the direct GitHub branches call. |
| `GITHUB_TOKEN` | `server/.env.local` | none | Used by the GitHub search and commit routes. |
| `OPENAI_API_KEY` | `server/.env.local` | none | Required by `POST /api/chat`; the route returns 500 with a clear message when missing. |

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

## API reference

Summarised from [`api-docs-v3.json`](api-docs-v3.json) (OpenAPI 3.1, "GitHub Analyzer API" v1.0.0, server `https://api.sprintgit.com`). All endpoints except the OAuth entry points expect `Authorization: Bearer <accessToken>`; responses are wrapped as `{ "status": "success", "message": "...", "data": ... }`. `repoId` is `owner/repo`, URL-encoded by the client.

<details>
<summary><strong>SprintGit endpoints</strong></summary>

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/oauth2/authorization/github` | Start GitHub OAuth (browser redirect) |
| GET | `/api/auth/github/installation` | GitHub App installation return handler |
| POST | `/api/auth/refresh` | Exchange a refresh token for a new token pair |
| POST | `/api/auth/logout` | Invalidate the refresh token |
| GET / PUT / DELETE | `/api/users/me` | My profile; update company, location, notification settings; withdraw |
| GET | `/api/users/me/dashboard` | Streak, total commits, total score, active sprints |
| GET | `/api/users/me/repositories` | Repositories linked to my account |
| GET | `/api/users/me/commits/recent` | My recent commits |
| GET | `/api/users/me/activities/heatmap` | Commit heatmap data |
| GET | `/api/users/{username}/profile` | Public profile (badges, tier, sprints) |
| GET | `/api/users/{userId}/repositories/{repoId}/commits` | Commits by a user in a repository |
| GET | `/api/repos/{repoId}` | Repository details and language stats |
| GET | `/api/repos/{repoId}/metrics` | Commit count, average score, total score |
| GET | `/api/repos/{repoId}/contributors` | Contributors ordered by commits/score |
| POST | `/api/repos/{repoId}/sync` | Queue an asynchronous sync from GitHub |
| GET | `/api/repos/{repoId}/commits` | Recent commits with analysis status and score |
| GET | `/api/repos/{repoId}/commits/{sha}/status` | Analysis status |
| GET | `/api/repos/{repoId}/commits/{sha}/analysis` | Full AI analysis result |
| POST | `/api/webhooks/github` | GitHub webhook receiver |
| GET / POST | `/api/sprints` | Public sprints (paginated); create a sprint |
| GET | `/api/sprints/my` | Sprints I joined or manage |
| PUT | `/api/sprints/{sprintId}` | Update a sprint (manager) |
| GET | `/api/sprints/{sprintId}/ranking` | Team or individual ranking (`type=TEAM\|INDIVIDUAL`) |
| POST | `/api/sprints/{sprintId}/registration` | Register a team and repository (team leader) |
| POST | `/api/sprints/{sprintId}/registrations/{teamId}/approve` | Approve or reject a registration (manager) |
| POST | `/api/sprints/{sprintId}/registrations/{teamId}/ban` | Ban a team (manager) |
| POST | `/api/teams` | Create a team (creator becomes leader) |
| GET / PUT | `/api/teams/{teamId}` | Team details; update name, description, visibility |
| GET | `/api/teams/{teamId}/members` | Members with rank, commit count and contribution |
| POST | `/api/teams/{teamId}/join` | Request to join |
| POST | `/api/teams/{teamId}/approve` | Approve a pending member (leader) |
| DELETE | `/api/teams/{teamId}/members/{userId}` | Remove a member (leader) |
| GET | `/api/search` | Integrated search (`q`, `type=ALL\|USER\|REPOSITORY\|TEAM\|SPRINT\|COMMIT`, `language`, `sort`) |
| GET | `/api/rankings/users`, `/api/rankings/commits` | Top users / top commits (`scope`, `period`, `limit`) |
| GET | `/api/notifications`, `/api/notifications/stream` | Notification history; server-sent events |
| PUT | `/api/notifications/{id}/read` | Mark a notification read |

</details>

<details>
<summary><strong>Local proxy routes (<code>server/app/api</code>)</strong></summary>

The Next.js server mirrors most of the paths above under `http://localhost:3000/api/...` and forwards them to SprintGit with the caller's `Authorization` header. Routes that do something else:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/search?q=&type=repositories&language=&sort=` | GitHub repository search (uses `GITHUB_TOKEN`); `type=TEAM\|SPRINT` is forwarded to SprintGit |
| GET | `/api/repositories` | Placeholder: returns five hard-coded sample repositories (the GitHub call is commented out) |
| GET | `/api/repositories/{owner}/{repo}/branches` | Branch list from the GitHub API |
| GET | `/api/repositories/{owner}/{repo}/commits?branch=` | Commit list from the GitHub API (max 20 per page) |
| POST | `/api/chat` | OpenAI `gpt-4o-mini` code review with commit context (uses `OPENAI_API_KEY`) |

</details>

---

## Repository structure

| Path | What lives there |
| --- | --- |
| `src/app/App.tsx` | Router and `UserProvider`. |
| `src/app/pages/` | Landing, Login, AuthCallback, Repository, Commits, Dashboard, Sprint, Ranking, Search, Team, TeamDetail, Settings. |
| `src/app/components/` | `DashboardLayout` (auth guard), `Sidebar`, `TopBar`, `ResponsiveHeroBanner`, and `ui/` (shadcn/ui primitives, chat input, wireframe globe, activity dropdown). |
| `src/app/contexts/UserContext.tsx` | Loads `GET /api/users/me` once; exposes `user`, `refreshProfile`, `logout`. |
| `src/lib/api.ts` | Typed client for the whole SprintGit contract, token refresh, rate-limit tracking. |
| `server/` | Next.js 16 API layer: `app/api/**/route.ts` handlers and `middleware.ts` (CORS). Its own `README.md` covers token setup. |
| `api-docs-v3.json` | OpenAPI 3.1 spec of the SprintGit backend. |
| `verify_api.sh` | Endpoint smoke test against `api.sprintgit.com`. |
| `backend-callback-redirect.html` | OAuth callback bridge page. |
| `docs/screenshots/` | Screenshots used in this README. |
| `.env.example`, `guidelines/`, `ATTRIBUTIONS.md`, `debug_jsx.py` | Front-end env template, Figma Make guidelines, third-party credits, a JSX nesting helper. |

---

## Project status

**Working today.** Login, repository picker, commits with the OpenAI chat reviewer, dashboard globe, sprints and rankings, teams, search, notifications and settings against the hosted SprintGit API. The client handles token refresh and rate-limit display. The Next.js layer proxies sprint, team, user, ranking and notification calls and adds GitHub search, branch and commit listing and the chat route.

**Not in this repo.** The SprintGit backend itself (`https://api.sprintgit.com`, described by `api-docs-v3.json`). If that service is down, only the GitHub and OpenAI routes in `server/` work.

**Placeholder data.** `server/app/api/repositories/route.ts` returns five hard-coded sample repositories instead of calling GitHub. The quality bars on the Commits page (Maintainability, Complexity, Duplication, Coverage) are constants in `CommitsPage.tsx`, not measurements. `getCommitAnalysis` and `getMyHeatmap` exist in the client but no page calls them yet. The last integration commit is labelled "frontend api connection 70%".

**Origin.** The UI was exported from Figma Make ([SaaS Developer Analytics UI](https://www.figma.com/design/rn4hQiMl986ZUFuh5E7hdr/SaaS-Developer-Analytics-UI)). It includes components from [shadcn/ui](https://ui.shadcn.com/) (MIT) and photos from [Unsplash](https://unsplash.com); see `ATTRIBUTIONS.md`.

---

## License

No LICENSE file is committed yet, so default copyright applies: all rights reserved.
