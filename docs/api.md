# Campunex REST API Specification

Base URL: `/api/v1`

## 1. Authentication & Verification
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user with campus email | No |
| `POST` | `/auth/login` | Authenticate user & issue JWT cookie | No |
| `POST` | `/auth/logout` | Clear token cookie | Yes |
| `GET` | `/auth/me` | Fetch authenticated user profile | Yes |
| `POST` | `/auth/verify-institution` | Verify 6-digit institutional OTP code | Yes |

## 2. Rides & PostGIS Spatial Matching
| Method | Endpoint | Description | Auth Required | Role |
|---|---|---|---|---|
| `GET` | `/rides/matches` | Query PostGIS spatial matches within 500m threshold | No | Any |
| `POST` | `/rides` | Driver publishes new ride | Yes | DRIVER |
| `GET` | `/rides/my-rides` | List driver's published rides | Yes | DRIVER |
| `POST` | `/rides/:id/requests` | Rider submits ride request | Yes | RIDER |
| `GET` | `/rides/requests/my-requests` | List rider's active requests | Yes | RIDER |
| `GET` | `/rides/:id/requests` | List incoming requests for driver's ride | Yes | DRIVER |
| `PATCH` | `/rides/requests/:requestId/status` | Driver accepts/rejects request | Yes | DRIVER |

## 3. Trips & Dual OTP Security
| Method | Endpoint | Description | Auth Required | Role |
|---|---|---|---|---|
| `GET` | `/trips/:id` | Fetch trip details & state | Yes | Participant |
| `POST` | `/trips/:id/start-otp` | Request 4-digit initiation OTP | Yes | DRIVER |
| `POST` | `/trips/:id/verify-start-otp` | Verify initiation OTP & start trip | Yes | DRIVER |
| `POST` | `/trips/:id/completion-otp` | Request 4-digit completion OTP | Yes | DRIVER |
| `POST` | `/trips/:id/verify-completion-otp` | Verify completion OTP & complete trip | Yes | DRIVER |

## 4. Dev GPS Simulator
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/dev/trips/:id/simulate-location` | Trigger automated waypoint playback over WebSockets | Yes |
