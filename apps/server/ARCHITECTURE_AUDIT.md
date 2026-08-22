# CAMPUNEX — ARCHITECTURE AUDIT & ROLE ISOLATION BLUEPRINT

## 1. Executive Summary
Campunex is a university ride-matching platform built with Node.js, Express, PostgreSQL 18, PostGIS, Redis, Next.js 14 (App Router), and WebSockets (Socket.IO).
This document provides a comprehensive audit of the system architecture, security boundaries, database relationships, and role-isolation refactoring strategy.

---

## 2. Core Role Matrix & Domain Boundaries

| Feature / Resource | RIDER Role | DRIVER Role | ADMIN Role |
| :--- | :--- | :--- | :--- |
| **Primary Route** | `/dashboard`, `/rides/find`, `/rides/requests`, `/trips` | `/driver`, `/driver/offer`, `/driver/rides`, `/driver/requests` | `/admin`, `/admin/users`, `/admin/universities` |
| **API Boundary** | `/api/v1/rider/*` | `/api/v1/driver/*` | `/api/v1/admin/*` |
| **Ride Creation** | ❌ FORBIDDEN | ✅ Allowed (`POST /driver/rides`) | ❌ Read-Only Audit |
| **Ride Search** | ✅ PostGIS Spatial Match Search | ❌ FORBIDDEN | ❌ Read-Only Audit |
| **Request Passenger Seat** | ✅ Allowed (`POST /rider/requests`) | ❌ FORBIDDEN | ❌ Read-Only Audit |
| **Manage Passenger Queue** | ❌ FORBIDDEN | ✅ Allowed (`PATCH /driver/requests/:id/status`) | ❌ Read-Only Audit |
| **OTP Generation** | ✅ Unique 4-Digit Rider OTP | ❌ Cannot view Plaintext OTP | ❌ System Hash Only |
| **OTP Verification** | ❌ Cannot verify OTP | ✅ Driver enters Rider's OTP | ❌ Audit Log |
| **Live Telemetry** | 📡 Recipient Stream Listener | 📡 Sender GPS Broadcaster | 📡 Audit Log |
| **Institution Domains** | ❌ Read-Only (.edu matching) | ❌ Read-Only (.edu matching) | ✅ Full CRUD |

---

## 3. Database Schemas & Relationship Integrity

1. **`users` Table**: Stores authenticated identity, role (`RIDER`, `DRIVER`, `ADMIN`), and institution verification status (`PENDING`, `VERIFIED`).
2. **`rides` Table**: Represents Driver-published ride inventory (`driver_id` foreign key $\rightarrow$ `users.id`).
3. **`ride_requests` Table**: Represents Rider booking requests against Driver rides (`rider_id` $\rightarrow$ `users.id`, `ride_id` $\rightarrow$ `rides.id`).
4. **`trips` Table**: Active trip lifecycle instance initialized upon Driver acceptance (`driver_id`, `rider_id`, `ride_id`).
5. **`notifications` Table**: User-owned notifications linked strictly via `user_id = req.user.id` and filtered by `role`.

---

## 4. Security & Refactoring Execution Steps

1. **Backend Route Namespacing**:
   - `/api/v1/rider/*`: Enforces `requireRole('RIDER')`
   - `/api/v1/driver/*`: Enforces `requireRole('DRIVER')`
   - `/api/v1/admin/*`: Enforces `requireRole('ADMIN')`
   - `/api/v1/auth/*` & `/api/v1/notifications/*`: Authenticated shared services.
2. **IDOR & Resource Ownership Middleware**:
   - Verify `ride.driver_id === req.user.userId` for driver ride operations.
   - Verify `trip.driver_id === req.user.userId || trip.rider_id === req.user.userId` for live trip operations.
   - Verify `request.rider_id === req.user.userId` for rider request cancellations.
3. **Frontend Route Guards & Role-Aware Navigation**:
   - Ensure role navigation menus never leak cross-role links.
   - `/admin` access returns `403 Forbidden` for non-admin users.
