# Tech Stack

## Frontend
- React Native with Expo (mobile client)
- TypeScript (assumed standard for RN/Expo projects)

## Backend
- Supabase (self-hosted via Docker Compose)
  - Authentication (email/password + OAuth)
  - PostgreSQL database
  - Real-time subscriptions (used for live Juz' completion updates)
  - Storage (if needed for avatars/assets)

## Infrastructure
- `supabase/` directory contains all Supabase config, migrations, and seed files
- `supabase/docker-compose.yml` for local development environment

## Local Supabase Setup (Quick Start)

> Reference: [Supabase CLI – Getting Started (macOS)](https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=macos&queryGroups=access-method&access-method=studio)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Node.js / npm available

### 1. Install the Supabase CLI

```bash
npm install supabase --save-dev
```

To update later:

```bash
npm update supabase --save-dev
```

### 2. Initialize the project (first time only)

```bash
npx supabase init
```

This creates the `supabase/` folder. Commit it to version control.

### 3. Start the local stack

```bash
npx supabase start
```

First run downloads Docker images — this takes a few minutes. Once running, the CLI prints your local credentials:

```
API URL:          http://localhost:54321
DB URL:           postgresql://postgres:postgres@localhost:54322/postgres
Studio URL:       http://localhost:54323
Mailpit URL:      http://localhost:54324
anon key:         eyJh...
service_role key: eyJh...
```

Copy the `API URL` and `anon key` into your `.env` file.

### 4. Open Supabase Studio

Navigate to **http://localhost:54323** in your browser to manage your local database visually.

### 5. Stop the local stack

```bash
npx supabase stop
```

This preserves your local database. Add `--no-backup` to also wipe data.

### 6. Opt out of telemetry (optional)

```bash
npx supabase telemetry disable
```

---

## Common Commands

```bash
# Start local Supabase
cd supabase && docker compose up -d

# Stop local Supabase
cd supabase && docker compose down

# Run Expo dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Apply Supabase migrations
npx supabase db push

# Generate Supabase types
npm run generate-types
```

## Key Constraints
- Real-time updates must propagate to all clients in the same Khatmah within 5 seconds
- Session tokens must be valid for at least 7 days
- Invitation URLs follow the format: `app.com/join/{uuid}`
