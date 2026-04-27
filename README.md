# Smart Campus Operations Hub
**IT3030 PAF Assignment**

## Description
A comprehensive campus management system designed to handle resources, room bookings, incident tickets, real-time notifications, and secure user authentication.

## Tech Stack
- **Frontend:** React.js
- **Backend:** Spring Boot
- **Database:** MongoDB

## Setup Instructions

**Step 1: Clone repository**
```bash
git clone https://github.com/ThisulaLewhan/it3030-paf-2026-smart-campus-group-we-90.git
```

**Step 2: Run backend**
```bash
cd backend
.\mvnw clean install
.\mvnw spring-boot:run
```
*The backend runs on: http://localhost:8080*

**Step 3: Run frontend**
```bash
cd frontend
npm install
npm start
```
*The frontend runs on: http://localhost:3000*

## Roles
- USER
- ADMIN
- TECHNICIAN

## Project Structure
```text
backend/
frontend/
.github/workflows/
README.md
```

## Notes
- The backend must run before the frontend.
- Update database config if needed.
