# Sri Lanka Institute of Information Technology
## Programming Applications and Frameworks (IT3030)
### Final Assignment Report

**GROUP ID:** XXXX

**Topic:** Smart Campus Operations Hub

| Student ID | Student Name |
|---|---|
| XXXXXXX | XXXXXXXXXX |
| XXXXXXX | XXXXXXXXXX |
| XXXXXXX | XXXXXXXXXX |
| XXXXXXX | XXXXXXXXXX |

**Date:** XX.XX.XXXX

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Functional Requirements & Non-Functional Requirements](#2-functional-requirements--non-functional-requirements)
3. [Overall Architecture Diagram](#3-overall-architecture-diagram)
4. [REST API Architecture Diagram](#4-rest-api-architecture-diagram)
5. [Frontend Architecture Diagram](#5-frontend-architecture-diagram)
6. [System Functions](#6-system-functions)
7. [GitHub](#7-github)
8. [References](#8-references)

---

## 1. Introduction

The **Smart Campus Operations Hub** is a full-stack web application developed to digitise and centralise campus facility management at SLIIT. The system replaces manual paper-based processes with an integrated platform that allows students and staff to book campus resources, submit and track maintenance/incident tickets, receive real-time notifications, and manage campus assets.

The application is built using:

- **Backend:** Spring Boot 3.2.5 (Java), Spring Security with JWT authentication, Spring Data MongoDB
- **Frontend:** React 19, React Router v7, Axios
- **Database:** MongoDB Atlas (cloud-hosted NoSQL)
- **Authentication:** JWT (JSON Web Token) with role-based access control (RBAC)

The system is divided into five functional modules, each developed by a different team member:

| Module | Description |
|---|---|
| Authentication & Authorization | User registration, login, JWT, role management |
| Facilities & Resource Management | Campus resource listing and administration |
| Booking Management | Resource booking with admin approval workflow |
| Maintenance & Incident Ticketing | Ticket submission, assignment, and lifecycle management |
| Notifications | In-app notification delivery and user preferences |

---

## 2. Functional Requirements & Non-Functional Requirements

### Functional Requirements

#### Module A — Authentication & Authorization
- FR-A1: Users can register with name, email, and password
- FR-A2: Users can log in and receive a JWT token
- FR-A3: System supports three roles: `USER`, `ADMIN`, `TECHNICIAN`
- FR-A4: Admins can update any user's role via the Admin panel
- FR-A5: Passwords are stored as bcrypt hashes

#### Module B — Facilities & Resource Management
- FR-B1: Admins can create, update, and delete campus resources
- FR-B2: All authenticated users can view available resources
- FR-B3: Resources have attributes: name, type, location, capacity, availability status

#### Module C — Booking Management
- FR-C1: Authenticated users can create bookings for available resources
- FR-C2: Users can view their own bookings
- FR-C3: Admins can approve or reject bookings
- FR-C4: Technicians cannot access the Bookings module

#### Module D — Maintenance & Incident Ticketing
- FR-D1: Any authenticated user can submit a support ticket with title, category, description, priority, and location/resource
- FR-D2: Users can attach up to 3 image files (jpg/jpeg/png, max 5 MB each) per ticket
- FR-D3: Admins can view all tickets; Technicians see only tickets assigned to them; Users see only their own
- FR-D4: Admins can assign a technician to a ticket (OPEN status only)
- FR-D5: Ticket status follows a defined state machine: `OPEN → IN_PROGRESS → RESOLVED → CLOSED`, with `OPEN → REJECTED` (Admin only)
- FR-D6: Users can edit or delete their own tickets while status is `OPEN`
- FR-D7: Any authenticated user can post, edit, or delete comments on a ticket

#### Module E — Notifications
- FR-E1: Admins are notified when a new ticket is created
- FR-E2: Technicians are notified when assigned to a ticket
- FR-E3: Ticket creators are notified when someone comments on their ticket
- FR-E4: Users can configure notification preferences

### Non-Functional Requirements

| ID | Requirement | Category |
|---|---|---|
| NFR-1 | All API endpoints require JWT authentication (except `/api/auth/**`) | Security |
| NFR-2 | Passwords stored as bcrypt hashes; no plaintext storage | Security |
| NFR-3 | Role-based access control enforced at both API and frontend routing layers | Security |
| NFR-4 | File uploads validated for type and size before writing to disk | Security |
| NFR-5 | UUID-based filenames prevent path traversal attacks on uploads | Security |
| NFR-6 | Backend must respond within 2 seconds for standard CRUD operations | Performance |
| NFR-7 | Frontend must render pages within 3 seconds on a standard connection | Performance |
| NFR-8 | System must support at least 50 concurrent users | Scalability |
| NFR-9 | All REST API responses use standard HTTP status codes | Maintainability |
| NFR-10 | Codebase is version-controlled with Git; feature branches merged via pull requests | Maintainability |

---

## 3. Overall Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                            │
│              React 19  (localhost:3000)                  │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Auth    │  │Bookings  │  │ Tickets  │  │Notific. │ │
│  │  Pages   │  │  Pages   │  │  Pages   │  │  Pages  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │              │              │              │      │
│       └──────────────┴──────────────┴──────────────┘     │
│                          Axios (HTTP + JWT header)        │
└───────────────────────────┬─────────────────────────────┘
                            │  HTTPS / REST
┌───────────────────────────▼─────────────────────────────┐
│                       BACKEND                            │
│           Spring Boot 3.2.5  (localhost:8080)            │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Spring Security (JWT Filter)         │   │
│  └──────────────────────┬───────────────────────────┘   │
│                          │                               │
│  ┌──────────┐  ┌─────────▼──────┐  ┌──────────────────┐ │
│  │ Auth     │  │  Controllers   │  │  Global Exception │ │
│  │ Controller│ │  (Ticket,      │  │  Handler          │ │
│  └──────────┘  │  Booking,      │  └──────────────────┘ │
│                │  Resource,     │                        │
│                │  Notification, │                        │
│                │  User)         │                        │
│                └───────┬────────┘                        │
│                        │                                 │
│  ┌─────────────────────▼──────────────────────────────┐ │
│  │                  Service Layer                      │ │
│  │  TicketService │ AttachmentService │ CommentService │ │
│  │  BookingService │ NotificationService │ UserService  │ │
│  └─────────────────────┬──────────────────────────────┘ │
│                        │                                 │
│  ┌─────────────────────▼──────────────────────────────┐ │
│  │               Repository Layer                     │ │
│  │  (Spring Data MongoDB — MongoRepository interfaces) │ │
│  └─────────────────────┬──────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │  MongoDB Driver
┌───────────────────────▼─────────────────────────────────┐
│                   MongoDB Atlas                          │
│   Collections: users, tickets, bookings, resources,     │
│                notifications, attachments, comments      │
└─────────────────────────────────────────────────────────┘
```

---

## 4. REST API Architecture Diagram

All endpoints are prefixed with `/api`. All protected routes require `Authorization: Bearer <JWT>` header.

```
/api
 ├── /auth
 │    ├── POST /register         → Register new user
 │    ├── POST /login            → Login, returns JWT
 │    └── GET  /me               → Get current user profile
 │
 ├── /users
 │    ├── GET  /                 → List all users (ADMIN)
 │    ├── GET  /technicians      → List technicians (any auth)
 │    ├── PUT  /{id}/role        → Update user role (ADMIN)
 │    └── PUT  /me               → Update own profile
 │
 ├── /resources
 │    ├── GET  /                 → List resources (any auth)
 │    ├── POST /                 → Create resource (ADMIN)
 │    ├── PUT  /{id}             → Update resource (ADMIN)
 │    └── DELETE /{id}           → Delete resource (ADMIN)
 │
 ├── /bookings
 │    ├── GET  /                 → List bookings (role-filtered)
 │    ├── POST /                 → Create booking
 │    ├── PATCH /{id}/approve    → Approve booking (ADMIN)
 │    └── PATCH /{id}/reject     → Reject booking (ADMIN)
 │
 ├── /tickets
 │    ├── GET  /                 → List tickets (role-filtered)
 │    ├── POST /                 → Create ticket (multipart)
 │    ├── GET  /{id}             → Get ticket (role-guarded)
 │    ├── PUT  /{id}             → Edit ticket (owner/ADMIN, OPEN only)
 │    ├── DELETE /{id}           → Delete ticket (owner/ADMIN, OPEN only)
 │    ├── PATCH /{id}/assign     → Assign technician (ADMIN, OPEN only)
 │    ├── PATCH /{id}/status     → Update status (ADMIN/TECHNICIAN)
 │    ├── GET  /{id}/attachments → List attachments
 │    ├── POST /{id}/attachments → Upload attachments
 │    ├── GET  /{id}/attachments/{aid} → Stream file
 │    ├── GET  /{id}/comments    → List comments
 │    ├── POST /{id}/comments    → Add comment
 │    ├── PUT  /{id}/comments/{cid}    → Edit comment (author)
 │    └── DELETE /{id}/comments/{cid} → Delete comment (author/ADMIN)
 │
 └── /notifications
      ├── GET  /                 → List own notifications
      ├── PATCH /{id}/read       → Mark as read
      └── GET/PUT /preferences   → Get/update notification preferences
```

---

## 5. Frontend Architecture Diagram

```
frontend/src/
│
├── index.js                    ← React entry point
├── App.js                      ← Root router (React Router v7)
│
├── context/
│   └── AuthContext.js          ← Global auth state (user, role, JWT)
│
├── components/
│   ├── ProtectedRoute.jsx      ← Route guard (auth + role check)
│   ├── Navbar.js               ← Top navigation bar
│   └── Sidebar.js              ← Role-aware sidebar links
│
├── layouts/
│   └── MainLayout.js           ← Authenticated page shell
│
├── pages/
│   ├── Auth/
│   │   └── LoginPage.js        ← Login form
│   ├── Tickets/
│   │   ├── TicketListPage.js   ← View + filter tickets
│   │   ├── CreateTicketPage.js ← Submit new ticket (with file upload)
│   │   └── TicketDetailPage.js ← View detail, update status, comments, attachments
│   ├── Bookings/
│   │   └── BookingsPage.js     ← Book resources (USER/ADMIN only)
│   ├── Resources/
│   │   └── ResourcesPage.js    ← Browse campus resources
│   ├── Notifications/
│   │   └── NotificationsPage.js
│   ├── Admin/
│   │   └── AdminUsersPage.js   ← Manage user roles (ADMIN only)
│   └── Profile/
│       └── ProfilePage.jsx     ← Edit own profile
│
└── services/
    ├── api.js                  ← Axios instance with JWT interceptor
    ├── ticketService.js        ← Ticket API calls
    ├── bookingService.js       ← Booking API calls
    ├── resourceService.js      ← Resource API calls
    └── notificationService.js  ← Notification API calls
```

### Routing & Role Protection

```
App.js
 └── <ProtectedRoute>               ← redirects to /login if not authenticated
      └── <MainLayout>
           ├── /dashboard           → Home (all roles)
           ├── /profile             → ProfilePage (all roles)
           ├── /resources           → ResourcesPage (all roles)
           ├── /bookings            → BookingsPage (USER, ADMIN only)
           ├── /tickets             → TicketListPage (all roles, filtered)
           ├── /tickets/new         → CreateTicketPage (all roles)
           ├── /tickets/:id         → TicketDetailPage (all roles, guarded)
           ├── /notifications       → NotificationsPage (all roles)
           └── /admin/users         → AdminUsersPage (ADMIN only)
```

---

## 6. System Functions

### Module A — Authentication & Authorization
*(Student ID: XXXXXXX — Student Name)*

Handles user registration, login, JWT issuance, and role management. Users register with name, email, and password. On login, the backend validates credentials and returns a signed JWT. All subsequent requests carry this token. The Admin panel allows role promotion/demotion between `USER`, `ADMIN`, and `TECHNICIAN`.

> **Screenshots:** *(Insert screenshots of Login page, Register page, Admin Users page)*

---

### Module B — Facilities & Resource Management
*(Student ID: XXXXXXX — Student Name)*

Manages campus resources (rooms, labs, equipment). Admins can add, edit, and delete resources. All authenticated users can browse available resources. Each resource has a name, type, location, capacity, and availability status.

> **Screenshots:** *(Insert screenshots of Resources page and Admin resource management)*

---

### Module C — Booking Management
*(Student ID: XXXXXXX — Student Name)*

Allows `USER` and `ADMIN` role users to book campus resources. Bookings are submitted with a time range and resource selection. Admins can approve or reject pending bookings. Technicians are blocked from this module at both the route and sidebar level.

> **Screenshots:** *(Insert screenshots of Bookings page, booking form, approval workflow)*

---

### Module D — Maintenance & Incident Ticketing
*(Student ID: XXXXXXX — Student Name)*

Users submit support tickets for campus issues. Each ticket has a title, category, description, priority, and a location or linked resource. Up to 3 image attachments (jpg/png, max 5 MB each) can be uploaded.

**Ticket Lifecycle:**

```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
OPEN → REJECTED  (Admin only)
```

Role-based visibility ensures Users see only their own tickets, Technicians see only tickets assigned to them, and Admins see all. Users can edit or delete their own tickets while status is `OPEN`. Comments can be added by any role and edited or deleted by their author.

> **Screenshots:** *(Insert screenshots of Ticket List, Create Ticket form, Ticket Detail with status update, comment section, and attachment view)*

---

### Module E — Notifications
*(Student ID: XXXXXXX — Student Name)*

Delivers in-app notifications triggered by system events: new ticket creation (notifies admins), technician assignment (notifies technician), and new comments (notifies ticket owner). Users can view their notification history and configure delivery preferences.

> **Screenshots:** *(Insert screenshots of Notifications page and Preferences page)*

---

## 7. GitHub

- **GitHub Repository:** `https://github.com/SLIIT-Y4S2/it3030-paf-2026-smart-campus-group-we-90`
- **OneDrive Link:** *(Insert OneDrive link here)*

### GitHub Commit Tree

> *(Insert screenshot of GitHub commit graph / network graph here)*

---

## 8. References

1. Spring Boot Documentation — https://docs.spring.io/spring-boot/docs/current/reference/html/
2. Spring Security Reference — https://docs.spring.io/spring-security/reference/
3. Spring Data MongoDB — https://docs.spring.io/spring-data/mongodb/docs/current/reference/html/
4. React Documentation — https://react.dev/
5. React Router v7 — https://reactrouter.com/
6. Axios HTTP Client — https://axios-http.com/docs/intro
7. MongoDB Atlas — https://www.mongodb.com/docs/atlas/
8. JJWT (JSON Web Token for Java) — https://github.com/jwtk/jjwt
9. OWASP Top 10 Security Risks — https://owasp.org/www-project-top-ten/
10. Bcrypt Password Hashing — https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html
