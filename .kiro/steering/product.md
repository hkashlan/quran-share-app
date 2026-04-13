# Product: Khatmah App

A mobile app that enables groups to collaboratively complete a full reading of the Quran (Khatmah). A Khatmah divides the 30 Juz' (parts) of the Quran among participants in a shared circle.

## Core Concepts

- **Khatmah**: A Quran reading circle where 30 Juz' are distributed among participants
- **Juz'**: One of the 30 equal parts of the Quran
- **Creator**: User who creates and administers a Khatmah circle
- **Participant**: User who has joined a Khatmah circle
- **Jazah**: Reward points earned by completing a Juz'
- **Cycle**: One full round of a Khatmah (all 30 Juz' completed)
- **Plan-B User**: Participant who adopts a Juz' when the original assignee can't read

## Key Features

- User authentication (email/password + Google/Apple OAuth)
- Khatmah creation with lifecycle config (One-Time or Recurring)
- Juz' assignment (Manual or Automatic with random/sequential distribution)
- Reading progress tracking per Juz'
- Jazah reward system with configurable multipliers
- Invitation sharing via unique UUID-based URLs
- "I Can't Read" emergency fallback system
- Real-time progress updates across all participants
- Push and in-app notifications
