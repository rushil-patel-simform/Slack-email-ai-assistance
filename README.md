# 📬 Gmail AI Assistant Backend

A **production-ready AI-powered Gmail assistant** built with Node.js, TypeScript, Express, Prisma, Google Gmail API, and OpenAI. The system automatically reads unread emails, generates professional AI replies using GPT-4o, and saves them as Gmail drafts — **never auto-sending**.

---

## Architecture

```
Gmail API → Poller Job → Filter → OpenAI → Gmail Draft API → Database
```

```
src/
├── auth/           # Google OAuth2 + token management
├── gmail/          # Gmail API integration (fetch, parse, draft)
├── ai/             # OpenAI prompt service
├── jobs/           # Cron-based email poller
├── routes/         # Express REST API routes
├── middleware/      # Request logger + global error handler
├── db/             # Prisma client
├── utils/          # Logger, email utilities
├── types/          # Shared TypeScript types
├── config/         # Centralized config from env vars
├── app.ts          # Express app setup
└── index.ts        # Server bootstrap + graceful shutdown
```

---

## Features

- ✅ Google OAuth2 login with access + refresh token storage
- ✅ Automatic token refresh when expired
- ✅ Polls unread Gmail inbox every minute (configurable)
- ✅ Filters automated / no-reply / newsletter emails
- ✅ Extracts sender, subject, body, threadId, messageId
- ✅ Sends email context to OpenAI GPT-4o for reply generation
- ✅ Creates Gmail **draft** replies in the correct thread
- ✅ Prevents duplicate draft creation via database tracking
- ✅ Retry-safe architecture — failed emails are logged, not retried infinitely
- ✅ Clean modular architecture with strong TypeScript typing
- ✅ Request logging middleware + global error handler

---

## Prerequisites

- Node.js 18+
- A Google Cloud project
- An OpenAI API key

---

## Google Cloud Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"New Project"** and give it a name
3. Select the project

### 2. Enable the Gmail API

1. Go to **APIs & Services → Library**
2. Search for **"Gmail API"**
3. Click **Enable**

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** (or Internal for Workspace)
3. Fill in app name, user support email, developer email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.compose`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Add your email as a **Test User**

### 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services → Credentials**
2. Click **"Create Credentials" → "OAuth client ID"**
3. Application type: **Web application**
4. Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
5. Copy your **Client ID** and **Client Secret**

---

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd gmail-ai-assistant
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
```

### 3. Set up the database

```bash
npm run db:push
```

### 4. Start the development server

```bash
npm run dev
```

---

## REST API Endpoints

| Method | Endpoint                   | Description                                 |
|--------|----------------------------|---------------------------------------------|
| GET    | `/health`                  | Server + database health check              |
| GET    | `/auth/google`             | Redirect to Google OAuth2 consent screen    |
| GET    | `/auth/google/callback`    | Handle OAuth2 callback, store tokens        |
| GET    | `/emails/unread?userId=x`  | Fetch unread emails for a user              |
| GET    | `/drafts?userId=x`         | List Gmail drafts and AI draft logs         |

### Usage Flow

1. Open `http://localhost:3000/auth/google` in browser
2. Authorize with your Google account
3. Copy the `userId` from the JSON response
4. Check unread emails: `GET /emails/unread?userId=<your-user-id>`
5. The background job polls every minute and creates drafts automatically
6. View drafts: `GET /drafts?userId=<your-user-id>`
7. Open Gmail → Drafts to review and manually send

---

## Database Models

| Model           | Description                                      |
|-----------------|--------------------------------------------------|
| `User`          | Stores connected Google account info             |
| `OAuthTokens`   | Access + refresh tokens per user                 |
| `ProcessedEmail`| Tracks processed emails to prevent duplicates    |
| `DraftLog`      | Records each AI-generated draft with preview     |

---

## Environment Variables Reference

| Variable              | Required | Description                                    |
|-----------------------|----------|------------------------------------------------|
| `GOOGLE_CLIENT_ID`    | ✅       | Google OAuth2 client ID                        |
| `GOOGLE_CLIENT_SECRET`| ✅       | Google OAuth2 client secret                    |
| `GOOGLE_REDIRECT_URI` | ✅       | OAuth2 callback URL                            |
| `OPENAI_API_KEY`      | ✅       | OpenAI API key                                 |
| `DATABASE_URL`        | ✅       | SQLite path: `file:./dev.db`                   |
| `PORT`                | ❌       | Server port (default: 3000)                    |
| `NODE_ENV`            | ❌       | `development` or `production`                  |
| `OPENAI_MODEL`        | ❌       | OpenAI model (default: `gpt-4o`)               |
| `OPENAI_MAX_TOKENS`   | ❌       | Max tokens per reply (default: 500)            |
| `POLL_CRON`           | ❌       | Cron schedule (default: `* * * * *`)           |
| `MAX_EMAILS_PER_POLL` | ❌       | Emails per poll cycle (default: 10)            |

---

## Scripts

```bash
npm run dev          # Start dev server with hot-reload
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled production build
npm run db:push      # Push schema to database
npm run db:generate  # Regenerate Prisma client
npm run db:migrate   # Run Prisma migrations
npm run db:studio    # Open Prisma Studio GUI
```

---

## Important Rules

> ⚠️ **This system NEVER auto-sends emails.**
> It ONLY creates Gmail drafts. The user reviews and manually sends every draft.

---

## Production Deployment Notes

- Use PostgreSQL instead of SQLite in production (update `DATABASE_URL` and `provider` in `prisma/schema.prisma`)
- Store tokens encrypted at rest
- Use a proper secret manager (AWS Secrets Manager, Vault) for API keys
- Set `NODE_ENV=production`
- Use PM2 or a systemd service to keep the process alive
- Set up proper rate limiting on the API routes
