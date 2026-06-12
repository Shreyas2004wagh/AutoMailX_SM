# AutoMailX SM

AutoMailX SM is an AI-assisted email dashboard that connects to Gmail, stores fetched messages in MongoDB, classifies emails by priority or intent, summarizes long messages, and generates editable reply drafts with Gemini.

## Features

- Email/password authentication with JWT-based sessions
- Optional Google OAuth sign-in with Gmail read access
- Gmail message import into MongoDB
- AI email classification: urgent, positive, neutral, and calendar
- AI-generated summaries for selected messages
- AI-generated response drafts that can be edited, copied, opened in Gmail compose, and saved
- Searchable and filterable React dashboard

## Tech Stack

**Client**

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

**Server**

- Node.js
- Express
- MongoDB with Mongoose
- Passport Google OAuth 2.0
- Google Gmail API
- Google Gemini API

## Project Structure

```text
AutoMailX_SM/
  client/                 React/Vite frontend
  server/                 Express API server
    config/               MongoDB connection
    controllers/          Route handlers
    models/               Mongoose models
    routes/               API route definitions
    services/             Gmail and Gemini integrations
  README.md
  package.json            Root helper scripts
```

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB database URI
- Gemini API key
- Google Cloud OAuth credentials if you want Gmail import and Google sign-in

## Environment Variables

Create `server/.env`:

```env
PORT=5000
DATABASE_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
JWT_SECRET=replace-with-a-long-random-secret
SESSION_SECRET=replace-with-a-long-random-session-secret
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=development
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are optional for local email/password auth. If they are missing, the server still starts and the Google OAuth route returns a configuration error.

## Google OAuth Setup

In Google Cloud Console:

1. Create or select a Google Cloud project.
2. Enable the Gmail API.
3. Configure the OAuth consent screen.
4. Create OAuth 2.0 Client ID credentials for a web application.
5. Add this authorized redirect URI for local development:

```text
http://localhost:5000/auth/google/callback
```

For deployment, set `BASE_URL` to the deployed backend URL and add:

```text
<BACKEND_URL>/auth/google/callback
```

## Local Setup

Install dependencies for both apps:

```bash
npm run install:all
```

Start the backend in one terminal:

```bash
npm run dev:server
```

Start the frontend in another terminal:

```bash
npm run dev:client
```

Open the app:

```text
http://localhost:5173
```

The API runs on:

```text
http://localhost:5000
```

## Useful Scripts

From the project root:

```bash
npm run install:all
npm run dev:server
npm run dev:client
npm run build:client
npm run lint:client
```

From `server/`:

```bash
npm run dev
npm start
```

From `client/`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## API Overview

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/signup` | Create an email/password account |
| `POST` | `/login` | Log in and receive a JWT |
| `GET` | `/auth/google` | Start Google OAuth |
| `GET` | `/auth/google/callback` | Google OAuth callback |
| `GET` | `/emails` | Fetch recent Gmail messages into MongoDB |
| `GET` | `/get-emails` | Read stored emails and classify them |
| `POST` | `/summarize` | Generate an AI summary for email content |
| `POST` | `/generate-response` | Generate an AI response draft |
| `POST` | `/save-response` | Save an AI response draft to the email document |
| `GET` | `/logout` | Destroy the current session |

## Development Notes

- The frontend defaults to `http://localhost:5000` when `VITE_API_BASE_URL` is not set.
- The backend requires `DATABASE_URI` and `JWT_SECRET` to start.
- Gemini features require `GEMINI_API_KEY`.
- Gmail import requires a Google OAuth session with the Gmail readonly scope.
- Stored emails are classified lazily when `/get-emails` is called.

## Troubleshooting

**Client requests go to `undefined/...`**

Set `client/.env` with `VITE_API_BASE_URL=http://localhost:5000`, or use the current fallback behavior by rebuilding with the latest code.

**Google login says it is not configured**

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `BASE_URL` in `server/.env`, then restart the server.

**Gemini summary or response generation fails**

Check that `GEMINI_API_KEY` is valid and that the selected `GEMINI_MODEL` supports text generation.

**MongoDB connection fails**

Verify `DATABASE_URI`, database user permissions, and network access for your MongoDB cluster.

**Frontend build fails after dependency changes**

Refresh dependencies:

```bash
npm install --prefix client
```

Then run:

```bash
npm run build:client
```
