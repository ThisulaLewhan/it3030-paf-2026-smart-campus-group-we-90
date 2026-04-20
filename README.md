# Smart Campus Management System

This repository is organized as a simple full-stack workspace so frontend and backend work can grow independently without becoming tangled.

## Root structure

- `frontend/` - React application for the Smart Campus user interface
- `backend/` - Spring Boot + MongoDB starter structure for REST APIs
- `README.md` - project overview and onboarding notes

## Frontend structure

The React app is feature-oriented inside `frontend/src`:

- `pages/Resources`, `pages/Bookings`, `pages/Tickets`, `pages/Notifications`, `pages/Auth`
- `components/Navbar.js`, `components/Sidebar.js`
- `services/api.js` plus one service file per module
- `context/AuthContext.js`

Routing is ready in `frontend/src/App.js`, and all API services share the same Axios base configuration:

- `http://localhost:8080/api`

## Backend structure

The backend package root is `com.smartcampus`, with a clean layered structure for each module:

- `controller/`
- `service/`
- `repository/`
- `entity/`
- `security/`

Each business area has its own entity, repository, service, controller, and matching frontend page/service so team members can work on:

- Resources
- Bookings
- Tickets
- Notifications

## Notes

- The backend package structure is prepared for a Spring Boot project with MongoDB repositories.
- REST endpoints follow plural resource naming such as `/api/resources` and `/api/bookings`.
- The current code is intentionally lightweight so new team members can extend it without fighting framework complexity.
