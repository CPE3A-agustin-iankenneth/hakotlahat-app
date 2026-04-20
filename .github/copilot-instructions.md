# Project: HakotLahat
A smart, unified web platform for municipal waste collection optimization. 

## Tech Stack
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend/Auth:** Supabase (PostgreSQL, Auth, Edge Storage)
- **Maps:** `MapCN` built on MapLibreGL
- **APIs:** - OpenRouteService (Optimization & Directions)
  - Open-Meteo (Weather overlays)
  - Google Gemini API (`gemini-3-flash` for image assessment)

## User Roles (RBAC)
1. **Resident:** Frictionless mobile UI to request pickups and upload waste photos.
2. **Driver:** Dark-mode, high-contrast mobile map interface for route navigation and gamified tracking.
3. **Admin:** Desktop control panel for fleet tracking and manual overrides.

## Database Schema (Postgres / Supabase)

### `users`
- `id` (uuid, PK, refs `auth.users`)
- `role` (text: 'resident' | 'driver' | 'admin')
- `full_name` (text)
- `email` (text)
- `avatar_url` (text, nullable)
- `has_onboarded` (boolean, default: false)
- `home_lat` (numeric, nullable)
- `home_lng` (numeric, nullable)
- `home_address` (text, nullable)
- `created_at` (timestamptz)

### `pickup_requests`
- `id` (uuid, PK)
- `resident_id` (uuid, FK to `users.id`)
- `lat` (numeric)
- `lng` (numeric)
- `image_url` (text, nullable)
- `status` (text: 'pending' | 'scheduled' | 'collected')
- `priority_score` (integer, default: 1)
- `volume_estimate` (text, nullable)
- `created_at` (timestamptz)

### `routes`
- `id` (uuid, PK)
- `driver_id` (uuid, FK to `users.id`)
- `status` (text: 'active' | 'completed')
- `optimized_path` (jsonb)
- `created_at` (timestamptz)

## Core System Workflows
1. **AI Vision:** Resident uploads image to Supabase Storage -> Next.js Server Action sends URL to Gemini API -> Updates `pickup_requests` with `priority_score` and `volume_estimate`.
2. **Routing:** System queries 'pending' requests -> Sends coordinates + priority weights to OpenRouteService Optimization API -> Saves JSON sequence to `routes`.
3. **Driver Client:** Fetches active `routes` row -> Draws polyline via `react-leaflet` -> Checks Open-Meteo based on current GPS for weather warnings.