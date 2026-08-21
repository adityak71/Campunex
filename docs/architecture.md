# Campunex System Architecture

Campunex is built as a production-grade **Modular Monolith** designed for low-latency spatial matching and resilient trip state synchronization.

```text
                                 CAMPUNEX SYSTEM ARCHITECTURE
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │                                               │
               Next.js Web Client                              Mobile App (Future)
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              │
                                   REST API & WebSockets
                                              │
                                      ┌───────v────────┐
                                      │ Node.js Server │
                                      └───────┬────────┘
                                              │
          ┌───────────────────┬───────────────┼───────────────┬───────────────────┐
          │                   │               │               │                   │
    Auth Module         Users Module    Rides Module    Match Engine         Trips Module
    (JWT / Cookie)      (Institution)   (PostGIS WKT)   (500m Threshold)     (State Machine)
          │                   │               │               │                   │
          └───────────────────┴───────────────┼───────────────┴───────────────────┘
                                              │
                                    ┌─────────┴─────────┐
                                    │  Database Layer   │
                                    └─────────┬─────────┘
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       │                                             │
               PostgreSQL 16 + PostGIS                      Redis 7 Caching
               - User Identities                            - 4-Digit OTP Hashes (5 min TTL)
               - Route Geometries (LineString 4326)         - Ephemeral Live Driver Locations
               - GIST Spatial Indexes                       - Rate Limit & Verification Counters
               - Permanent Trip Log                         - State Sync Buffer
```

## Key Architectural Decouplings
- **PostgreSQL + PostGIS**: Authoritative source of truth for all persistent transactional data, spatial route line geometries, and proximity queries.
- **Redis**: High-frequency ephemeral data engine for 4-digit OTP hashes, rate-limiting, and instant driver coordinate lookup during active trips.
- **Socket.IO Real-Time Engine**: Authenticated room multiplexer broadcasting live GPS updates to riders without polling database tables.
