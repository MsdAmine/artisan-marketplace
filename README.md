# Artisan Marketplace

## Overview
- **Artisan Marketplace** is a full-stack web application for browsing handmade products, following artisans, and managing carts and orders.
- It targets customers who want curated artisan goods and artisans/administrators who manage listings, orders, and platform analytics.

## Features
- JWT-based authentication with signup/login and role-aware navigation (customer, artisan, admin).
- Product catalog with CRUD operations, image uploads (Cloudinary or local fallback), and cached listing retrieval.
- Artisan profiles with follower graph support (Neo4j) and search pages.
- Shopping cart and order creation endpoints, plus customer order history views.
- Admin dashboards for sales statistics, artisan management, and order oversight.
- Recommendation tracking and cached product recommendations via Neo4j + Redis.
- Notification stream and storage for new product events.
- Seed script to bootstrap MongoDB with sample users and products.
- **Planned/partial**: No automated tests; production deployment scripts and CI are not included.

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite, React Router, Tailwind CSS, Radix UI primitives, Framer Motion.
- **Backend:** Node.js with Express 5, MongoDB driver, JWT auth, bcrypt for hashing, multer for uploads.
- **Databases / Caching:** MongoDB for core data, Redis for caching and streams, Neo4j for social graph/recommendations.
- **External services / APIs:** Optional Cloudinary storage for images.
- **Tooling and build system:** Vite build pipeline, ESLint for linting.

## Architecture
- The frontend (Vite React app) communicates with the backend REST API (Express) at `${VITE_API_URL}/api`.
- Client routes are protected based on roles (e.g., `/artisan/dashboard`, admin pages) while login/signup bypass the navbar.
- The backend exposes modular routers for products, artisans, carts, orders, stats, auth, users, recommendations, notifications, and uploads.
- Data flow: frontend calls API → Express routes → MongoDB for persistence; Redis caches product lists and recommendations; Neo4j stores interaction graph; Cloudinary (or local disk) handles image storage; Redis streams publish notifications.

## Project Structure
- `src/`: React application with pages (catalog, cart, dashboards), shared components, hooks, and contexts (e.g., authentication provider).
- `backend/server.js`: Express server setup, MongoDB connection, Neo4j driver wiring, router mounting.
- `backend/routes/`: REST route handlers for products, artisans, carts, orders, stats, auth, users, recommendations, notifications, uploads, and ratings.
- `backend/db/`: Database helpers for MongoDB and Redis connections.
- `backend/neo4j/`: Neo4j interaction and recommendation helpers.
- `backend/utils/`: Utilities including Cloudinary client and notification stream publisher.
- `backend/seed.js`: MongoDB seeding script with demo users/products.
- `public/`, `index.html`, `tailwind.config.js`, `vite.config.js`: Frontend static assets and configuration.

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB instance
- Redis instance
- (Optional) Neo4j instance for recommendations/follow graph
- (Optional) Cloudinary account for hosted image uploads

### Installation
1. Install frontend dependencies:
   ```bash
   npm install
   ```
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```
3. Create a `.env` file at the repository root or inside `backend/` with the configuration values below.

### Running the Project
- **Backend (development):**
  ```bash
  cd backend
  npm run dev
  ```
  The server listens on `http://localhost:3000`.
- **Frontend (development):**
  ```bash
  npm run dev
  ```
  Vite serves the app (default `http://localhost:5173`).
- **Frontend production build:**
  ```bash
  npm run build
  npm run preview
  ```
- **Database seed (MongoDB):**
  ```bash
  cd backend
  node seed.js
  ```

## Configuration
- **Frontend:**
  - `VITE_API_URL` — base URL of the backend (defaults to `http://localhost:3000`).
- **Backend environment variables:**
  - `MONGO_URI` — MongoDB connection string.
  - `JWT_SECRET` — secret for signing authentication tokens.
  - `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT` — Redis connection details.
  - `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` — Neo4j connection (required for recommendations/follow graph).
  - `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET` — optional Cloudinary credentials; if omitted, uploads fall back to local disk under `backend/uploads/`.

## API / Core Logic Overview
- **Auth (`/api/auth`):** signup/login issuing JWT tokens stored client-side.
- **Products (`/api/products`):** CRUD operations, artisan filter, average rating aggregation, and cache-aware listing retrieval.
- **Artisans (`/api/artisans`):** profile data endpoints (creation/update/read).
- **Cart (`/api/cart`):** add/remove/read cart items per user.
- **Orders (`/api/orders`):** order creation and admin/customer listing.
- **Stats (`/api/stats`):** admin metrics (e.g., revenue, top products).
- **Users (`/api/users`):** current user lookup and admin artisan management.
- **Recommendations (`/api/recommendations`):** track user interactions and fetch recommended products via Neo4j with Redis caching.
- **Notifications (`/api/notifications`):** store and stream notifications when artisans publish new products.
- **Uploads (`/api/upload`):** single-image upload to Cloudinary or local filesystem and returns a public URL.

## Testing
- No automated frontend or backend tests are present. `npm test` in the backend is a placeholder.
- Manual verification is required; consider adding unit/integration tests for APIs and React components.

## Deployment
- No deployment scripts are provided. Typical setup requires provisioning MongoDB, Redis, and (optionally) Neo4j and Cloudinary, then running `npm run build` for the frontend and `npm start` in `backend/`.
- Hosting assumptions: backend on a Node-compatible host; frontend on any static file host or Vite-compatible platform.

## Limitations and Known Issues
- Missing automated tests and CI pipeline.
- No containerization or infrastructure-as-code manifests.
- Security and input validation are minimal; JWT secret and database URIs must be supplied securely.
- Recommendation and follower features depend on a running Neo4j instance; without it, related endpoints return errors.
- Uploads default to local disk when Cloudinary is not configured, which is not suitable for production.

## Roadmap
- Add comprehensive unit/integration tests and lint checks in CI.
- Provide Docker or cloud deployment templates and environment samples.
- Harden authentication/authorization and input validation.
- Enhance recommendations and analytics dashboards with richer metrics and UI polish.
- Improve documentation for API contracts and frontend state flows.

## Contributing
- Use ESLint (`npm run lint`) to maintain code quality.
- Follow the existing structure: React components/hooks under `src/`, API clients in `src/api/`, Express routers under `backend/routes/`, and shared backend utilities under `backend/db`, `backend/neo4j`, and `backend/utils`.
- Open an issue or PR with clear descriptions; seed data can be reset via `backend/seed.js` to simplify review.

## License
- The repository currently has no explicit license. Add one before public distribution.
