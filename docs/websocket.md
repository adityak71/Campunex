# WebSockets & Live GPS Streaming Specification

Campunex uses **Socket.IO** for real-time driver GPS tracking and trip state notifications.

## Authentication Handshake
Clients authenticate during handshake by passing the JWT token in `auth.token` or the HTTP-only cookie. Connections without valid tokens are rejected.

## Dynamic Room Channels
Channel Format: `trip:{tripId}`

Authorization Policy: Only the driver (`driver_id`) or rider (`rider_id`) belonging to the trip are allowed to join `trip:{tripId}`.

## Socket.IO Event Contract

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `trip:join` | Client -> Server | `{ tripId: string }` | Join authorized trip room |
| `trip:leave` | Client -> Server | `{ tripId: string }` | Leave trip room |
| `trip:location` | Driver -> Server | `{ tripId, latitude, longitude, timestamp }` | Stream driver GPS coordinate |
| `trip:location_update` | Server -> Rider | `{ tripId, latitude, longitude, timestamp }` | Broadcast location to rider map |
| `trip:otp_generated` | Server -> Rider | `{ tripId, type, otp }` | Secure plain OTP delivery to rider |
| `trip:status_change` | Server -> Room | `{ tripId, status, timestamp }` | State machine transition alert |
| `trip:reconnect_sync` | Client -> Server | `{ tripId }` | Request state sync after network drop |
| `trip:sync_state` | Server -> Client | `{ tripId, status, lastLocation }` | Current state and last GPS from Redis |
