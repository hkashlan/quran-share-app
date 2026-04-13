# Requirements Document

## Introduction

The Khatmah App is a mobile application that enables groups of users to collaboratively complete a full reading of the Quran (Khatmah). A Khatmah divides the 30 Juz' (parts) of the Quran among participants in a shared circle. The app supports user authentication, Khatmah creation and configuration, invitation sharing, progress tracking, gamification via Jazah (rewards), and an emergency "I Can't Read" fallback system. The stack is React Native with Expo for the frontend and Supabase (self-hosted via Docker Compose) for the backend.

---

## Glossary

- **Khatmah**: A Quran reading circle in which 30 Juz' are distributed among participants for collective completion.
- **Juz'**: One of the 30 equal parts of the Quran.
- **Creator**: The user who creates and administers a Khatmah circle.
- **Participant**: A user who has joined a Khatmah circle.
- **Jazah**: A reward point awarded to a Participant upon completing a Juz'.
- **Multiplier**: A Creator-configured factor that increases the Jazah value of completing a Juz' during a special period (e.g., Ramadan).
- **Cycle**: One full round of a Khatmah from start to completion of all 30 Juz'.
- **Auto-Renewal**: A setting that automatically re-assigns Juz' to the same Participants when a new Cycle begins.
- **Plan-B User**: The Participant who adopts a Juz' when the originally assigned Participant activates the "I Can't Read" toggle.
- **Dashboard**: The user's personal home screen showing joined Khatmahs, lifetime stats, and active assignments.
- **System**: The Khatmah App backend and frontend collectively.
- **Auth_Service**: The authentication subsystem responsible for sign-up, login, and session management.
- **Khatmah_Service**: The subsystem responsible for Khatmah creation, configuration, and lifecycle management.
- **Assignment_Service**: The subsystem responsible for distributing and managing Juz' assignments within a Khatmah.
- **Progress_Service**: The subsystem responsible for tracking per-Participant reading progress within a Juz'.
- **Reward_Service**: The subsystem responsible for computing and recording Jazah points.
- **Invitation_Service**: The subsystem responsible for generating and resolving unique invitation links.
- **Notification_Service**: The subsystem responsible for sending in-app and push notifications to Participants.

---

## Requirements

### Requirement 1: User Authentication

**User Story:** As a new user, I want to create an account and sign in, so that my progress and Khatmah memberships are persisted across sessions and devices.

#### Acceptance Criteria

1. THE Auth_Service SHALL support account creation via email and password.
2. THE Auth_Service SHALL support sign-in via third-party OAuth providers (Google and Apple).
3. WHEN a user submits a sign-up form with a duplicate email address, THE Auth_Service SHALL return an error message indicating the email is already registered.
4. WHEN a user submits a sign-up form with an invalid email format, THE Auth_Service SHALL return a validation error before attempting account creation.
5. WHEN a user successfully authenticates, THE Auth_Service SHALL issue a session token valid for at least 7 days.
6. IF a session token expires, THEN THE Auth_Service SHALL redirect the user to the sign-in screen and clear local session data.

---

### Requirement 2: User Profile and Dashboard

**User Story:** As a Participant, I want a personal dashboard, so that I can see all my Khatmahs, lifetime achievements, and quickly act on active assignments.

#### Acceptance Criteria

1. THE System SHALL create a user profile record upon successful account creation.
2. WHEN a user opens the Dashboard, THE System SHALL display the list of all Khatmahs the user has joined or created.
3. WHEN a user opens the Dashboard, THE System SHALL display the user's lifetime total of completed Juz' across all Khatmahs and all Cycles.
4. WHEN a user has at least one active Juz' assignment, THE Dashboard SHALL display a Quick Action button for each active assignment that allows the user to mark the Juz' as completed.
5. WHEN a user taps the Quick Action button for an assignment, THE Progress_Service SHALL record the Juz' as completed and trigger the Jazah reward flow.

---

### Requirement 3: Khatmah Creation and Lifecycle Configuration

**User Story:** As a Creator, I want to configure a new Khatmah with lifecycle and renewal settings, so that the circle operates according to my group's schedule.

#### Acceptance Criteria

