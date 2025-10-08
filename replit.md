# Vue 3 + Express Authentication App

## Overview

This is a full-stack web application built with Vue 3 frontend and Express backend, featuring Replit-based OAuth authentication. The application uses PostgreSQL for data persistence with Drizzle ORM for type-safe database operations. The architecture follows a monorepo structure where the frontend (Vue/Vite) and backend (Express) are separated but share common schema definitions.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 8, 2025**: Replit Auth integration completed
- Added Replit Auth using OpenID Connect (OIDC) with Passport.js
- Set up PostgreSQL database with users and sessions tables using Drizzle ORM
- Created Express backend server with authentication endpoints (/api/login, /api/logout, /api/callback, /api/auth/user)
- Implemented Vue frontend with authentication composable (useAuth) and router guards
- Created Landing page for unauthenticated users and Home page for authenticated users
- Configured Vite proxy to forward /api requests to Express backend
- Set up dual workflows: Backend (port 3000) and Frontend (port 5000)

## System Architecture

### Frontend Architecture

**Framework & Build Tool**: Vue 3 with Vite as the build tool and development server. The application uses the Composition API pattern with composables for shared logic.

**State Management**: Pinia is used for application-wide state management, with a modular store architecture. The `useAuth` composable handles authentication state separately from the Pinia stores.

**Routing**: Vue Router manages client-side routing with route guards that protect authenticated routes. The router checks authentication status on each navigation and redirects unauthenticated users to the landing page.

**Design Decisions**:
- **Composition API over Options API**: Provides better TypeScript support and code reusability through composables
- **Route-level authentication**: Guards implemented at the router level check authentication status by calling the backend API before allowing access to protected routes
- **Proxy configuration**: The Vite dev server proxies `/api` requests to the Express backend (port 3000) to avoid CORS issues during development

### Backend Architecture

**Framework**: Express 5.x serves as the HTTP server framework, handling API routes and authentication flows.

**Authentication Strategy**: 
- **OpenID Connect (OIDC)** integration with Replit's authentication service
- **Passport.js** middleware handles OAuth2 flow
- **Session-based authentication** using express-session with PostgreSQL session store for persistence
- Sessions have a 7-day TTL with automatic refresh on activity

**Database Access Layer**:
- **Repository pattern** implemented through the `storage` interface (`IStorage`)
- `DatabaseStorage` class provides concrete implementation for user operations
- Abstraction allows for easy swapping of storage backends if needed

**Design Decisions**:
- **Session storage in database**: Ensures sessions persist across server restarts and enables horizontal scaling
- **Memoized OIDC configuration**: The `getOidcConfig` function caches the OpenID configuration for 1 hour to reduce external API calls
- **Shared schema definitions**: The `/shared` directory contains database schemas used by both frontend and backend, ensuring type consistency

### Data Layer

**ORM**: Drizzle ORM provides type-safe database queries with PostgreSQL dialect.

**Database Schema**:
- **users table**: Stores user profile information (id, email, firstName, lastName, profileImageUrl, timestamps)
- **sessions table**: Stores express-session data (sid, sess JSON blob, expire timestamp)
- UUID generation handled by PostgreSQL's `gen_random_uuid()` function
- Upsert pattern used for user creation/updates to handle OAuth flow where users may already exist

**Connection Management**:
- **Neon serverless PostgreSQL** driver for WebSocket-based connections
- Connection pooling via `@neondatabase/serverless` Pool
- WebSocket constructor explicitly set to support serverless environments

**Design Decisions**:
- **Drizzle over other ORMs**: Chosen for its lightweight nature, excellent TypeScript support, and SQL-like query builder
- **Indexed sessions**: The sessions table includes an index on the `expire` column for efficient cleanup queries
- **Shared schema location**: Placed in `/shared` directory to ensure frontend and backend use identical type definitions

### External Dependencies

**Authentication Provider**: 
- **Replit OIDC** (OpenID Connect) service for OAuth2 authentication
- Issuer URL: `https://replit.com/oidc` (configurable via `ISSUER_URL` env var)
- Requires `REPL_ID` and `REPLIT_DOMAINS` environment variables

**Database**:
- **PostgreSQL** (via Neon serverless driver)
- Requires `DATABASE_URL` environment variable
- Uses WebSocket connections for serverless compatibility

**Third-party Libraries**:
- **openid-client**: OIDC client implementation for authentication
- **passport & passport-oauth2**: Authentication middleware and OAuth2 strategy
- **connect-pg-simple**: PostgreSQL session store for express-session
- **memoizee**: Function memoization for caching OIDC configuration
- **ws**: WebSocket implementation for Neon database connections

**Development Tools**:
- **Playwright**: End-to-end testing framework
- **Vitest**: Unit testing framework with jsdom environment
- **ESLint & Prettier**: Code quality and formatting tools

**Environment Variables Required**:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption
- `REPL_ID`: Replit application identifier
- `REPLIT_DOMAINS`: Allowed domains for OAuth callbacks
- `ISSUER_URL` (optional): OIDC issuer URL, defaults to Replit's service