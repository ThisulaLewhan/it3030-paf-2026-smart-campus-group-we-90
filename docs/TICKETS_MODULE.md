# Tickets Module — API Reference & Testing Guide

**Base URL:** `http://localhost:8080/api/tickets`  
**Auth:** Every request requires a JWT Bearer token in the `Authorization` header.

---

## Authentication

All endpoints require a valid JWT. Obtain one first:

```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

Copy the token from the response and add to every request:
```
Authorization: Bearer <token>
```

---

## Roles

| Role | Description |
|---|---|
| `ROLE_USER` | Standard user — sees only their own tickets |
| `ROLE_TECHNICIAN` | Sees only tickets assigned to them |
| `ROLE_ADMIN` | Sees all tickets; can assign, reject, close |

---

## Endpoints

### 1. List Tickets

```
GET /api/tickets
```

**Access:** All authenticated roles  
**Role behaviour:**
- `ROLE_ADMIN` → returns all tickets
- `ROLE_TECHNICIAN` → returns tickets where `assignedTechnician` equals their email
- `ROLE_USER` → returns tickets where `createdBy` equals their email

**Validation (in code):** `TicketService.getAllTickets(callerEmail, callerRole)` — [TicketService.java, line ~58]

**Postman:**
- Method: `GET`
- URL: `{{base_url}}/api/tickets`
- Headers: `Authorization: Bearer <token>`

**Response 200:**
```json
[
  {
    "id": "69ecade60f0b2a436fe740f6",
    "title": "Broken AC",
    "category": "HVAC",
    "priority": "HIGH",
    "status": "OPEN",
    "createdBy": "user@example.com",
    "createdAt": "2026-04-25T10:00:00",
    "updatedAt": "2026-04-25T10:00:00"
  }
]
```

---

### 2. Get Single Ticket

```
GET /api/tickets/{id}
```

**Access:** All authenticated roles (role-filtered)  
**Role behaviour:**
- `ROLE_ADMIN` → any ticket
- `ROLE_TECHNICIAN` → only if they are `assignedTechnician`
- `ROLE_USER` → only if they are `createdBy`

**Validation (in code):** `TicketService.getTicketById(id, callerEmail, callerRole)` — [TicketService.java, line ~78]

**Postman:**
- Method: `GET`
- URL: `{{base_url}}/api/tickets/69ecade60f0b2a436fe740f6`

**Responses:**
- `200 OK` — ticket object
- `403 Forbidden` — not your ticket / not assigned to you
- `404 Not Found` — ticket ID does not exist

---

### 3. Create Ticket (multipart)

```
POST /api/tickets
Content-Type: multipart/form-data
```

**Access:** All authenticated roles  
**Required fields (in ticket part):** `title`, `description`, `category`, `priority`, and at least one of `location` or `resourceId`

**Validation (in code):** `TicketService.createTicket(dto, creatorEmail)` — [TicketService.java, line ~105]

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | Cannot be blank |
| `description` | Yes | Cannot be blank |
| `category` | Yes | e.g. `ELECTRICAL`, `PLUMBING`, `HVAC`, `IT_SUPPORT`, `STRUCTURAL`, `CLEANING`, `OTHER` |
| `priority` | Yes | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` (or `URGENT`) |
| `location` | One of | Either `location` or `resourceId` must be provided |
| `resourceId` | One of | Either `location` or `resourceId` must be provided |
| `preferredContact` | No | Optional |

**Attachment rules (in code):** `AttachmentService.uploadAttachmentsForTicket` — [AttachmentService.java, line ~113]
- Max 3 files per ticket
- Allowed types: `jpg`, `jpeg`, `png` only
- Max 5 MB per file

**Postman setup:**
- Method: `POST`
- URL: `{{base_url}}/api/tickets`
- Body → `form-data`:

| Key | Type | Value |
|---|---|---|
| `ticket` | File | A `.json` file (or Blob) containing the ticket JSON |
| `files` | File | (Optional) Image file(s) — up to 3 |

> **Tip — setting the ticket JSON blob in Postman:**  
> In the form-data row, set key to `ticket`, change type dropdown to **File**, then upload a `.json` file such as:
> ```json
> {
>   "title": "Broken AC",
>   "description": "The AC unit in room 301 is not cooling.",
>   "category": "HVAC",
>   "priority": "HIGH",
>   "location": "Building A, Room 301"
> }
> ```
> Alternatively use Pre-request Script to set `Content-Type` of the part to `application/json`.

