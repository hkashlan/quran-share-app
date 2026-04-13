# Project Structure

## Expected Layout

```
/
├── app/                    # Expo Router screens and navigation
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Shared utilities and Supabase client
├── types/                  # TypeScript types (including generated Supabase types)
├── supabase/               # Supabase backend config
│   ├── migrations/         # SQL migration files
│   ├── seed.sql            # Seed data for local dev
│   └── docker-compose.yml  # Local Supabase environment
├── assets/                 # Images, fonts, static files
└── .kiro/                  # Kiro specs and steering
    ├── specs/
    └── steering/
```

## Data Model Notes

The Khatmah record uses a flat schema with:
- 30 Juz'-user assignment fields
- 30 Juz'-completion-status fields
- 30 Juz'-plan-b-user fields
- Plus: name, lifecycle_type, reset_calendar, auto_renewal, assignment_mode, jazah_multiplier, creator_id, invitation_uuid

## Service Boundaries

| Service | Responsibility |
|---|---|
| Auth_Service | Sign-up, login, session management |
| Khatmah_Service | Khatmah creation, config, lifecycle |
| Assignment_Service | Juz' distribution and management |
| Progress_Service | Per-participant reading progress |
| Reward_Service | Jazah computation and recording |
| Invitation_Service | Invite link generation and resolution |
| Notification_Service | In-app and push notifications |

## Conventions
- Services map to Supabase functions or client-side logic calling Supabase directly
- Real-time updates use Supabase subscriptions scoped to a Khatmah ID
- All Supabase schema changes go through versioned migration files in `supabase/migrations/`
