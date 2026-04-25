package com.smartcampus.controller;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.dto.TicketCreateDTO;
import com.smartcampus.dto.TicketStatusUpdateDTO;
import com.smartcampus.entity.Attachment;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.TicketComment;
import com.smartcampus.exception.ForbiddenException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.service.AttachmentService;
import com.smartcampus.service.TicketCommentService;
import com.smartcampus.service.TicketService;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
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

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Object> createTicket(
            @RequestPart("ticket") TicketCreateDTO dto,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String requesterRole = auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .findFirst()
                .orElse("ROLE_USER");

        try {
            Ticket ticket = ticketService.createTicket(dto, auth.getName(), requesterRole);

            if (files != null && !files.isEmpty()) {
                List<MultipartFile> nonEmpty = files.stream()
                        .filter(f -> f != null && !f.isEmpty())
                        .collect(Collectors.toList());
                if (!nonEmpty.isEmpty()) {
                    attachmentService.uploadAttachmentsForTicket(ticket.getId(), nonEmpty, auth.getName());
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
        } catch (ForbiddenException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("File storage error: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Object> assignTechnician(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication auth) {

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only ADMIN can assign a technician to a ticket.");
        }

        String technicianId = body.get("technicianId");
        if (technicianId == null || technicianId.isBlank()) {
            return ResponseEntity.badRequest().body("technicianId must not be blank.");
        }

        try {
            Ticket updated = ticketService.assignTechnician(id, technicianId);
            return ResponseEntity.ok(updated);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ---- Attachment endpoints ---- //

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

        return ResponseEntity.ok().headers(headers).body(result.getBytes());
    }

    @PostMapping(value = "/{id}/attachments", consumes = "multipart/form-data")
    public ResponseEntity<Object> uploadAttachments(
            @PathVariable String id,
            @RequestParam("files") List<MultipartFile> files,
            Authentication auth) {

        try {
            List<Attachment> saved = attachmentService.uploadAttachmentsForTicket(id, files, auth.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
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
}