**Responses:**
- `201 Created` — ticket object (with `status: "OPEN"`)
- `400 Bad Request` — missing required field, or file validation failure
- `500 Internal Server Error` — file storage error

---

### 4. Update Ticket

```
PUT /api/tickets/{id}
Content-Type: application/json
```

**Access:** Ticket creator (`ROLE_USER`) while status is `OPEN`; `ROLE_ADMIN` at any time  
**Editable fields:** `title`, `category`, `description`, `priority`, `location`, `resourceId`, `preferredContact`

**Validation (in code):** `TicketService.updateTicket(id, dto, callerEmail, callerRole)` — [TicketService.java, line ~188]
- Non-admin users can only edit their own tickets
- Non-admin users can only edit `OPEN` tickets (locked once IN_PROGRESS)
- `title` and `description` cannot be blank

**Postman:**
- Method: `PUT`
- URL: `{{base_url}}/api/tickets/69ecade60f0b2a436fe740f6`
- Body → `raw` → `JSON`:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "IT_SUPPORT",
  "priority": "MEDIUM",
  "location": "Building B, Room 12"
}
```

**Responses:**
- `200 OK` — updated ticket object
- `400 Bad Request` — blank title or description
- `403 Forbidden` — not your ticket, or ticket is no longer OPEN
- `404 Not Found` — ticket ID does not exist

---

### 5. Delete Ticket

```
DELETE /api/tickets/{id}
```

**Access:** Ticket creator (`ROLE_USER`) while status is `OPEN`; `ROLE_ADMIN` can delete any ticket  
**Validation (in code):** `TicketService.deleteTicket(id, callerEmail, callerRole)` — [TicketService.java, line ~220]

**Postman:**
- Method: `DELETE`
- URL: `{{base_url}}/api/tickets/69ecade60f0b2a436fe740f6`

**Responses:**
- `204 No Content` — deleted successfully
- `403 Forbidden` — not your ticket, or ticket is not OPEN
- `404 Not Found` — ticket ID does not exist

---

### 6. Update Ticket Status

```
PATCH /api/tickets/{id}/status
Content-Type: application/json
```

**Access:** `ROLE_ADMIN` and `ROLE_TECHNICIAN` only (role-dependent per transition)

**Allowed status transitions:**

| From | To (allowed) | Who |
|---|---|---|
| `OPEN` | `IN_PROGRESS` | ADMIN, TECHNICIAN |
| `OPEN` | `REJECTED` | ADMIN only |
| `IN_PROGRESS` | `RESOLVED` | Assigned TECHNICIAN or ADMIN |
| `IN_PROGRESS` | `OPEN` | ADMIN, TECHNICIAN |
| `RESOLVED` | `CLOSED` | ADMIN only |
| `RESOLVED` | `IN_PROGRESS` | ADMIN, TECHNICIAN |
| `CLOSED` | — | No transitions |
| `REJECTED` | — | No transitions |

**Validation (in code):** `TicketService.transitionStatus(...)` — [TicketService.java, line ~245]
- Invalid transitions → 400
- Wrong role for transition → 403
- `RESOLVED` requires `resolutionNotes` (cannot be blank) — [TicketService.java, line ~292]
- `REJECTED` requires `rejectionReason` (cannot be blank) — [TicketService.java, line ~274]

**Postman:**
- Method: `PATCH`
- URL: `{{base_url}}/api/tickets/69ecade60f0b2a436fe740f6/status`
- Body → `raw` → `JSON`:

Moving to IN_PROGRESS:
```json
{
  "newStatus": "IN_PROGRESS"
}
```

Resolving:
```json
{
  "newStatus": "RESOLVED",
  "resolutionNotes": "Replaced the faulty capacitor in the AC unit."
}
```

Rejecting (ADMIN only):
```json
{
  "newStatus": "REJECTED",
  "rejectionReason": "Duplicate of ticket #123."
}
```

**Responses:**
- `200 OK` — updated ticket object
- `400 Bad Request` — invalid transition, or missing `resolutionNotes`/`rejectionReason`
- `403 Forbidden` — role not allowed for this transition
- `404 Not Found` — ticket not found

---

### 7. Assign Technician

```
PATCH /api/tickets/{id}/assign
Content-Type: application/json
```

**Access:** `ROLE_ADMIN` only  
**Constraint:** Can only assign while ticket status is `OPEN`. Locked once ticket moves to `IN_PROGRESS`.

**Validation (in code):**
- Controller: role check — [TicketController.java, line ~120]
- Service: status lock — [TicketService.java, line ~161] — throws 403 if status ≠ `OPEN`
- Service: technician existence — [TicketService.java, line ~166]
- Service: assigned user must not be `ROLE_USER` — [TicketService.java, line ~172]

**Postman:**
- Method: `PATCH`
- URL: `{{base_url}}/api/tickets/69ecade60f0b2a436fe740f6/assign`
- Body → `raw` → `JSON`:
```json
{
  "technicianId": "664abc123def456789000001"
}
```

**Responses:**
- `200 OK` — updated ticket with `assignedTechnician` and `assignedTo` set
- `400 Bad Request` — `technicianId` blank, or user has `ROLE_USER`
- `403 Forbidden` — caller is not ADMIN, or ticket is not OPEN
- `404 Not Found` — ticket or user not found

---

### 8. List Attachments

```
GET /api/tickets/{id}/attachments
```

**Access:** `ROLE_ADMIN` (any ticket); `ROLE_TECHNICIAN` (assigned only); `ROLE_USER` (own tickets)  
**Note:** Returns only attachments whose files still exist on disk (stale DB records are silently filtered out).

**Validation (in code):** `AttachmentService.checkTicketAccess(...)` — [AttachmentService.java, line ~210]

**Postman:**
- Method: `GET`
- URL: `{{base_url}}/api/tickets/69ecade60f0b2a436fe740f6/attachments`

**Response 200:**
```json
[
  {
    "id": "69ecade60f0b2a436fe740f7",
    "ticketId": "69ecade60f0b2a436fe740f6",
    "filename": "photo.jpg",
    "contentType": "image/jpeg",
    "sizeBytes": 204800,
    "uploadedAt": "2026-04-25T10:05:00",
    "uploadedBy": "user@example.com"
  }
]
```

---

### 9. Download Attachment

```
GET /api/tickets/{id}/attachments/{attachmentId}
```

**Access:** Same role rules as List Attachments  
**Returns:** Raw image bytes with correct `Content-Type` header.

**Validation (in code):** `AttachmentService.getAttachmentBytes(...)` — [AttachmentService.java, line ~162]
- Returns 404 if attachment record not found, belongs to a different ticket, or file missing from disk

**Postman:**
- Method: `GET`
- URL: `{{base_url}}/api/tickets/69ecade60f0b2a436fe740f6/attachments/69ecade60f0b2a436fe740f7`
- In Postman click **Send and Download** to save the image file

---

### 10. Upload Attachments to Existing Ticket

```
POST /api/tickets/{id}/attachments
Content-Type: multipart/form-data
```

**Access:** All authenticated roles  
**Validation (in code):** `AttachmentService.uploadAttachmentsForTicket(...)` — [AttachmentService.java, line ~113]
- Max 3 total attachments per ticket (existing + new combined)
- Allowed types: `jpg`, `jpeg`, `png`
- Max 5 MB per file
- No path traversal characters in filenames (`..`, `/`, `\`)

**Postman:**
- Method: `POST`
- URL: `{{base_url}}/api/tickets/69ecade60f0b2a436fe740f6/attachments`
- Body → `form-data`:

| Key | Type | Value |
|---|---|---|
| `files` | File | Image file(s) to upload |

**Responses:**
- `201 Created` — array of created attachment objects
- `400 Bad Request` — file type/size violation, or exceeds max 3
- `404 Not Found` — ticket not found

---

### 11. Add Comment

```
POST /api/tickets/{id}/comments
Content-Type: application/json
```

**Access:** All authenticated roles

**Postman:**
- Method: `POST`
- URL: `{{base_url}}/api/tickets/69ecade60f0b2a436fe740f6/comments`
- Body → `raw` → `JSON`:
```json
{
  "content": "We are looking into this issue."
}
```

**Responses:**
- `201 Created` — comment object
- `404 Not Found` — ticket not found

---

### 12. List Comments

```
GET /api/tickets/{id}/comments
```

**Access:** All authenticated roles

**Postman:**
- Method: `GET`
- URL: `{{base_url}}/api/tickets/69ecade60f0b2a436fe740f6/comments`

**Response 200:**
```json
[
  {
    "id": "...",
    "ticketId": "69ecade60f0b2a436fe740f6",
    "content": "We are looking into this issue.",
    "authorId": "tech@example.com",
    "createdAt": "2026-04-25T11:00:00",
    "updatedAt": "2026-04-25T11:00:00"
  }
]
```

---

### 13. Edit Comment

```
PUT /api/tickets/{id}/comments/{commentId}
Content-Type: application/json
```

**Access:** Comment author only

**Postman:**
- Method: `PUT`
- URL: `{{base_url}}/api/tickets/69ecade60f0b2a436fe740f6/comments/664abc000001`
- Body → `raw` → `JSON`:
```json
{
  "content": "Updated comment text."
}
```

**Responses:**
- `200 OK` — updated comment
- `403 Forbidden` — not your comment
- `404 Not Found` — comment or ticket not found

---

### 14. Delete Comment

```
DELETE /api/tickets/{id}/comments/{commentId}
```

**Access:** Comment author or `ROLE_ADMIN`

**Postman:**
- Method: `DELETE`
- URL: `{{base_url}}/api/tickets/69ecade60f0b2a436fe740f6/comments/664abc000001`

**Responses:**
- `204 No Content` — deleted
- `403 Forbidden` — not your comment and not ADMIN
- `404 Not Found` — comment or ticket not found

---

## Validation Summary

| Validation | Location in Code |
|---|---|
| Title required | `TicketService.java` → `createTicket()` |
| Description required | `TicketService.java` → `createTicket()` |
| Category required | `TicketService.java` → `createTicket()` |
| Priority required | `TicketService.java` → `createTicket()` |
| Location OR resourceId required | `TicketService.java` → `createTicket()` |
| Title/description required on update | `TicketService.java` → `updateTicket()` |
| User can only edit own OPEN tickets | `TicketService.java` → `updateTicket()` |
| User can only delete own OPEN tickets | `TicketService.java` → `deleteTicket()` |
| Technician locked after OPEN | `TicketService.java` → `assignTechnician()` |
| Assigned user must not be ROLE_USER | `TicketService.java` → `assignTechnician()` |
| Status transition map | `TicketService.java` → `ALLOWED_TRANSITIONS` static block |
| RESOLVED requires resolutionNotes | `TicketService.java` → `transitionStatus()` |
| REJECTED requires rejectionReason | `TicketService.java` → `transitionStatus()` |
| Only ADMIN can reject/close | `TicketService.java` → `transitionStatus()` |
| Only assigned technician or ADMIN can resolve | `TicketService.java` → `transitionStatus()` |
| Role-based ticket visibility (list/get) | `TicketService.java` → `getAllTickets()` / `getTicketById()` |
| Role-based attachment access | `AttachmentService.java` → `checkTicketAccess()` |
| Max 3 attachments per ticket | `AttachmentService.java` → `uploadAttachmentsForTicket()` |
| Attachment type: jpg/jpeg/png only | `AttachmentService.java` → `validateFile()` |
| Attachment max size: 5 MB | `AttachmentService.java` → `validateFile()` |
| No path traversal in filenames | `AttachmentService.java` → `validateFile()` |
| Missing file filtered from list | `AttachmentService.java` → `getAttachmentsForTicket()` |
| Only ADMIN can assign technician | `TicketController.java` → `assignTechnician()` |

---

## Key Source Files

| File | Purpose |
|---|---|
| `controller/TicketController.java` | All `/api/tickets` REST endpoints |
| `service/TicketService.java` | Business logic, status transitions, role checks |
| `service/AttachmentService.java` | File upload/download, access control |
| `dto/TicketCreateDTO.java` | Create/update request body shape |
| `dto/TicketStatusUpdateDTO.java` | Status update request body shape |
| `dto/CommentDTO.java` | Comment request body shape |
| `entity/Ticket.java` | MongoDB document — ticket fields |
| `entity/Attachment.java` | MongoDB document — attachment metadata |
| `repository/TicketRepository.java` | MongoDB queries for tickets |
| `repository/AttachmentRepository.java` | MongoDB queries for attachments |
