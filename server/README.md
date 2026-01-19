# Next.js API Server

This is the backend API server for the GitHub Code Analyzer application.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
# GitHub Personal Access Token
# Get your token from: https://github.com/settings/tokens
# Required scopes: public_repo (for public repositories) or repo (for private repositories)
GITHUB_TOKEN=your_github_token_here

# OpenAI API Key (for chat functionality)
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Get GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "Code Analyzer")
4. Select scopes:
   - For public repositories: `public_repo`
   - For private repositories: `repo`
5. Click "Generate token"
6. Copy the token and paste it into your `.env` file

**Important**: The token is only shown once. Save it securely!

### 4. Run the Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

- `GET /api/search?q={query}&type=repositories&language={lang}&sort={sort}` - Search repositories
- `GET /api/repositories` - Get user repositories
- `GET /api/repositories/{owner}/{repo}/branches` - Get repository branches
- `GET /api/repositories/{owner}/{repo}/commits?branch={branch}` - Get repository commits
- `POST /api/chat` - Chat with GPT API

## Rate Limits

Without a GitHub token, you're limited to 60 requests per hour per IP address.
With a GitHub token, you get 5,000 requests per hour.
