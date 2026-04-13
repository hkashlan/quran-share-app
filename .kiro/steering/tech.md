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