1. WHEN a user submits a valid Khatmah creation form, THE Khatmah_Service SHALL create a new Khatmah record with the submitting user as the Creator.
2. THE Khatmah_Service SHALL support two lifecycle types: One-Time and Recurring (Monthly).
3. WHERE the lifecycle type is Recurring, THE Khatmah_Service SHALL support two reset calendar options: Islamic month and Gregorian month.
4. WHERE the lifecycle type is Recurring and the reset calendar is Gregorian, THE Khatmah_Service SHALL reset the Khatmah Cycle on the 1st day of each Gregorian month.
5. WHERE the lifecycle type is Recurring and the reset calendar is Islamic, THE Khatmah_Service SHALL reset the Khatmah Cycle on the 1st day of each Islamic (Hijri) month.
6. THE Khatmah_Service SHALL provide an Auto-Renewal toggle on each Khatmah.
7. WHERE Auto-Renewal is enabled and a Cycle completes, THE Khatmah_Service SHALL automatically start a new Cycle and re-assign the same Juz' to the same Participants.
8. WHERE Auto-Renewal is disabled and a Cycle completes, THE Khatmah_Service SHALL mark the Khatmah as completed and stop further Cycle progression.
9. WHERE the lifecycle type is One-Time and all 30 Juz' are marked complete, THE Khatmah_Service SHALL mark the Khatmah as completed.

---

### Requirement 4: Gamification — Jazah Rewards

**User Story:** As a Participant, I want to earn Jazah points for completing Juz', so that I feel motivated and recognized for my contribution.

#### Acceptance Criteria

1. WHEN a Participant completes a Juz', THE Reward_Service SHALL increment the Participant's Jazah count by the current Multiplier value for that Khatmah.
2. THE Khatmah_Service SHALL set the default Jazah Multiplier to 1 for every new Khatmah.
3. WHEN a Creator updates the Jazah Multiplier for a Khatmah, THE Khatmah_Service SHALL apply the new Multiplier value to all subsequent Juz' completions within that Khatmah.
4. THE Reward_Service SHALL record each Jazah award with the Participant ID, Khatmah ID, Juz' number, Multiplier value, and timestamp.
5. WHEN a user opens the Dashboard, THE System SHALL display the user's total Jazah count across all Khatmahs.

---

### Requirement 5: Juz' Assignment and Distribution

**User Story:** As a Creator, I want to assign Juz' to Participants either manually or automatically, so that all 30 parts are covered.

#### Acceptance Criteria

1. THE Khatmah_Service SHALL support two assignment modes: Manual and Automatic.
2. WHERE the assignment mode is Manual, THE Creator SHALL be able to assign any of the 30 Juz' to any Participant in the Khatmah.
3. WHERE the assignment mode is Manual, THE Creator SHALL be able to mark any Juz' as completed on behalf of any Participant.
4. WHERE the assignment mode is Automatic and the Creator triggers distribution, THE Assignment_Service SHALL distribute the 30 Juz' among all current Participants using either random or sequential allocation as selected by the Creator.
5. WHEN a Juz' is assigned to a Participant, THE Assignment_Service SHALL record the Participant ID, Juz' number, Khatmah ID, and assignment timestamp.
6. IF a Khatmah has more than 30 Participants when automatic distribution is triggered, THEN THE Assignment_Service SHALL assign at most one primary Juz' per Participant and leave excess Participants without a primary assignment for that Cycle.
7. IF a Khatmah has fewer Participants than 30 Juz' when automatic distribution is triggered, THEN THE Assignment_Service SHALL distribute multiple Juz' to Participants to ensure all 30 Juz' are assigned.

---

### Requirement 6: Invitation and Sharing System

**User Story:** As a Creator, I want to share a unique invitation link, so that others can join my Khatmah easily.

#### Acceptance Criteria

1. WHEN a Khatmah is created, THE Invitation_Service SHALL generate a unique UUID-based invitation URL in the format `app.com/join/{uuid}`.
2. THE Invitation_Service SHALL ensure each invitation URL maps to exactly one Khatmah.
3. WHEN a user navigates to a valid invitation URL, THE System SHALL display the Khatmah name and a button to join.
4. WHEN an authenticated user taps the join button on a valid invitation page, THE Invitation_Service SHALL add the user as a Participant in the Khatmah.
5. WHEN an unauthenticated user navigates to a valid invitation URL, THE System SHALL redirect the user to the sign-in screen and resume the join flow upon successful authentication.
6. IF a user who is already a Participant navigates to the invitation URL for that Khatmah, THEN THE System SHALL display a message indicating the user is already a member and SHALL NOT create a duplicate membership record.
7. THE Creator SHALL be able to access the invitation URL from the Khatmah settings screen at any time.

