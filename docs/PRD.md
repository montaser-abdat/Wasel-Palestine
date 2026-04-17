# Wasel Palestine — Product Requirements Document
# Smart Mobility & Checkpoint Intelligence System

- **Version:** 1.0 — March 2026
- **Status:** Draft — Ready for Implementation
- **Stack:** NestJS · MySQL · Vanilla JS · Leaflet
- **Audience:** Development Team · University Reviewers

---

> ⚠️ **CRITICAL — READ BEFORE CODING:**
> Authentication (login/register) and database configuration are **already implemented**.
> The frontend is **already complete** but may need endpoint URL updates.
> **Before writing any code**, inspect the existing codebase — see Section 19 for the full checklist.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Objectives](#3-goals--objectives)
4. [Scope](#4-scope)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [System Architecture](#6-system-architecture)
7. [Features Breakdown](#7-features-breakdown)
8. [User Stories](#8-user-stories)
9. [Functional Requirements](#9-functional-requirements)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Database Schema](#11-database-schema)
12. [API Reference](#12-api-reference)
13. [Frontend–Backend Interaction](#13-frontendbackend-interaction)
14. [External API Integration](#14-external-api-integration)
15. [Error Handling](#15-error-handling)
16. [Edge Cases](#16-edge-cases)
17. [Validation Rules](#17-validation-rules)
18. [Acceptance Criteria](#18-acceptance-criteria)
19. [Implementation Guide for AI Assistant](#19-implementation-guide-for-ai-assistant)

---

## 1. Overview

Wasel Palestine is a backend-driven, production-grade smart mobility platform built for the Palestinian context. It aggregates real-time data about road conditions, military checkpoints, traffic incidents, and weather to help users navigate safely and efficiently.

**The platform exposes a RESTful API consumed by:**
- A Vanilla JS / Leaflet web dashboard (already built)
- Mobile applications (future scope)
- Third-party systems via open API

**Tech stack:**
- Backend: NestJS (Node.js)
- Database: MySQL (via TypeORM)
- Routing: OpenStreetMap / OSRM
- Maps: Leaflet
- Weather: OpenWeatherMap API
- Cache: NodeCache (in-memory)

---

## 2. Problem Statement

Palestinians navigating the West Bank face a uniquely complex mobility environment. Existing tools like Google Maps and Waze are not designed for this context.

**What existing tools don't cover:**
- Checkpoint states: open / partially closed / fully closed
- Checkpoint delay times from crowd-sourced and admin-verified data
- Incidents reported by locals with credibility-weighted validation
- Alternative routing that avoids specific checkpoints or dangerous areas
- Weather conditions that compound travel difficulty

**What Wasel Palestine provides:**
Admin-managed authoritative data combined with a credible crowd-sourced reporting layer, surfaced through clean structured APIs.

---

## 3. Goals & Objectives

### 3.1 Primary Goals

1. Provide real-time, reliable intelligence about checkpoints and road conditions
2. Enable community-driven incident reporting with credibility controls
3. Offer smart route estimation that incorporates checkpoint and incident data
4. Alert subscribed users when verified incidents occur in their categories of interest
5. Integrate external geolocation and weather data seamlessly

### 3.2 Technical Objectives

1. Build a modular, SOLID-compliant NestJS backend
2. Design a normalized MySQL schema with full audit trails
3. Achieve < 500ms response time for all non-routing endpoints under 100 concurrent users
4. Cache external API responses (15–30 min TTL) to reduce latency and costs
5. Implement JWT-based authentication with per-user rate limiting (100 req/hr)

---

## 4. Scope

### 4.1 In-Scope Features

**Authentication**
- JWT login/register, role management (User/Admin), refresh tokens

**Checkpoints**
- CRUD, status management (open/partial/closed), status history log

**Incidents**
- CRUD, lifecycle (Pending → Verified → Closed), severity levels, categories, filtering, pagination

**Crowd Reports**
- Submit, validate, duplicate detection, moderation workflow, credibility scoring, voting, audit log

**Route Estimation**
- Origin → destination, full polyline, avoid-checkpoint constraint, weather & incident overlays, up to 3 alternatives

**Alerts**
- Category subscriptions, DB-stored notifications triggered by verified incidents

**External APIs**
- Weather (current conditions), OpenStreetMap/OSRM routing, with caching and fallback

**Admin Tools**
- Moderate reports, verify incidents, manage checkpoints, view audit logs

### 4.2 Out-of-Scope

- Push notifications (FCM/APNs) — future integration only
- Email/SMS delivery — notification records stored but not dispatched
- Mobile native applications
- Paid map APIs (Google Maps, HERE) — OpenStreetMap/OSRM only
- Offline-first mobile caching
- Multi-language UI — backend stores content as-is; localization is a frontend concern
- Formal GDPR/PDPL compliance — university project scope

---

## 5. User Roles & Permissions

There are exactly **two roles**: `user` and `admin`.
**All endpoints require authentication — no guest or anonymous access.**

### Role: User (authenticated regular user)

- Register / Login ✔
- View checkpoints & incidents ✔
- Submit crowd reports ✔
- Vote on reports (not own) ✔
- Subscribe to alert categories ✔
- View own notifications ✔
- Request route estimation ✔
- Create / update checkpoints ✗
- Change checkpoint status ✗
- Verify / reject / close incidents ✗
- Moderate crowd reports ✗
- View all audit logs ✗
- Manage user credibility ✗
- View all users ✗

### Role: Admin (all User permissions, plus)

- Create / update checkpoints ✔
- Change checkpoint status ✔
- Verify / reject / close incidents ✔
- Moderate crowd reports (accept/reject) ✔
- View all audit logs ✔
- Manage user credibility manually ✔
- View all users ✔

---

## 6. System Architecture

### 6.1 High-Level Flow

```
Client (Vanilla JS + Leaflet)
    │
    ▼
NestJS REST API  ──►  MySQL Database
    │
    ├──►  OSRM / OpenStreetMap  ──►  NodeCache (TTL: 15 min)
    │
    └──►  OpenWeatherMap API    ──►  NodeCache (TTL: 30 min)
```

### 6.2 NestJS Modules

Each module is **self-contained**: controller + service + repository + DTOs + entities.
Modules communicate only through exported services — never by directly importing another module's repository.

**AuthModule**
- Responsibility: JWT strategy, login, register, token refresh
- Guards: JwtAuthGuard, RolesGuard

**UsersModule**
- Responsibility: User entity, profile, credibility score, role management

**CheckpointsModule**
- Responsibility: Checkpoint CRUD, status management, status history

**IncidentsModule**
- Responsibility: Incident lifecycle, categories, severity, filtering, pagination

**ReportsModule**
- Responsibility: Crowd report submission, duplicate detection, moderation, voting

**RoutesModule**
- Responsibility: Route estimation orchestration, polyline, checkpoint overlay, incident delay injection

**AlertsModule**
- Responsibility: Subscriptions, notification record creation, user notification retrieval

**WeatherModule**
- Responsibility: Weather API client, caching, DTO normalization

**GeoModule**
- Responsibility: OSRM client, route calculation, geometry handling, caching

**AuditModule**
- Responsibility: Audit log entity, decorator-driven logging for all mutating actions

**CommonModule**
- Responsibility: Shared utilities — pagination, response wrappers, constants, validators

### 6.3 SOLID Principles Applied

- **Single Responsibility:** Each service has one job. Example: `DuplicateDetectionService` only checks for duplicates.
- **Open/Closed:** Severity levels and incident categories are config-driven enums — extendable without modifying service logic.
- **Liskov Substitution:** External API clients implement common interfaces (`IRoutingClient`, `IWeatherClient`) — swap providers without refactoring.
- **Interface Segregation:** Admin-only operations are in separate controller methods decorated with `@Roles(Role.Admin)`.
- **Dependency Inversion:** All services receive dependencies via NestJS DI — no direct instantiation.

### 6.4 Frontend Note

> The frontend is already complete (Vanilla JS + Leaflet). It consumes the NestJS API using `fetch()` — no frontend framework is used. Read existing frontend files before modifying anything.

---

## 7. Features Breakdown

---

### 7.1 Authentication ✅ ALREADY IMPLEMENTED

> Do not re-implement. Inspect existing code in `src/auth/` before touching anything.

**Endpoints:**
- `POST /auth/register` — Create account with email, password, name
- `POST /auth/login` — Return JWT access token

**Behavior:**
- JWT payload: `{ sub: userId, email, role }`
- Passwords hashed with bcrypt — minimum 10 rounds
- Rate limiting: 100 requests per user per hour via `@nestjs/throttler`

---

### 7.2 Checkpoint Management

**Entities:**

`Checkpoint`
- `id` · `name` · `name_ar` · `latitude` · `longitude`
- `type`: `military` | `commercial` | `internal`
- `status`: `open` | `partial` | `closed`
- `notes` · `created_by` (admin FK) · `created_at` · `updated_at` · `deleted_at`

`CheckpointStatusHistory`
- `id` · `checkpoint_id` · `old_status` · `new_status` · `changed_by` · `reason` · `timestamp`

**Behaviors:**
- Only Admins can create, update, or change checkpoint status
- Every status change is automatically logged to `CheckpointStatusHistory`
- Leaflet map markers are color-coded: green = open, orange = partial, red = closed
- Deleted checkpoints are soft-deleted (`deleted_at` set); history is always preserved

---

### 7.3 Incident Management

**Categories (enum: `IncidentCategory`):**

- `CHECKPOINT_CLOSURE` — Checkpoint fully or partially closed
- `CHECKPOINT_DELAY` — Unusually long queues at a checkpoint
- `ROAD_CLOSURE` — Road blocked by military, construction, or other cause
- `ACCIDENT` — Traffic accident affecting flow
- `WEATHER_HAZARD` — Weather-related road danger
- `PROTEST` — Protest or gathering affecting mobility
- `SHOOTING` — Armed incident in the area
- `OTHER` — Uncategorized incident

**Lifecycle:**

```
PENDING  ──►  VERIFIED  ──►  CLOSED
```

- `PENDING`: Default on creation (by admin, or via promoted crowd report). Does NOT trigger alerts.
- `VERIFIED`: Admin confirms incident is real. **Triggers alert notifications to subscribers.**
- `CLOSED`: Incident resolved. Remains in history for analytics.
- Fake/duplicate incidents: Admin can delete or leave as PENDING — they will never trigger alerts.

**Severity levels (enum: `SeverityLevel`):**

- `LOW` — Minor inconvenience, alternative routes easily available
- `MEDIUM` — Significant delay expected
- `HIGH` — Major disruption, route heavily affected
- `CRITICAL` — Area should be avoided entirely

**Filtering & Pagination:**
- Filter by: `category`, `severity`, `status`, date range, `checkpoint_id`, bounding box (lat/lng)
- Sort by: `created_at`, `severity`, `status`
- Pagination: `page` + `limit` (default: 20, max: 100)

---

### 7.4 Crowdsourced Reporting

#### 7.4.1 Report Submission

User submits: `latitude`, `longitude`, `category`, `description`
- `timestamp` is auto-set server-side
- System checks for duplicates before saving
- Report enters PENDING moderation queue

#### 7.4.2 Moderation Workflow

Admin actions on PENDING reports:
- **ACCEPT** → creates or links to an Incident
- **REJECT** → marks report as rejected with a reason

Score effects:
- Accepted → reporter's credibility score **+5**
- Rejected → reporter's credibility score **−2**

All moderation actions are logged to the Audit Log.

#### 7.4.3 Duplicate Detection

**A report is a duplicate if ALL three conditions are true:**
1. Same `category` as an existing report
2. Within **100 meters** of an existing PENDING or VERIFIED report
3. Submitted within **1 hour** of the existing report

**On duplicate detection:**
- `duplicate_count` on the original report is incremented
- The duplicate is rejected with HTTP 409 + explanation + original report ID
- The original report's credibility weight increases slightly

> Thresholds (100m, 1hr) are stored as configurable constants — easy to tune.

#### 7.4.4 Credibility Scoring

Two-dimensional system:

**User Credibility Score (lifetime)**
- Starts at: **50**
- Range: **0 – 100**
- Changes:
  - Report accepted by Admin → **+5**
  - Report rejected by Admin → **−2**
  - Report receives upvote → **+1**
  - Report receives downvote → **−1**
  - Pattern of fake reports → flagged for priority review

**Report Credibility Score (per-report)**
- Formula: `base_user_score + (upvotes × 2) − (downvotes × 1)`
- Calculated at submission time from votes + user score

#### 7.4.5 Voting

- Who can vote: any authenticated user **except the report's author**
- One vote per user per report
- Changing vote is allowed — replaces the previous vote
- Stored fields: `voter_id`, `report_id`, `vote_type`, `created_at`

#### 7.4.6 Abuse Prevention

- Rate limit: max **10 report submissions per user per hour**
- Users with credibility score **< 20** → reports auto-flagged `is_priority_review = true`
- All actions are auditable (see §7.8)

---

### 7.5 Route Estimation

#### 7.5.1 Overview

The system is an **orchestration layer over OSRM**. It enhances raw routing with checkpoint status, active incident delays, and weather conditions.

#### 7.5.2 Request Parameters

**Required:**
- `origin_lat` — float, starting latitude
- `origin_lng` — float, starting longitude
- `dest_lat` — float, destination latitude
- `dest_lng` — float, destination longitude

**Optional:**
- `avoid_checkpoints` — boolean (default: false). If true, reroute around all non-open checkpoints.
- `avoid_area` — GeoJSON Polygon. Area to avoid entirely.
- `alternatives` — integer 1–3 (default: 2). Number of alternative routes to return.

#### 7.5.3 Response Structure

```json
{
  "routes": [
    {
      "distance_meters": 12000,
      "duration_seconds": 1800,
      "estimated_delay_seconds": 900,
      "polyline": { "type": "LineString", "coordinates": [...] },
      "explanation": [
        "Checkpoint Huwwara is partially closed — +15 min delay estimated",
        "Active ROAD_CLOSURE incident near route — +5 min delay"
      ]
    }
  ],
  "weather_summary": {
    "temp": 18,
    "wind_speed": 12,
    "condition": "cloudy",
    "humidity": 65,
    "stale": false
  }
}
```

#### 7.5.4 Checkpoint Overlay Logic

```
Step 1: Fetch all checkpoints from DB
Step 2: Find checkpoints within 200m of each route's polyline
Step 3: If avoid_checkpoints=true → send those coordinates as exclusion waypoints to OSRM → regenerate route
Step 4: If a checkpoint is PARTIAL or CLOSED and not avoided → add delay to duration + add entry to explanation[]
Step 5: VERIFIED incidents near the route → add estimated_delay_minutes to total duration
```

---

### 7.6 Alerts & Notifications

#### 7.6.1 Subscriptions

- Users subscribe to one or more `IncidentCategory` values
- Stored as: `user_id`, `category`, `created_at`
- One subscription per category per user (unique constraint)

#### 7.6.2 Notification Trigger

**When an Admin moves an incident to VERIFIED:**
1. Query all users subscribed to that incident's category
2. Create one `Notification` record per subscribed user
3. Notification fields: `id`, `user_id`, `incident_id`, `message`, `is_read`, `created_at`

#### 7.6.3 Notification Retrieval

- `GET /notifications` — all notifications for the authenticated user
- `PATCH /notifications/:id/read` — mark one as read
- `GET /notifications/unread-count` — returns integer count

---

### 7.7 External Integrations

#### 7.7.1 OSRM / OpenStreetMap Routing

- Interface: `IRoutingClient`
- Implementation: `OsrmRoutingService`
- Base URL: `http://router.project-osrm.org` (public) or self-hosted
- Endpoint: `/route/v1/driving/{coords}?alternatives=true&geometries=geojson&overview=full`
- Avoid-checkpoint strategy: pass checkpoint coordinates via `radiuses` parameter
- Timeout: 5 seconds
- Cache key: `hash(origin + destination + options)` — TTL: 15 minutes
- Fallback: return cached result with `stale: true`, or HTTP 503 if no cache

#### 7.7.2 OpenWeatherMap API

- Interface: `IWeatherClient`
- Implementation: `OpenWeatherMapService`
- Base URL: `api.openweathermap.org`
- Endpoint: `/data/2.5/weather?lat=&lon=&units=metric&appid=API_KEY`
- Fields: `temp`, `wind_speed`, `weather[0].description`, `humidity`
- Cache key: `round(lat, 2) + ',' + round(lng, 2)` — TTL: 30 minutes
- Fallback: return last cached result with `stale: true`, or `null` in route response
- Weather does NOT block routing — only affects `explanation[]`

---

### 7.8 Audit Log

**Every mutating action is logged** — create, update, delete, status-change, vote, moderation.

`AuditLog` entity fields:
- `id` · `actor_id` (FK → users, NULL if system) · `action` (string enum)
- `entity_type` (e.g. `'report'`, `'incident'`) · `entity_id`
- `old_value` (JSON snapshot before) · `new_value` (JSON snapshot after)
- `ip_address` · `created_at`

**Implementation:** NestJS interceptor + `AuditService.log()` called after each mutating operation.

**Access:** Only Admins can query `GET /audit-logs` — filterable by `entity_type`, `actor_id`, date range.

---

## 8. User Stories

### Authentication
- As a new user, I want to register with email and password so I can access the platform.
- As a returning user, I want to log in and receive a JWT so I can make authenticated requests.

### Checkpoints
- As an Admin, I want to add a new checkpoint with its location and type so it appears on the map.
- As an Admin, I want to change a checkpoint's status and provide a reason so users are informed.
- As a User, I want to see all active checkpoints on the map so I can plan my route.

### Incidents
- As an Admin, I want to create a verified incident immediately when I have confirmed information.
- As an Admin, I want to promote a crowd report to a verified incident after review.
- As a User, I want to filter incidents by category and severity to find relevant alerts.

### Crowd Reports
- As a User, I want to report an incident at my location with a description.
- As a User, I want to upvote a report I witnessed to increase its credibility.
- As an Admin, I want to see all pending reports and accept or reject them.
- As a User, I want to see my credibility score to know how my contributions are rated.

### Route Estimation
- As a User, I want to enter origin and destination and receive multiple route options with estimated travel time.
- As a User, I want to avoid all non-open checkpoints so my route is safer.
- As a User, I want to understand why a route is rated as it is, including delays and weather.

### Alerts & Notifications
- As a User, I want to subscribe to CHECKPOINT_CLOSURE alerts so I am notified of verified closures.
- As a User, I want to see all my unread notifications in one place.

---

## 9. Functional Requirements

### Authentication
- REQ-1: System MUST hash passwords using bcrypt with >= 10 salt rounds
- REQ-2: System MUST return a signed JWT on successful login
- REQ-3: JWT MUST contain: `sub` (userId), `email`, `role`
- REQ-4: All endpoints except `/auth/login` and `/auth/register` MUST require a valid JWT

### Checkpoints
- REQ-5: Admins MUST be able to create checkpoints with name, coordinates, type, and initial status
- REQ-6: Every checkpoint status change MUST be logged to `CheckpointStatusHistory`
- REQ-7: Checkpoints MUST be soft-deleted (history preserved)
- REQ-8: All active checkpoints with current status MUST be returned for map rendering

### Incidents
- REQ-9: System MUST enforce lifecycle: PENDING → VERIFIED → CLOSED only (no backwards transitions)
- REQ-10: Moving an incident to VERIFIED MUST trigger notifications to all relevant subscribers
- REQ-11: System MUST support filtering by category, severity, status, date range, and bounding box
- REQ-12: All list endpoints MUST support pagination

### Crowd Reports
- REQ-13: System MUST check for duplicate reports before accepting any new submission
- REQ-14: Duplicates MUST be rejected with HTTP 409 and include the original report ID
- REQ-15: Users MUST NOT be able to vote on their own reports
- REQ-16: Users MUST NOT submit more than 10 reports per hour
- REQ-17: `duplicate_count` on the original report MUST be incremented when a duplicate is detected

### Route Estimation
- REQ-18: System MUST return at least 1 route; up to 3 alternatives when requested
- REQ-19: Each route MUST include a full GeoJSON polyline
- REQ-20: Checkpoint delays MUST be overlaid on route duration when checkpoints are on the path
- REQ-21: VERIFIED incident delays MUST be added to affected route durations
- REQ-22: `weather_summary` MUST be included in every route response

### Alerts
- REQ-23: When an incident is verified, notification records MUST be created for all category subscribers
- REQ-24: Users MUST be able to mark notifications as read
- REQ-25: System MUST return an accurate unread notification count

---

## 10. Non-Functional Requirements

**Performance**
- P95 response time < 500ms for all non-routing endpoints under 100 concurrent users
- Route estimation must complete < 2s including external API calls (with cache hits)

**Scalability**
- Stateless NestJS application — all state lives in MySQL or in-memory cache

**Security**
- JWT HS256 minimum; all secrets in `.env`; no secrets in codebase
- Rate limiting: 100 req/user/hr globally; 10 report submissions/user/hr
- Users can only access their own profile data; Admins can access all

**Reliability**
- External API failures must be handled gracefully — cached fallback or HTTP 503

**Maintainability**
- Each NestJS module must be independently testable

**Auditability**
- Every mutating operation must produce an `AuditLog` entry

**Data Integrity**
- All FK relationships enforced at DB level; cascades defined explicitly

**Caching**
- Weather API: 30 min TTL
- Routing API: 15 min TTL
- Implementation: in-memory NodeCache

**Availability**
- System targets 99% uptime (university project constraint)

---

## 11. Database Schema

### Entity List

- `users` — Registered users with roles and credibility scores
- `checkpoints` — Permanent checkpoint locations managed by Admins
- `checkpoint_status_history` — Timestamped log of every checkpoint status change
- `incidents` — Time-bound events (closures, accidents, hazards)
- `reports` — Crowd-sourced submissions pending moderation
- `report_votes` — User votes (up/down) on individual reports
- `alert_subscriptions` — User subscriptions to incident categories
- `notifications` — Notification records created when incidents are verified
- `audit_logs` — Immutable log of all mutating actions system-wide

---

### Table: `users`

```
id                INT           PK, AUTO_INCREMENT
name              VARCHAR(100)  NOT NULL
email             VARCHAR(255)  NOT NULL, UNIQUE
password_hash     VARCHAR(255)  NOT NULL  -- bcrypt
role              ENUM          'user' | 'admin', NOT NULL, DEFAULT 'user'
credibility_score INT           NOT NULL, DEFAULT 50  -- range: 0–100
is_active         BOOLEAN       NOT NULL, DEFAULT TRUE  -- soft disable
created_at        DATETIME      NOT NULL, DEFAULT CURRENT_TIMESTAMP
updated_at        DATETIME      ON UPDATE CURRENT_TIMESTAMP
```

---

### Table: `checkpoints`

```
id          INT           PK, AUTO_INCREMENT
name        VARCHAR(200)  NOT NULL  -- English name
name_ar     VARCHAR(200)  NULLABLE  -- Arabic name (optional)
latitude    DECIMAL(10,7) NOT NULL
longitude   DECIMAL(10,7) NOT NULL
type        ENUM          'military' | 'commercial' | 'internal', NOT NULL
status      ENUM          'open' | 'partial' | 'closed', NOT NULL, DEFAULT 'open'
notes       TEXT          NULLABLE  -- Admin notes
created_by  INT           NOT NULL, FK → users.id
deleted_at  DATETIME      NULLABLE  -- soft delete
created_at  DATETIME      NOT NULL, DEFAULT CURRENT_TIMESTAMP
updated_at  DATETIME      ON UPDATE CURRENT_TIMESTAMP
```

---

### Table: `checkpoint_status_history`

```
id             INT      PK, AUTO_INCREMENT
checkpoint_id  INT      NOT NULL, FK → checkpoints.id, CASCADE DELETE
old_status     ENUM     'open' | 'partial' | 'closed', NULLABLE
new_status     ENUM     'open' | 'partial' | 'closed', NOT NULL
reason         TEXT     NULLABLE
changed_by     INT      NOT NULL, FK → users.id  -- must be Admin
changed_at     DATETIME NOT NULL, DEFAULT CURRENT_TIMESTAMP
```

---

### Table: `incidents`

```
id                       INT           PK, AUTO_INCREMENT
title                    VARCHAR(200)  NOT NULL
description              TEXT          NULLABLE
category                 ENUM          see IncidentCategory, NOT NULL
severity                 ENUM          'low' | 'medium' | 'high' | 'critical', NOT NULL
status                   ENUM          'pending' | 'verified' | 'closed', NOT NULL, DEFAULT 'pending'
latitude                 DECIMAL(10,7) NOT NULL
longitude                DECIMAL(10,7) NOT NULL
checkpoint_id            INT           NULLABLE, FK → checkpoints.id  -- optional link
estimated_delay_minutes  INT           NULLABLE  -- used in route overlay
source_report_id         INT           NULLABLE, FK → reports.id  -- if promoted from crowd report
created_by               INT           NOT NULL, FK → users.id
verified_by              INT           NULLABLE, FK → users.id  -- Admin who verified
verified_at              DATETIME      NULLABLE
closed_at                DATETIME      NULLABLE
created_at               DATETIME      NOT NULL, DEFAULT CURRENT_TIMESTAMP
updated_at               DATETIME      ON UPDATE CURRENT_TIMESTAMP
```

---

### Table: `reports`

```
id                INT           PK, AUTO_INCREMENT
user_id           INT           NOT NULL, FK → users.id  -- reporter
category          ENUM          see IncidentCategory, NOT NULL
description       TEXT          NOT NULL
latitude          DECIMAL(10,7) NOT NULL
longitude         DECIMAL(10,7) NOT NULL
status            ENUM          'pending' | 'accepted' | 'rejected', NOT NULL, DEFAULT 'pending'
rejection_reason  TEXT          NULLABLE  -- set when rejected
credibility_score INT           NOT NULL, DEFAULT 0  -- calculated score
duplicate_count   INT           NOT NULL, DEFAULT 0  -- incremented on duplicates
is_priority_review BOOLEAN      NOT NULL, DEFAULT FALSE  -- flagged for low-credibility users
moderated_by      INT           NULLABLE, FK → users.id  -- Admin
moderated_at      DATETIME      NULLABLE
created_at        DATETIME      NOT NULL, DEFAULT CURRENT_TIMESTAMP
```

---

### Table: `report_votes`

```
id          INT      PK, AUTO_INCREMENT
report_id   INT      NOT NULL, FK → reports.id, CASCADE DELETE
voter_id    INT      NOT NULL, FK → users.id
vote_type   ENUM     'upvote' | 'downvote', NOT NULL
created_at  DATETIME NOT NULL, DEFAULT CURRENT_TIMESTAMP

UNIQUE KEY: (report_id, voter_id)  -- one vote per user per report
```

---

### Table: `alert_subscriptions`

```
id          INT      PK, AUTO_INCREMENT
user_id     INT      NOT NULL, FK → users.id, CASCADE DELETE
category    ENUM     see IncidentCategory, NOT NULL
created_at  DATETIME NOT NULL, DEFAULT CURRENT_TIMESTAMP

UNIQUE KEY: (user_id, category)  -- one subscription per category per user
```

---

### Table: `notifications`

```
id           INT      PK, AUTO_INCREMENT
user_id      INT      NOT NULL, FK → users.id, CASCADE DELETE
incident_id  INT      NOT NULL, FK → incidents.id
message      TEXT     NOT NULL  -- generated message
is_read      BOOLEAN  NOT NULL, DEFAULT FALSE
created_at   DATETIME NOT NULL, DEFAULT CURRENT_TIMESTAMP
```

---

### Table: `audit_logs`

```
id           INT           PK, AUTO_INCREMENT
actor_id     INT           NULLABLE, FK → users.id  -- NULL if system-triggered action
action       VARCHAR(100)  NOT NULL  -- e.g. REPORT_ACCEPTED, INCIDENT_VERIFIED, CHECKPOINT_STATUS_CHANGED
entity_type  VARCHAR(50)   NOT NULL  -- e.g. 'report', 'incident', 'checkpoint'
entity_id    INT           NOT NULL
old_value    JSON          NULLABLE  -- snapshot before change
new_value    JSON          NULLABLE  -- snapshot after change
ip_address   VARCHAR(45)   NULLABLE  -- IPv4 or IPv6
created_at   DATETIME      NOT NULL, DEFAULT CURRENT_TIMESTAMP
```

---

## 12. API Reference

**Base prefix:** `/api/v1`
**Format:** All requests and responses use JSON.
**Auth:** All endpoints require `Authorization: Bearer <token>` unless marked `PUBLIC`.

---

### 12.1 Auth Endpoints

```
POST   /auth/register   [PUBLIC]  Create account (email, password, name)
POST   /auth/login      [PUBLIC]  Login — returns JWT access token
```

---

### 12.2 User Endpoints

```
GET    /users/me        [USER]    Get own profile + credibility score
GET    /users/:id       [ADMIN]   Get any user's profile
GET    /users           [ADMIN]   List all users (paginated)
PATCH  /users/:id/role  [ADMIN]   Change a user's role
```

---

### 12.3 Checkpoint Endpoints

```
GET    /checkpoints               [USER]   List all active checkpoints
GET    /checkpoints/:id           [USER]   Get checkpoint detail
POST   /checkpoints               [ADMIN]  Create a checkpoint
PATCH  /checkpoints/:id           [ADMIN]  Update checkpoint info
PATCH  /checkpoints/:id/status    [ADMIN]  Change status (auto-logs to history)
DELETE /checkpoints/:id           [ADMIN]  Soft-delete checkpoint
GET    /checkpoints/:id/history   [USER]   Get full status history
```

---

### 12.4 Incident Endpoints

```
GET    /incidents              [USER]   List incidents — supports filter/sort/paginate
GET    /incidents/:id          [USER]   Get incident detail
POST   /incidents              [ADMIN]  Create incident
PATCH  /incidents/:id          [ADMIN]  Update incident info
PATCH  /incidents/:id/verify   [ADMIN]  Verify incident — triggers alert notifications
PATCH  /incidents/:id/close    [ADMIN]  Close incident
DELETE /incidents/:id          [ADMIN]  Delete a fake/duplicate incident
```

---

### 12.5 Crowd Report Endpoints

```
POST   /reports              [USER]   Submit a crowd report
GET    /reports              [ADMIN]  List all reports — filter by status/category
GET    /reports/my           [USER]   Get own submitted reports
GET    /reports/:id          [USER]   Get report detail
PATCH  /reports/:id/accept   [ADMIN]  Accept report (optionally creates incident)
PATCH  /reports/:id/reject   [ADMIN]  Reject report with reason
POST   /reports/:id/vote     [USER]   Submit or change vote (upvote/downvote)
DELETE /reports/:id/vote     [USER]   Remove existing vote
```

---

### 12.6 Route Endpoints

```
POST   /routes/estimate   [USER]   Estimate route(s) with optional constraints
```

---

### 12.7 Alert & Notification Endpoints

```
GET    /subscriptions              [USER]  List own category subscriptions
POST   /subscriptions              [USER]  Subscribe to a category
DELETE /subscriptions/:id          [USER]  Unsubscribe from a category

GET    /notifications              [USER]  List all own notifications
GET    /notifications/unread-count [USER]  Get count of unread notifications
PATCH  /notifications/:id/read     [USER]  Mark a notification as read
```

---

### 12.8 Audit Log Endpoints

```
GET    /audit-logs   [ADMIN]  List audit logs — filter by entity_type, actor_id, date range
```

---

### 12.9 Weather Endpoints

```
GET    /weather?lat=&lng=   [USER]  Get current weather at coordinates
```

---

## 13. Frontend–Backend Interaction

> The frontend is already complete. Read existing JS files to understand current `fetch()` calls before modifying anything.

**Required behavior for ALL `fetch()` calls:**
- Include `Authorization: Bearer <token>` header (token stored in localStorage)
- On **401** → clear token, redirect to `/login`
- On **429** → show user-friendly rate limit message
- On **503** → show graceful degraded UI message

**Page-to-endpoint mapping:**

**Map / Dashboard**
- Endpoints: `GET /checkpoints`, `GET /incidents`
- Behavior: Leaflet markers colored by status and severity

**Report Submission**
- Endpoint: `POST /reports`
- Behavior: Form with lat/lng picker on map click

**Incident List**
- Endpoint: `GET /incidents` (with filter params)
- Behavior: Filter panel maps to query parameters

**Route Planner**
- Endpoint: `POST /routes/estimate`
- Behavior: Draw polyline on map, display explanation list

**Notifications**
- Endpoints: `GET /notifications`, `PATCH /notifications/:id/read`
- Behavior: Bell icon with unread badge

**Admin — Reports Queue**
- Endpoints: `GET /reports`, `PATCH /reports/:id/accept`, `PATCH /reports/:id/reject`
- Behavior: Admin-only moderation view

**Admin — Checkpoint Management**
- Endpoints: `POST /checkpoints`, `PATCH /checkpoints/:id`, `DELETE /checkpoints/:id`
- Behavior: Admin-only CRUD view

**Profile**
- Endpoint: `GET /users/me`
- Behavior: Shows credibility score and vote history

---

## 14. External API Integration

### 14.1 Interface Pattern

```typescript
interface IRoutingClient {
  getRoute(origin: Coords, destination: Coords, options: RouteOptions): Promise<RouteResult>
}

interface IWeatherClient {
  getCurrentWeather(lat: number, lng: number): Promise<WeatherResult>
}
```

Using interfaces means providers can be swapped without changing business logic (Open/Closed Principle).

### 14.2 OSRM Integration

- Base URL: `http://router.project-osrm.org` (public) or self-hosted
- Endpoint pattern: `/route/api/v1/driving/{coords}?alternatives=true&geometries=geojson&overview=full`
- Avoid-checkpoint: use `radiuses` parameter to exclude checkpoint coordinates from valid routes
- Timeout: 5 seconds
- On timeout: return cached result, or return error if no cache

**Caching:**
- Cache key: `hash(origin + destination + options)`
- TTL: 15 minutes
- On cache miss + OSRM down: return HTTP 503 with explanation

### 14.3 OpenWeatherMap Integration

- Base URL: `api.openweathermap.org`
- Endpoint: `/data/2.5/weather?lat={lat}&lon={lng}&units=metric&appid={API_KEY}`
- Fields used: `temp`, `wind_speed`, `weather[0].description`, `humidity`

**Caching:**
- Cache key: `round(lat, 2) + ',' + round(lng, 2)`
- TTL: 30 minutes
- On cache miss + API down: return `weather: null, stale: true` in route response — routing still continues

---

## 15. Error Handling

### 15.1 Standard Error Response Format

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Human-readable description of the problem",
  "details": {}
}
```

### 15.2 HTTP Status Codes

- `400` — Validation error: missing fields, invalid types, invalid enum value
- `401` — Missing or invalid JWT
- `403` — Valid JWT but insufficient role (User accessing Admin endpoint)
- `404` — Entity not found
- `409` — Duplicate report detected; vote already exists
- `429` — Rate limit exceeded
- `503` — External API unavailable and no cache available
- `500` — Unhandled server error (logged server-side, never exposed to client)

### 15.3 Global Exception Filter

- Implement `GlobalExceptionFilter` in NestJS to catch all exceptions
- Log all 5xx errors to console (or file logger in production)
- Never expose stack traces or internal messages to the client

---

## 16. Edge Cases

**User votes on own report**
→ HTTP 403: "You cannot vote on your own report"

**Duplicate report submitted**
→ HTTP 409 with original report ID; `duplicate_count` incremented on original

**Admin verifies incident with zero subscribers to that category**
→ No notifications created; no error thrown

**Route estimation when OSRM is down and no cache exists**
→ HTTP 503 with message explaining degraded service

**Weather API is down**
→ Route response includes `weather: null, stale: true`; routing still works normally

**User submits more than 10 reports in 1 hour**
→ HTTP 429 from `@nestjs/throttler`; action logged to audit

**Admin tries to move incident status backwards (e.g., VERIFIED → PENDING)**
→ HTTP 400: "Invalid lifecycle transition"

**Checkpoint is soft-deleted while referenced by an active incident**
→ Soft delete only (`deleted_at` set); incident retains `checkpoint_id`; no FK violation

**User tries to submit a second vote on the same report**
→ `PATCH /reports/:id/vote` replaces the previous vote silently; `POST` returns 409 with instruction to use PATCH

**`avoid_checkpoints=true` but all available routes pass through checkpoints**
→ Return the best available route with a warning added to `explanation[]`

**User with credibility score < 20 submits a report**
→ Report is saved normally but `is_priority_review = true` is set in DB

---

## 17. Validation Rules

### User Registration
- `email`: valid email format, max 255 chars, must be unique
- `password`: min 8 chars, must include at least 1 uppercase letter and 1 digit
- `name`: min 2 chars, max 100 chars, required

### Checkpoints
- `latitude`: float, range −90 to 90, required
- `longitude`: float, range −180 to 180, required
- `name`: min 2 chars, max 200 chars, required
- `type`: must be one of: `military`, `commercial`, `internal`
- `status`: must be one of: `open`, `partial`, `closed`

### Incidents
- `title`: min 5 chars, max 200 chars, required
- `category`: must match `IncidentCategory` enum
- `severity`: must match `SeverityLevel` enum
- `latitude` / `longitude`: valid coordinate ranges
- `estimated_delay_minutes`: integer >= 0, optional

### Reports
- `category`: must match `IncidentCategory` enum
- `description`: min 10 chars, max 1000 chars, required
- `latitude` / `longitude`: valid coordinate ranges, required

### Route Request
- `origin_lat`, `origin_lng`, `dest_lat`, `dest_lng`: all required, valid coordinate ranges
- `alternatives`: integer 1–3, default 2
- `avoid_area`: if provided, must be a valid GeoJSON Polygon

### Voting
- `vote_type`: must be `'upvote'` or `'downvote'`
- Cannot vote on own report — enforced at the service layer

---

## 18. Acceptance Criteria

### Authentication
- ✔ User registers → receives HTTP 201; password is stored hashed (not plaintext)
- ✔ User logs in with correct credentials → receives valid JWT
- ✔ Request without JWT → HTTP 401
- ✔ User accesses Admin-only endpoint → HTTP 403

### Checkpoints
- ✔ Admin creates checkpoint → it appears in `GET /checkpoints`
- ✔ Admin changes status → a new entry is added to `checkpoint_status_history`
- ✔ Soft-deleted checkpoint is excluded from list; its history is preserved

### Incidents
- ✔ New incident starts as PENDING
- ✔ Admin verifies → status becomes VERIFIED; notifications created for all category subscribers
- ✔ Filter by `category=CHECKPOINT_CLOSURE` returns only matching incidents
- ✔ Pagination: `page=2&limit=5` returns the correct slice

### Crowd Reports
- ✔ Duplicate submission (same category, within 100m, within 1hr) → HTTP 409; `duplicate_count` incremented
- ✔ User cannot vote on own report → HTTP 403
- ✔ Vote updates user credibility score immediately
- ✔ Admin accepts report → status = `accepted`; reporter credibility +5
- ✔ 11th report submission in 1 hour → HTTP 429

### Routes
- ✔ `POST /routes/estimate` returns >= 1 route with GeoJSON polyline
- ✔ `avoid_checkpoints=true` → returned route does not pass through closed checkpoints
- ✔ `explanation[]` includes checkpoint and incident warnings when applicable
- ✔ `weather_summary` is present in the response

### Alerts
- ✔ User subscribes to ROAD_CLOSURE → notification record is created when a ROAD_CLOSURE incident is verified
- ✔ `GET /notifications/unread-count` returns the correct integer
- ✔ `PATCH /notifications/:id/read` → `is_read` becomes `true`

### Audit Log
- ✔ Every accept / reject / verify / vote / status-change action produces an `audit_log` entry
- ✔ `GET /audit-logs` (Admin only) returns paginated log with actor and action details

---

## 19. Implementation Guide for AI Assistant

> ⚠️ **READ THIS SECTION FIRST BEFORE WRITING ANY CODE.**

### 19.1 Pre-Implementation Codebase Review Checklist

**`src/auth/`**
→ Check existing JWT strategy, guards, auth.controller, auth.service. Do NOT duplicate.

**`src/users/`**
→ Check user entity fields, role enum, existing endpoints.

**`src/app.module.ts`**
→ Check registered modules, ThrottlerModule config, TypeORM config.

**`src/config/` or `.env`**
→ Check DB credentials, JWT secret name, any existing env variables.

**`migrations/` or TypeORM entities**
→ Determine which tables already exist in the database.

**`public/` or `frontend/`**
→ Check existing HTML pages, current `fetch()` endpoint URLs, Leaflet setup.

**`package.json`**
→ Check installed packages — avoid reinstalling already-installed dependencies.

### 19.2 Already Completed Features

- ✅ Authentication: login, register, JWT issuance
- ✅ Database connection configured (TypeORM + MySQL)
- ✅ Frontend: all pages rendered (may need endpoint URL updates as backend grows)

### 19.3 Recommended Build Order

```
Step 1:   Review codebase per §19.1 checklist above
Step 2:   Run existing project — confirm auth works end-to-end
Step 3:   Add missing DB entities: checkpoints, incidents, reports, votes, subscriptions, notifications, audit_logs
Step 4:   Implement CheckpointsModule  — no external dependencies
Step 5:   Implement IncidentsModule   — depends on Checkpoints
Step 6:   Implement AuditModule       — interceptor pattern, used by all other modules
Step 7:   Implement ReportsModule     — depends on Incidents, Audit, Users
Step 8:   Implement WeatherModule     — external API client + cache
Step 9:   Implement GeoModule         — OSRM client + cache
Step 10:  Implement RoutesModule      — orchestrates Geo + Weather + Checkpoints + Incidents
Step 11:  Implement AlertsModule      — Subscriptions + Notifications, triggered by Incidents
Step 12:  Update frontend fetch() URLs if any endpoints changed
Step 13:  End-to-end test all acceptance criteria in §18
```

### 19.4 Module Pattern (Follow This for Every New Module)

```
entity  →  repository (TypeORM)  →  service  →  controller  →  module registration
```

**Rules:**
- DTOs must use `class-validator` decorators
- All services must be injectable (`@Injectable()`)
- No business logic in controllers — controllers only delegate to services
- No direct DB access in controllers — always go through services