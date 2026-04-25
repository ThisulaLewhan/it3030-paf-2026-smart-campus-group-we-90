# Smart Campus Operations Hub

A full-stack campus management system built with **Spring Boot** (backend) and **React** (frontend), backed by **MongoDB**.

The system covers five modules: Facilities & Resources, Booking Management, Maintenance & Incident Ticketing, Notifications, and Authentication & Authorization.

---

## Prerequisites

Make sure you have these installed before running the project:

| Tool | Version | Download |
|---|---|---|
| Java JDK | 17+ | https://adoptium.net |
| Maven | 3.8+ | https://maven.apache.org (or use the `mvnw` wrapper) |
| Node.js | 18+ | https://nodejs.org |
| MongoDB | 6.0+ | https://www.mongodb.com/try/download/community (or use MongoDB Atlas) |

---

## Environment Setup

### Backend

Create an `application.properties` file (or set these as environment variables):

```properties
# MongoDB connection string — replace with your own Atlas URI or local instance
spring.data.mongodb.uri=mongodb://localhost:27017/smartcampus

# JWT secret — must be at least 32 characters long
app.jwt.secret=your-super-secret-jwt-key-at-least-32-characters

# JWT expiry in milliseconds (default: 24 hours)
app.jwt.expiration=86400000

# Google OAuth2 credentials — from https://console.cloud.google.com
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET

# React frontend URL (for OAuth redirect)
app.frontend.url=http://localhost:3000
```

> **Note:** Copy the above into `backend/src/main/resources/application.properties`.

---

## Running the Project

### 1. Start the Backend

```bash
cd backend

# Using Maven wrapper (no Maven install required)
./mvnw spring-boot:run

# Or with system Maven
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**

### 2. Start the Frontend

```bash
cd frontend
npm install
npm start
```

The frontend starts on **http://localhost:3000**

---

## Project Structure

```
├── backend/                   # Spring Boot application
│   └── src/main/java/com/smartcampus/
│       ├── controller/        # REST API controllers
│       ├── service/           # Business logic
│       ├── repository/        # MongoDB repositories
│       ├── entity/            # Data models
│       ├── dto/               # Request/response DTOs
│       ├── security/          # JWT + OAuth2 handlers
│       └── config/            # Security & CORS configuration
│
└── frontend/                  # React application
    └── src/
        ├── pages/             # Page components (Resources, Bookings, Tickets, etc.)
        ├── components/        # Shared UI components (Sidebar, Navbar, etc.)
        ├── services/          # Axios API service files
        ├── context/           # AuthContext (global user state)
        └── layouts/           # MainLayout, PublicLayout
```

---

## API Overview

All endpoints are prefixed with `/api`.

| Module | Base URL | Auth Required |
|---|---|---|
| Auth | `/api/auth` | Public (register/login) |
| Resources | `/api/resources` | Authenticated; CRUD = Admin only |
| Bookings | `/api/bookings` | Authenticated; approve/reject = Admin only |
| Incident Tickets | `/api/incident-tickets` | Authenticated; assign/reject = Admin only |
| Notifications | `/api/notifications` | Authenticated (own notifications only) |
| Users | `/api/users` | Authenticated; role management = Admin only |

---

## Default User Roles

| Role | Permissions |
|---|---|
| `USER` | Create bookings, create tickets, view own notifications |
| `TECHNICIAN` | Update ticket status, add comments and resolution notes |
| `ADMIN` | Full access — manage resources, users, approve/reject bookings and tickets |

---

## Google OAuth2 Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → Enable the **Google+ API**
3. Create OAuth 2.0 credentials (Web Application type)
4. Add `http://localhost:8080/login/oauth2/code/google` as an authorized redirect URI
5. Copy the **Client ID** and **Client Secret** into `application.properties`

---

## CI/CD

GitHub Actions workflows are configured in `.github/workflows/ci.yml`.

The pipeline runs on every push/PR to `main` or `develop` and:
- Builds and tests the Spring Boot backend with Maven
- Builds the React frontend with `npm run build`

Set these **Repository Secrets** in GitHub Settings:
- `MONGODB_URI` — your test/CI MongoDB connection string
- `JWT_SECRET` — a 32+ character secret key
