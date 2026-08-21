# Campunex — Campus Ride-Matching Platform

> **Campunex — Campus Ride-Matching Platform | Next.js, Node.js, PostgreSQL, PostGIS, Redis, WebSockets | Live Project**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.4-emerald)](https://postgis.net/)
[![Redis](https://img.shields.io/badge/Redis-7-red)](https://redis.io/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

---

## 📌 Resume Core Claims Supported

- **Geospatial Ride-Matching Engine**: Engineered a campus ride-matching system using PostgreSQL and PostGIS to match riders with drivers based on route overlap within a **500-meter proximity threshold**.
- **Real-Time GPS Tracking & Synchronization**: Implemented live driver location streaming and trip-state synchronization using Socket.IO WebSockets and Redis ephemeral caching.
- **Institutional Security & Dual OTP Verification**: Built institutional identity verification for `.edu` campus domains and dual 4-digit OTP security (initiation and completion) with SHA-256 Redis TTL hashing.

---

## 🏗️ System Architecture (Modular Monolith)

```text
                                 CAMPUNEX MONOLITH
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             │                                                     │
           Rider                                                 Driver
             │                                                     │
             └──────────────────────────┬──────────────────────────┘
                                        │
                                 Next.js 14 Web App
                                        │
                                REST API & WebSockets
                                        │
                                ┌───────v────────┐
                                │ Express Server │
                                └───────┬────────┘
                                        │
          ┌───────────────────┬─────────┴─────────┬───────────────────┐
          │                   │                   │                   │
    Auth Module         Rides Module        Match Engine         Trips Module
    (JWT / Cookie)      (PostGIS WKT)       (500m Threshold)     (Dual OTP)
          │                   │                   │                   │
          └───────────────────┴─────────┬─────────┴───────────────────┘
                                        │
                              ┌─────────┴─────────┐
                              │  Data Infrastructure │
                              └─────────┬─────────┘
                                        │
                       ┌────────────────┴────────────────┐
                       │                                 │
               PostgreSQL 16 + PostGIS                 Redis 7
               - Users & Institutions                  - Dual OTP Hashes (5 min TTL)
               - Route Geometries (LineString)          - Live Driver GPS Cache
               - GIST Spatial Indexes                  - Verification Attempt Limits
```

---

## 📍 PostGIS 500-Meter Route Matching Algorithm

```sql
SELECT 
  r.id,
  r.driver_id,
  u.name AS driver_name,
  ST_Distance(r.route_geometry::geography, ST_SetSRID(ST_MakePoint($pickup_lng, $pickup_lat), 4326)::geography) AS pickup_route_distance,
  ST_Distance(r.route_geometry::geography, ST_SetSRID(ST_MakePoint($dropoff_lng, $dropoff_lat), 4326)::geography) AS dropoff_route_distance
FROM rides r
JOIN users u ON r.driver_id = u.id
WHERE r.status = 'SCHEDULED'
  AND r.available_seats > 0
  AND r.departure_time BETWEEN $time_start AND $time_end
  -- 500-Meter Route Proximity Threshold
  AND ST_DWithin(r.route_geometry::geography, ST_SetSRID(ST_MakePoint($pickup_lng, $pickup_lat), 4326)::geography, 500)
  AND ST_DWithin(r.route_geometry::geography, ST_SetSRID(ST_MakePoint($dropoff_lng, $dropoff_lat), 4326)::geography, 500);
```

### Match Scoring Breakdown Matrix
| Metric | Weight | Description |
|---|---|---|
| **Route Proximity** | **40%** | Proximity of pickup & dropoff points to driver route polyline ($\le 500$m) |
| **Pickup Proximity** | **30%** | Distance between rider pickup and driver origin point |
| **Destination Proximity** | **20%** | Distance between rider dropoff and driver destination point |
| **Time Compatibility** | **10%** | Closeness of departure time ($\pm 30$ mins) |

---

## 🔒 Dual 4-Digit OTP Security Workflow

```text
Ride Accepted
      │
      v
Driver Requests Start OTP ───► Plain OTP Delivered to Rider (WebSockets)
      │                                    │
      ├────────────────────────────────────┘
      v
Driver Submits 4-Digit OTP ───► Server Verifies SHA-256 Redis Hash
      │
      v
Trip State: IN_PROGRESS
      │
      v
Driver Requests Completion OTP ───► Plain OTP Delivered to Rider
      │                                         │
      ├─────────────────────────────────────────┘
      v
Driver Submits Completion OTP ───► Verified ───► Trip State: COMPLETED (Persisted in PostgreSQL)
```

---

## ⚡ Quick Start & Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL 16+ with PostGIS extension enabled
- Redis (optional — automatically falls back to in-memory Redis mock if native daemon is absent)

### 1. Installation
```bash
git clone https://github.com/your-username/campunex.git
cd campunex
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campunex
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
DATABASE_URL=postgres://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/campunex
```

### 3. Build & Development
```bash
# Build all workspaces
npm run build

# Start backend server (Express + Socket.IO + DB Migrations)
npm run dev:server

# Start frontend application (Next.js)
npm run dev:web
```

---

## 🧪 Testing Suite

```bash
# Run Phase 4 & 5 PostGIS Matching Integration Test
node tests/phase4-5.test.js

# Run Phase 6 & 7 Dual OTP and WebSocket GPS Test
node tests/phase6-7.test.js
```

---

## 📁 Monorepo Structure

```text
campunex/
├── apps/
│   ├── web/                    # Next.js 14 App Router frontend
│   │   ├── app/                # Pages (landing, auth, dashboard, find, create, trip)
│   │   ├── components/         # Navbar, Leaflet Map component
│   │   └── lib/                # API and Socket.IO clients
│   └── server/                 # Express backend API & WebSocket server
│       ├── src/
│       │   ├── config/         # Database & Redis configurations
│       │   ├── db/             # PostGIS SQL migrations & seeds
│       │   ├── middleware/     # JWT Auth & RBAC middleware
│       │   ├── modules/        # auth, rides, matching, otp, trips, websocket
│       │   └── server.ts       # Server entrypoint
├── packages/
│   └── shared/                 # Shared TypeScript types, Zod schemas & constants
├── docs/                       # Architecture, DB, API & WebSocket documentation
├── tests/                      # E2E integration tests
└── README.md
```

---

## 📄 License
MIT License
