# Workly

Workly is a Spring Boot platform for finding local professionals and managing professional profiles, approvals and platform news.

This package contains a complete frontend redesign inspired by a clean, dark 3D interface: graphite surfaces, mint accents, restrained coral highlights, glass-like depth and subtle Three.js motion. The backend/API structure from the `ZoniD/Workly` repository is preserved.

## What is included

- Public Workly landing/browse experience
- Dynamic category filters from `GET /api/categories`
- Dynamic approved professional cards from `GET /api/entrepreneurs`
- Search by company, category, location and description
- Dynamic Workly news from `GET /api/news`
- Login and registration connected to the existing JWT API
- Professional application flow connected to `POST /api/entrepreneurs`
- Full entrepreneur portal redesign
  - own profile
  - profile editing
  - availability toggle
- Full admin interface redesign
  - dashboard metrics
  - professional status management
  - create/deactivate/restore professionals
  - news creation/editing/status/archive
- Responsive layouts
- Reduced-motion support
- Three.js visual layer with a graceful non-3D fallback

## Stack

- Java 21
- Spring Boot 4.0.6
- Spring MVC
- Spring Data JPA / Hibernate
- Spring Security
- JWT (JJWT 0.12.3)
- BCrypt
- Flyway
- H2 in MySQL compatibility mode
- HTML / CSS / vanilla JavaScript
- Three.js (loaded from CDN for the decorative 3D scene)

## Run locally

### 1. Requirements

Install Java 21. Maven does not have to be installed globally; `mvnw` / `mvnw.cmd` can download Maven when needed.

### 2. Set JWT environment variables

The app reads:

```text
JWT_SECRET
JWT_EXPIRATION
```

The JWT secret should be at least 32 bytes for the configured HMAC key.

PowerShell example:

```powershell
$env:JWT_SECRET="workly-development-secret-key-change-this-123456"
$env:JWT_EXPIRATION="86400000"
.\mvnw.cmd spring-boot:run
```

Git Bash / macOS / Linux:

```bash
export JWT_SECRET="workly-development-secret-key-change-this-123456"
export JWT_EXPIRATION="86400000"
./mvnw spring-boot:run
```

Then open:

```text
http://localhost:8080
```

## Demo accounts

With `workly.demo-users.enabled=true` the current backend initializer creates:

### Admin

```text
Email: admin@gmail.com
Password: 12345678
```

### Professional

```text
Email: bruger@gmail.com
Password: 12345678
```

These are development credentials only.

## Main frontend files

```text
src/main/resources/static/
├── index.html
├── admin.html
├── entrepreneur.html
├── css/
│   ├── style.css
│   ├── admin.css
│   └── entrepreneur.css
└── js/
    ├── app.js
    ├── admin.js
    └── entrepreneur.js
```

## API routes used by the frontend

Public/auth:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/categories
GET  /api/entrepreneurs
GET  /api/news
POST /api/entrepreneurs                 authenticated
```

Professional portal:

```text
GET   /api/entrepreneur/profile
PUT   /api/entrepreneur/profile
PATCH /api/entrepreneur/availability
```

Admin:

```text
GET    /api/admin/dashboard
GET    /api/admin/entrepreneurs
POST   /api/admin/entrepreneurs
PATCH  /api/admin/entrepreneurs/{id}/status
DELETE /api/admin/entrepreneurs/{id}
PATCH  /api/admin/entrepreneurs/{id}/restore

GET    /api/admin/news
POST   /api/admin/news
PUT    /api/admin/news/{id}
PATCH  /api/admin/news/{id}/status
DELETE /api/admin/news/{id}
```

## Authentication

The frontend stores the login response in browser `localStorage` and sends protected requests as:

```http
Authorization: Bearer <JWT>
```

Role-based routing sends `ADMIN` users to the admin interface and `ENTREPRENEUR` users to the professional portal.

## Database

Local development uses:

```text
jdbc:h2:mem:workly;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE
```

The H2 console is available at:

```text
http://localhost:8080/h2-console
```

Flyway migrations live in:

```text
src/main/resources/db/migration/
```

## Frontend design notes

The new interface uses a single visual system across all three surfaces:

- near-black graphite background
- layered semi-transparent surfaces
- mint as the main action/status accent
- coral only as a secondary accent
- large Space Grotesk display typography
- Inter for interface/body text
- JetBrains Mono for technical/status labels
- geometric depth rather than heavy gradients
- 3D motion used as atmosphere, not as the UI itself

The public page loads Three.js from a CDN. If the library is unavailable, the application content and API functionality still work; only the decorative 3D scene is absent.

## Before production

- Set `workly.demo-users.enabled=false`
- Remove demo credentials
- Store the JWT secret securely
- Configure production CORS origins
- Disable or secure the H2 console
- Move to a persistent production database
- Review localStorage/token handling for the intended deployment threat model
- Add integration/security tests
- Serve the site over HTTPS

## Source

Original repository used as the backend/source basis:

`https://github.com/ZoniD/Workly`