---

### Requirement 7: Reading Progress Tracking

**User Story:** As a Participant, I want to track my reading progress within my assigned Juz', so that I and my group can see how far along I am.

#### Acceptance Criteria

1. WHEN a Participant opens their assigned Juz' detail screen, THE Progress_Service SHALL display the Participant's current saved page number within that Juz'.
2. WHEN a Participant submits a page number update, THE Progress_Service SHALL validate that the submitted page number is a positive integer within the valid page range of the assigned Juz'.
3. WHEN a valid page number is submitted, THE Progress_Service SHALL persist the updated page number and display it immediately.
4. IF a Participant submits a page number outside the valid range for the Juz', THEN THE Progress_Service SHALL return a validation error and SHALL NOT update the stored page number.
5. WHEN a Participant taps the "Finish Juz'" button, THE Progress_Service SHALL mark the Juz' as completed, trigger the Jazah reward flow, and notify all Participants in the Khatmah.
6. WHEN a Juz' is marked complete, THE Notification_Service SHALL send a notification to all Participants in the Khatmah indicating which Participant completed which Juz'.

---

### Requirement 8: "I Can't Read" Emergency System

**User Story:** As a Participant, I want to signal that I cannot complete my assigned Juz', so that the Creator can reassign it and the Khatmah is not blocked.

#### Acceptance Criteria

1. WHEN a Participant activates the "I Can't Read" toggle for their assigned Juz', THE Assignment_Service SHALL flag the assignment with a `help_requested` status.
2. WHEN an assignment is flagged with `help_requested`, THE Notification_Service SHALL send a notification to the Creator indicating which Participant and which Juz' requires help.
3. WHEN a Creator views a Khatmah with one or more `help_requested` assignments, THE System SHALL display a visible alert listing the affected Juz' numbers and Participant names.
4. WHEN a Creator taps "Adopt" on a `help_requested` Juz', THE Assignment_Service SHALL record the Creator as the Plan-B User for that Juz' and update the assignment status to `adopted`.
5. WHERE the assignment mode is Manual, THE Creator SHALL be able to assign a `help_requested` Juz' to any other Participant instead of adopting it personally.
6. WHEN a Plan-B User completes an adopted Juz', THE Reward_Service SHALL award the Jazah to the Plan-B User and SHALL NOT award Jazah to the original assignee.

---

### Requirement 9: Khatmah Reset and Notifications

**User Story:** As a Participant, I want to be notified when a new Cycle begins and receive my new assignment, so that I can start reading without delay.

#### Acceptance Criteria

1. WHEN a Khatmah Cycle resets (either by schedule or manual trigger by the Creator), THE Khatmah_Service SHALL clear all Juz' completion statuses and page progress for the current Cycle.
2. WHEN a Cycle resets and Auto-Renewal is enabled, THE Assignment_Service SHALL re-assign the same Juz' numbers to the same Participants as the previous Cycle.
3. WHEN a Cycle resets, THE Notification_Service SHALL send a notification to each Participant stating that a new Cycle has started and listing their new Juz' assignment.
4. THE Creator SHALL be able to manually trigger a Cycle reset from the Khatmah settings screen.
5. WHEN a manual Cycle reset is triggered, THE System SHALL require the Creator to confirm the action before executing the reset.

---

### Requirement 10: Data Model and Technical Infrastructure

**User Story:** As a developer, I want a well-defined flat data model and a local Supabase environment, so that the app is easy to build, test, and deploy.

#### Acceptance Criteria

1. THE System SHALL store each Khatmah as a single record containing: name, lifecycle type, reset calendar, auto-renewal flag, assignment mode, Jazah Multiplier, Creator ID, invitation UUID, and 30 Juz'-user assignment fields, 30 Juz'-completion-status fields, and 30 Juz'-plan-b-user fields.
2. THE System SHALL be implemented using React Native with Expo for the mobile client.
3. THE System SHALL use Supabase as the backend service for authentication, database, and real-time subscriptions.
4. THE System SHALL include a `supabase/` directory in the repository containing all Supabase configuration, migrations, and seed files.
5. THE System SHALL include a `docker-compose.yml` file in the `supabase/` directory to enable local Supabase development.
6. WHEN a Participant's Juz' completion status changes, THE System SHALL propagate the update to all connected clients in the same Khatmah within 5 seconds using Supabase real-time subscriptions.
