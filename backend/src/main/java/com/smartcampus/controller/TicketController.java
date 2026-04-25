package com.smartcampus.controller;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.dto.TicketAssignDTO;
import com.smartcampus.dto.TicketCreateDTO;
import com.smartcampus.dto.TicketStatusUpdateDTO;
import com.smartcampus.entity.Attachment;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.TicketComment;
import com.smartcampus.service.AttachmentService;
import com.smartcampus.service.TicketCommentService;
import com.smartcampus.service.TicketService;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final TicketCommentService commentService;
    private final AttachmentService attachmentService;

    public TicketController(TicketService ticketService,
                             TicketCommentService commentService,
                             AttachmentService attachmentService) {
        this.ticketService = ticketService;
        this.commentService = commentService;
        this.attachmentService = attachmentService;
    }

    // ---- Basic ticket CRUD ---- //

    @GetMapping
    public List<Ticket> getTickets(Authentication auth) {
        String callerEmail = auth.getName();
        String callerRole = auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst()
                .orElse("ROLE_USER");
        return ticketService.getAllTickets(callerEmail, callerRole);
    }

    @GetMapping("/{id}")
    public Ticket getTicket(@PathVariable String id, Authentication auth) {
        String callerEmail = auth.getName();
        String callerRole = auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst()
                .orElse("ROLE_USER");
        return ticketService.getTicketById(id, callerEmail, callerRole);
    }

    /**
     * POST /api/tickets  (multipart/form-data)
     * Any authenticated user (USER, ADMIN, TECHNICIAN) can create a ticket.
     *
     * Parts:
     *   - "ticket"  (application/json, required)  — TicketCreateDTO fields
     *   - "files"   (binary, optional, up to 3)   — jpg/jpeg/png images, max 5 MB each
     *
     * Rules enforced:
     *   - Status is always set to OPEN — never accepted from the client
     *   - createdBy is set from the JWT token, never from the request body
     *   - assignedTechnicianId is ignored even if provided — use the assign endpoint instead
     *
     * Returns 201 Created on success.
     * Returns 400 Bad Request for validation errors (missing required fields, file type/size).
     * Returns 403 Forbidden if the caller is not authenticated.
     */
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Object> createTicket(
            @RequestPart("ticket") TicketCreateDTO dto,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            Ticket ticket = ticketService.createTicket(dto, auth.getName());

            // Upload optional image attachments (max 3, jpg/jpeg/png, max 5 MB each)
            if (files != null && !files.isEmpty()) {
                List<MultipartFile> nonEmpty = files.stream()
                        .filter(f -> f != null && !f.isEmpty())
                        .collect(Collectors.toList());
                if (!nonEmpty.isEmpty()) {
                    attachmentService.uploadAttachmentsForTicket(ticket.getId(), nonEmpty, auth.getName());
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("File storage error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Ticket updateTicket(@PathVariable String id, @RequestBody Ticket ticket) {
        return ticketService.updateTicket(id, ticket);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
    }

    /**
     * PATCH /api/tickets/{id}/status
     * Validates and applies a status transition with role-based enforcement.
     * Returns 200 OK; 400 for invalid transition/missing fields; 403 for unauthorized role.
     * IllegalArgumentException → 400 and ForbiddenException → 403 via GlobalExceptionHandler.
     */
    @PatchMapping("/{id}/status")
    public Ticket updateStatus(
            @PathVariable String id,
            @RequestBody TicketStatusUpdateDTO dto,
            Authentication auth) {

        String requesterRole = auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst()
                .orElse("ROLE_USER");

        return ticketService.transitionStatus(id, dto, auth.getName(), requesterRole);
    }

    /**
     * PATCH /api/tickets/{id}/assign
     * Admin only. Assigns (or reassigns) a technician to the ticket.
     *
     * Request body: { "technicianId": "<userId>" }
     *
     * Rules:
     *   - Only ADMIN may call this endpoint                     → 403 Forbidden for others
     *   - Ticket must exist                                     → 404 Not Found
     *   - Provided userId must exist                            → 404 Not Found
     *   - Provided user must have TECHNICIAN or ADMIN role      → 400 Bad Request
     *   - If ticket already has an assignee, reassignment is allowed (overwrite)
     *
     * Returns 200 OK with the updated ticket (assignedTechnician = email, assignedTo = name).
     * Triggers an INFO notification to the assigned technician.
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<Object> assignTechnician(
            @PathVariable String id,
            @RequestBody TicketAssignDTO dto,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only ADMIN can assign a technician to a ticket.");
        }

        if (dto.getTechnicianId() == null || dto.getTechnicianId().isBlank()) {
            return ResponseEntity.badRequest().body("technicianId must not be blank.");
        }

        try {
            Ticket updated = ticketService.assignTechnician(id, dto);
            return ResponseEntity.ok(updated);
        } catch (com.smartcampus.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- Comment endpoints ---- //

    /**
     * POST /api/tickets/{id}/comments
     * Any authenticated user, technician, or admin can add a comment.
     * Returns 201 Created.
     */
    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public TicketComment addComment(
            @PathVariable String id,
            @RequestBody CommentDTO dto,
            Authentication auth) {

        String authorRole = auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst()
                .orElse("ROLE_USER");

        return commentService.addCommentToTicket(id, dto, auth.getName(), authorRole);
    }

    /**
     * GET /api/tickets/{id}/comments
     * Any authenticated user can view all comments on a ticket.
     * Returns 200 OK.
     */
    @GetMapping("/{id}/comments")
    public List<TicketComment> getComments(@PathVariable String id) {
        return commentService.getCommentsForTicket(id);
    }

    /**
     * PUT /api/tickets/{id}/comments/{commentId}
     * Only the comment author may edit their own comment.
     * Returns 200 OK; 403 if not the owner; 404 if not found.
     * ForbiddenException and ResourceNotFoundException bubble up to GlobalExceptionHandler.
     */
    @PutMapping("/{id}/comments/{commentId}")
    public TicketComment editComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestBody CommentDTO dto,
            Authentication auth) {

        return commentService.editCommentOnTicket(id, commentId, dto, auth.getName());
    }

    /**
     * DELETE /api/tickets/{id}/comments/{commentId}
     * Comment owner or admin can delete a comment.
     * Returns 204 No Content; 403 if unauthorized; 404 if not found.
     * ForbiddenException and ResourceNotFoundException bubble up to GlobalExceptionHandler.
     */
    @DeleteMapping("/{id}/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            Authentication auth) {

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        commentService.deleteCommentFromTicket(id, commentId, auth.getName(), isAdmin);
    }

    // ---- Attachment endpoints ---- //

    /**
     * GET /api/tickets/{id}/attachments
     * Returns metadata for all attachments on a ticket.
     * Access: ADMIN (any), TECHNICIAN (assigned only), USER (own ticket only).
     */
    @GetMapping("/{id}/attachments")
    public ResponseEntity<Object> getAttachments(
            @PathVariable String id,
            Authentication auth) {

        String callerEmail = auth.getName();
        String callerRole = auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst()
                .orElse("ROLE_USER");

        List<Attachment> attachments = attachmentService.getAttachmentsForTicket(id, callerEmail, callerRole);
        return ResponseEntity.ok(attachments);
    }

    /**
     * GET /api/tickets/{id}/attachments/{attachmentId}
     * Streams the raw image bytes with the correct Content-Type header.
     * Access: same role rules as the list endpoint.
     */
    @GetMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<byte[]> streamAttachment(
            @PathVariable String id,
            @PathVariable String attachmentId,
            Authentication auth) throws IOException {

        String callerEmail = auth.getName();
        String callerRole = auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst()
                .orElse("ROLE_USER");

        AttachmentService.AttachmentDownloadResult result =
                attachmentService.getAttachmentBytes(id, attachmentId, callerEmail, callerRole);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(result.getContentType()));
        headers.setContentDispositionFormData("inline", result.getFilename());

        return ResponseEntity.ok()
                .headers(headers)
                .body(result.getBytes());
    }
}
