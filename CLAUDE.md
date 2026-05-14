# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

### Development Commands

**Frontend (React + Vite):**
```bash
cd frontend
npm run dev        # Start dev server on http://localhost:5173
npm run build      # Production build to dist/
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

**Backend (Node + Express):**
```bash
cd backend
npm run dev        # Start dev server with nodemon on port 5001
npm start          # Start production server
```

**Both in parallel (from root):**
- Terminal 1: `cd frontend && npm run dev`
- Terminal 2: `cd backend && npm run dev`

### Environment Setup

**Backend** (`backend/.env`):
- `PORT=5001`
- `MONGO_URI=mongodb://localhost:27017/itinerary`
- `CLIENT_URL=http://localhost:5173`
- `GOOGLE_MAPS_API_KEY=...` (for place images and place search)
- `GEOAPIFY_KEY=...` (for geocoding)

**Frontend** (`frontend/.env.local`):
- `VITE_FIREBASE_*` (auth domain, project ID, API key, storage bucket, messaging sender, app ID)
- `VITE_API_URL=http://localhost:5001/api`

Use `.env.example` files as templates.

## Architecture Overview

### High-Level Data Flow

1. **User Authentication**: Firebase Auth handles registration/login
2. **Trip Data**: Stored in Firestore with real-time listeners
3. **Enrichment APIs**: Backend provides weather, prayer times, geocoding, place images
4. **Messaging**: Firebase-backed chat system (DMs between trip members)

### Frontend Architecture

**Three-Context Model:**

1. **AuthContext** (`src/context/AuthContext.jsx`)
   - Manages Firebase authentication state
   - Tracks user profile (displayName, birthday, photo)
   - Provides: `login()`, `register()`, `completeProfile()`, `updateProfile()`, `logout()`

2. **TripContext** (`src/context/TripContext.jsx`)
   - Real-time Firestore subscription to user's trips (owned and joined)
   - Optimistic updates with 400ms debounced saves to Firestore
   - Provides CRUD operations for: trips, days, activities, budgets, reviews
   - Key methods: `createTrip()`, `removeTrip()`, `addActivity()`, `markActivityDone()`, `joinTrip()`

3. **ChatContext** (`src/context/ChatContext.jsx`)
   - Real-time Firestore subscription to user's DM chats
   - Lazy-loads member profiles on demand
   - Provides: `openDM(otherUserId)` to initiate direct messages

**Data Models** (`src/models/schemas.js`):
- `Trip`: Root document with embedded Days and Activities
- `Day`: Container for activities within a trip
- `Activity`: Individual activities with optional reviews and metadata (time, image, rating, placeId)
- `ActivityReview`: Per-person reviews on completed activities (rating, comment, photos, userId)
- `Budget`: Trip budget tracking (total, used, currency)

Each model has a `.toJSON()` method for serialization to Firestore.

**Key Services:**
- `auth.service.js`: Firebase auth wrapper
- `trip.service.js`: Firestore trip queries and subscriptions (handles backfilling old trips with memberIds)
- `user.service.js`: Firestore user profile operations
- `chat.service.js`: Firestore DM chat operations
- `places.service.js`: Backend API calls for place search/details/images
- `destination.service.js`: Destination image fetching

**Pages & Routing:**
- `/login`, `/register`, `/complete-profile`: Public routes
- `/dashboard`: "For You" page (main feed)
- `/trips`: My Trips list
- `/trips/:id`: Trip detail with days, activities, budget, members
- `/dms`: Direct messaging
- `/profile`: User profile

### Backend Architecture

**Express Server** (`index.js`):
- Global rate limit: 200 requests per 15 minutes per IP
- Stricter rate limit: 30 requests per 15 minutes for Google Places API endpoints
- CORS enabled for `CLIENT_URL`
- Error handling middleware logs and returns JSON errors

**Route Structure:**
```
/api/
  /place-image        → Google Place images (cached)
  /places/search      → Search places by query
  /places/details     → Get place details
  /place-cache        → Cache management for places
  /weather            → Weather data for destinations
  /prayer             → Prayer times for destinations
  /geocode            → Lat/lng conversion
  /health             → Health check
```

**Key Models:**
- `PlaceCache`: MongoDB model for caching Google Places results (placeId, name, address, rating, imageUrl, details)
- `ApiLog`: Logs of API usage (for rate limiting and debugging)

**Services:**
- `googlePlaceImage.service.js`: Wraps Google Places API calls
- `placeCache.service.js`: DB operations for caching place data
- `weather.service.js`: External weather API integration
- `prayer.service.js`: Prayer time calculation/API integration

**Middleware:**
- `validatePlaceImage.js`: Query parameter validation for place endpoints

### Firestore Schema

**Collections:**
- `trips`: Trip documents with embedded days/activities
  - Fields: title, destination, dateRange, people, image, coverImage, budget, days, status, shareCode, memberIds, userId, createdAt, updatedAt
  - Nested arrays: days → activities → reviews
- `users`: User profiles
  - Fields: displayName, birthday, photoUrl, email, createdAt, updatedAt
- `chats`: Direct message conversations
  - Fields: memberIds, lastMessage, lastMessageAt, createdAt

### Key Design Patterns

1. **Optimistic Updates**: TripContext updates local state immediately, then saves to Firestore with debouncing (400ms). Firestore listeners reconcile state.

2. **Real-time Subscriptions**: All data subscriptions use Firestore `onSnapshot()` for live updates without polling.

3. **Share Codes**: Trips can be shared via 8-character codes. `ensureShareCode()` generates codes on-demand (backward compatibility for old trips).

4. **Backfilling**: Old trips created before `memberIds` was added are automatically patched with the current user's ID on subscription.

5. **Rate Limiting**: Backend protects Google Places API with stricter limits than global API limits.

6. **Caching**: Place images and details are cached in MongoDB to reduce API costs and improve performance.

## Important Files

- **Frontend Entry**: `frontend/src/main.jsx` → `App.jsx`
- **Vite Config**: `frontend/vite.config.js` (React plugin, Tailwind CSS)
- **Backend Entry**: `backend/index.js`
- **DB Connection**: `backend/server/config/db.js`
- **Firestore Config**: `frontend/src/lib/firebase.js`

## Testing

No test scripts are currently configured. Tests can be added via Jest (frontend) and similar frameworks (backend).

## Notes for Contributors

- Activities are activities/restaurants/custom places that users plan within a trip day
- Activity status: 'planned', 'done', 'skipped'
- A review is automatically added when someone marks an activity as done
- Trip status: 'planning', 'ongoing', 'completed'
- Client-side IDs (UUIDs) are temporary; Firestore uses document IDs
- All timestamps use ISO 8601 format
- Frontend uses Tailwind CSS for styling; no component library (uses Lucide React for icons)
