# automation.amberbisht.me

A multimodal AI workflow canvas and execution engine for visually chaining LLMs, web research, email notifications, Telegram alerts, and monitoring pipelines.

Created by Amber Bisht.

## Architecture & Tech Stack

- Frontend: Next.js 16 (App Router), TailwindCSS, React Flow, NextAuth (Hosted on Vercel)
- Backend: Bun, Hono API Framework, BullMQ Queue (Hosted on AWS EC2 via Docker)
- Database: Supabase PostgreSQL (Prisma ORM)
- Queue & Cache: Upstash Redis
- AI & Integrations: OpenRouter, Tavily Web Search, Resend Email, Telegram Bot API

## Live Links

- Frontend: https://automation.amberbisht.me
- Backend API: https://api-automation.amberbisht.me
- Developer Portfolio: https://amberbisht.me
- Contact Email: bishtamber0@gmail.com

## Environment Setup

Create a `.env` file in the root directory:

```env
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=
DIRECT_URL=

# NextAuth / Google OAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Redis
REDIS_URL=

# API Keys
OPENROUTER_API_KEY=
TAVILY_API_KEY=
RESEND_API_KEY=
TELEGRAM_BOT_TOKEN=

# App & Domain Settings
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:4000"
RESEND_FROM_EMAIL="notifications@amberbisht.me"
ENCRYPTION_SECRET=
```

## Quick Start (Local Development)

1. Install dependencies:

```bash
bun install
# or
npm install
```

2. Generate database client:

```bash
npm run db:generate
```

3. Start development servers (Frontend on port 3000, Backend on port 4000):

```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser.

## Running Backend with Docker

To run the backend service using Docker Compose:

```bash
docker compose up --build -d
```

## Deployment

### Backend (AWS EC2)
Automated CI/CD via GitHub Actions (`.github/workflows/deploy-backend.yml`):
- Pushes Docker image to GitHub Container Registry (`ghcr.io`).
- Deploys to AWS EC2 via SSH with zero-downtime container swap.

### Frontend (Vercel)
- Connect repository to Vercel.
- Set Root Directory to `apps/web`.
- Configure environment variables (`BACKEND_URL`, `NEXTAUTH_URL`, `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).

## License

MIT License. Developed by Amber Bisht.
