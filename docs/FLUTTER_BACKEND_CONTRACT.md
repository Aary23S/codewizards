# CodeWizards Flutter Backend Contract

## Purpose

Use the existing CodeWizards Node.js + Express backend and the same MongoDB database as the single source of truth for both web and Flutter.

Flutter is a second client, not a second backend.

## Core Rules

- Keep all current collections, models, and route contracts stable.
- Keep auth, role checks, moderation, CRUD, uploads, and points on the backend.
- Do not duplicate business logic in Flutter.
- Store tokens securely in Flutter; do not use browser-only storage patterns.
- Reuse the same content and moderation rules for web and mobile.

## Current Backend Stack

- `server/server.js` boots Express, CORS, JSON parsing, and MongoDB connection.
- Auth uses JWT bearer tokens.
- Role-based access is enforced by middleware.
- Cloudinary is used for image uploads.
- API routes are mounted under `/api/v1/...`.

## Authentication Flow

### Web behavior today

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- JWT is returned in the login/register response payload.
- Web stores the token in `localStorage`.

### Flutter behavior to implement

- Store JWT in secure storage.
- Attach `Authorization: Bearer <token>` to every protected request.
- On app start, call `GET /api/v1/auth/me` to restore the session.
- If token is invalid, expire the session and route to login.

## Role Model

Current roles in the backend:

- `student`
- `senior`
- `alumni`
- `admin`

Rule:

- `admin` has full control over content and moderation.
- Non-admin users can only edit their own profile/data where the backend allows it.
- Suspended users are blocked from protected routes by backend middleware.

## Route Inventory

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Users / Profiles

- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `POST /api/v1/users` admin only
- `PATCH /api/v1/users/:id` self or admin
- `PATCH /api/v1/users/:id/suspend` admin only
- `DELETE /api/v1/users/:id` admin only

### Projects

- `GET /api/v1/projects`
- `GET /api/v1/projects/:id`
- `POST /api/v1/projects`
- `PATCH /api/v1/projects/:id`
- `DELETE /api/v1/projects/:id`

### Events

- `GET /api/v1/events`
- `GET /api/v1/events/:id`
- `POST /api/v1/events`
- `PATCH /api/v1/events/:id`
- `DELETE /api/v1/events/:id`
- `POST /api/v1/events/:id/register`
- `GET /api/v1/events/my-registrations`

### Gallery

- `GET /api/v1/gallery`
- `DELETE /api/v1/gallery/:id`

### Announcements

- `GET /api/v1/announcements`
- `POST /api/v1/announcements` admin only
- `PATCH /api/v1/announcements/:id` admin only
- `DELETE /api/v1/announcements/:id` admin only

### Team

- `GET /api/v1/team`
- `POST /api/v1/team`
- `PATCH /api/v1/team/:id`
- `DELETE /api/v1/team/:id`

### Mentorship

- `POST /api/v1/mentorship/request`
- `GET /api/v1/mentorship/my-requests`
- `PATCH /api/v1/mentorship/:id/status`

### Resources

- `GET /api/v1/resources`

### Opportunities

- `GET /api/v1/opportunities`
- `POST /api/v1/opportunities`
- `PATCH /api/v1/opportunities/:id`
- `DELETE /api/v1/opportunities/:id`

### Doubts / Forum

- `GET /api/v1/doubts`
- `GET /api/v1/doubts/:id`
- `POST /api/v1/doubts`
- `POST /api/v1/doubts/:id/reply`
- `PATCH /api/v1/doubts/:id/resolve`
- `PATCH /api/v1/doubts/:id/upvote`
- `DELETE /api/v1/doubts/:id`
- `DELETE /api/v1/doubts/:doubtId/replies/:replyId`

### Leaderboard and Sync

- `GET /api/v1/leaderboard`
- `POST /api/v1/sync/codeforces`
- `POST /api/v1/sync/leetcode`
- `POST /api/v1/sync/github`

### Point Rules

- `GET /api/v1/point-rules`
- `PATCH /api/v1/point-rules/:id`

### Blogs

- `GET /api/v1/blogs`
- `GET /api/v1/blogs/:id`
- `POST /api/v1/blogs`
- `PATCH /api/v1/blogs/:id`
- `DELETE /api/v1/blogs/:id`

### Timeline

- `GET /api/v1/timeline`
- `PATCH /api/v1/timeline/:id`
- `DELETE /api/v1/timeline/:id`

### Contact

- `GET /api/v1/contact`
- `PUT /api/v1/contact`

## Known Data Shapes

### User

Known fields used by the backend and web app:

- `name`
- `email`
- `password`
- `role`
- `batch`
- `domain`
- `bio`
- `imageUrl`
- `isMentor`
- `linkedin`
- `github`
- `leetcode`
- `codeforces`
- `portfolio`
- `codeforcesHandle`
- `leetcodeUsername`
- `githubUsername`
- `isSuspended`
- `suspendedReason`
- `externalStats`

### Project

- `title`
- `description`
- `techStack`
- `contributors`
- `githubUrl`
- `demoUrl`
- `imageUrl`
- `featured`

### Event

- `title`
- `type`
- `description`
- `date`
- `venue`
- `imageUrl`
- `registrationLink`
- `status`
- `featured`

### Doubt

- `title`
- `body`
- `domain`
- `author`
- `replies`
- `resolved`
- `upvotes`

### Team member

- Uses team collection backed by the team routes/controller.
- Supports member ordering and yearly grouping on the backend.
- Supports image upload through Cloudinary.
- Flutter should consume the grouped year-based response and render the same sections on mobile.

## Flutter App Architecture

### Recommended layers

- `core/network`: one HTTP client with JWT interceptor/header attachment.
- `core/storage`: secure token storage.
- `core/models`: typed DTOs that match backend responses.
- `features/<domain>/data`: repositories and remote data sources.
- `features/<domain>/presentation`: screens and state.

### Domain repositories

- Auth repository
- User/profile repository
- Projects repository
- Events repository
- Gallery repository
- Team repository
- Announcements repository
- Opportunities repository
- Doubts/forum repository
- Leaderboard repository
- Blogs repository
- Contact repository
- Mentorship repository
- Resources repository

### Environment config

- Use a base URL from Flutter environment/config.
- Keep separate values for local development and production.
- Point mobile and web to the same backend host in each environment.

## UI / Theme Parity

Use the same design language already established on web:

- dark premium background
- soft borders
- rounded cards
- subtle glow
- high-contrast typography
- restrained motion
- responsive layouts for narrow screens

Do not copy desktop grids verbatim. Translate them into mobile stacks, sheets, cards, and tabs.

## Suggested Build Order

1. Auth and session persistence
2. Profile view/edit and role-based routing
3. Home content: announcements, projects, events
4. Directory features: team, connect, leaderboard
5. Community features: doubts/forum, blogs
6. Admin CRUD and moderation screens
7. Media upload and image rendering parity

## Acceptance Criteria

- Flutter can log in and restore sessions using the same backend.
- Flutter reads and writes the same MongoDB-backed records as the web app.
- Admin actions performed on web are visible in mobile and vice versa.
- Role-based restrictions behave the same in both clients.
- Logout fully disables protected access until login happens again.

## Notes for Future GPT Prompts

When asking GPT to build Flutter screens, always include:

- the route being built
- the role(s) allowed
- the exact backend endpoint(s)
- the expected response shape
- whether images/uploads are involved
- whether the screen is public or protected

That prevents the mobile app from drifting away from the existing backend contract.
