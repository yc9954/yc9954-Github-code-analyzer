# Deployment Guide

This project consists of two parts:
1. **Frontend**: A Vite-based React application (root directory).
2. **Backend**: A Next.js application (`/server` directory).

The easiest way to deploy this full stack application is using **Vercel**.

## 1. Deploying the Backend (Next.js)

Since your backend is in a generic subfolder (`server`), you can deploy it as a separate project on Vercel.

1. **Push your code to GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
3. Import your repository.
4. **Configure Project Settings**:
   - **Root Directory**: Click "Edit" and select `server`.
   - **Framework Preset**: Next.js (should detect automatically).
   - **Environment Variables**: Add any variables from your `server/.env` file (e.g., `GITHUB_TOKEN`, `OPENAI_API_KEY`).
5. Click **Deploy**.
6. Once deployed, Vercel will give you a domain (e.g., `your-backend.vercel.app`). **Copy this URL.**

## 2. Deploying the Frontend (Vite)

Now deploy the frontend and connect it to the backend.

1. Go to Vercel Dashboard again and click **"Add New..."** -> **"Project"**.
2. Import the **same repository**.
3. **Configure Project Settings**:
   - **Root Directory**: Leave it as `./` (Project Root).
   - **Framework Preset**: Vite (should detect automatically).
   - **Build Command**: `npm run build` (or `vite build`).
   - **Output Directory**: `dist`.
   - **Environment Variables**:
     - `VITE_API_URL`: Paste the backend URL you copied earlier (e.g., `https://your-backend.vercel.app`).
     - **Important**: Add `/api` to the end if your frontend code expects it, but usually the base URL is enough if you configured axios/fetch correctly. In this project, `VITE_API_URL` should essentially be the base domain of the backend so the proxy works or direct calls work.
       - *Note*: Since this is a separate deployment, you won't have the development `vite.config.ts` proxy. You must ensure your frontend code uses `VITE_API_URL` for all requests.
4. Click **Deploy**.

## 3. Configuring Custom Domains

To connect your own domain (e.g., `example.com`):

1. **Frontend Domain**:
   - Go to your Frontend Project in Vercel -> **Settings** -> **Domains**.
   - Add `example.com` (or `www.example.com`).
   - Follow the DNS configuration instructions (usually adding an A record or CNAME).

2. **Backend Domain** (Optional but recommended for API):
   - Go to your Backend Project in Vercel -> **Settings** -> **Domains**.
   - Add a subdomain like `api.example.com`.
   - Configure DNS.
   - **Update Frontend Env**: Update `VITE_API_URL` in the Frontend Project to `https://api.example.com`.

## 4. Troubleshooting CORS

If you see CORS errors:
- Go to your Backend code (`server/next.config.ts` or `middleware.ts`).
- Ensure you allow the frontend domain (`https://example.com`) in the CORS headers.
- Since this is a Next.js App Router project, you can add headers in `next.config.ts`:

```typescript
// server/next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "https://your-frontend-domain.com" }, // Replace with actual frontend URL
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
};
export default nextConfig;
```
