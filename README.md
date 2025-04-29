# YouTube Companion Dashboard Backend

This is the backend API for the YouTube Companion Dashboard, a mini-dashboard to manage your uploaded YouTube videos, comments, and notes.

## Features

- Google OAuth 2.0 authentication
- Fetch video details
- Update video title & description
- Fetch, post, reply to, and delete comments
- Create, read, update, and delete notes for each video
- Log all user actions (events) to MongoDB

## Tech Stack

- Node.js & Express
- MongoDB & Mongoose
- Passport.js (Google OAuth 2.0)
- YouTube Data API v3

## Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd youtube-dashboard-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root with the following variables:
   ```dotenv
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```
4. Start the server:
   ```bash
   npm start
   ```

By default, the server listens on port `8000` or the port defined in `process.env.PORT`.

## API Endpoints

### Authentication

- GET `/auth/google`  
  Redirects to Google OAuth 2.0 consent screen.
- GET `/auth/google/callback`  
  OAuth callback endpoint. Redirects to `/home` on success.
- GET `/auth/logout`  
  Logs out the current user and redirects to `/`.

### Videos

- GET `/videos`  
  Fetch all uploaded videos for the authenticated user.
- GET `/videos/:id`  
  Fetch video details (snippet, contentDetails, statistics).
- PATCH `/videos/:id`  
  Update video title and description.  
  Body: `{ "title": "New Title", "description": "New Description" }`

### Comments

- GET `/videos/:id/comments`  
  Fetch top-level comments (with replies) for a video.
- POST `/videos/:id/comments`  
  Create a new top-level comment.  
  Body: `{ "text": "Your comment text" }`
- POST `/videos/:id/comments/:commentId/replies`  
  Reply to an existing comment.  
  Body: `{ "text": "Your reply text" }`
- DELETE `/videos/:id/comments/:commentId`  
  Delete a comment or reply.

### Notes

- GET `/notes?videoId=VIDEO_ID`  
  Fetch notes for a specific video.
- POST `/notes`  
  Create a new note.  
  Body: `{ "videoId": "VIDEO_ID", "content": "Your note text" }`
- PATCH `/notes/:id`  
  Update an existing note.  
  Body: `{ "content": "Updated note text" }`
- DELETE `/notes/:id`  
  Delete a note.

### Events

- GET `/events`  
  Fetch event logs for the authenticated user.

## Database Schemas

### Event

```js
{
  userId: String,        // Google profile ID
  eventType: String,     // e.g. FETCH_VIDEO_DETAILS, CREATE_COMMENT, etc.
  payload: Mixed,        // Details about the event
  timestamp: Date        // Auto-generated
}
```

### Note

```js
{
  userId: String,        // Google profile ID
  videoId: String,       // YouTube video ID
  content: String,       // Note text
  createdAt: Date        // Auto-generated
}
```

# youtube-buddy-backend
