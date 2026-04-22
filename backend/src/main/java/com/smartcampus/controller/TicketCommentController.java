package com.smartcampus.controller;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.entity.TicketComment;
import com.smartcampus.service.TicketCommentService;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/incident-tickets")
public class TicketCommentController {

    private final TicketCommentService commentService;

    public TicketCommentController(TicketCommentService commentService) {
        this.commentService = commentService;
    }

    /**
     * POST /api/incident-tickets/{id}/comments
     * Any authenticated user can add a comment to a ticket.
     * Returns 201 Created, 403 if unauthenticated, 404 if ticket not found.
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<Object> addComment(
            @PathVariable String id,
            @RequestBody CommentDTO dto,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            TicketComment comment = commentService.addComment(id, dto, auth.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(comment);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/incident-tickets/{id}/comments
     * Returns all comments for a ticket in chronological order.
     * Returns 200 OK, 403 if unauthenticated, 404 if ticket not found.
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<Object> getComments(
            @PathVariable String id,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            List<TicketComment> comments = commentService.getComments(id);
            return ResponseEntity.ok(comments);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT /api/incident-tickets/{id}/comments/{commentId}
     * Only the comment author may edit their own comment.
     * Returns 200 OK, 403 if not the author or unauthenticated, 404 if not found.
     */
    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Object> editComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestBody CommentDTO dto,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            TicketComment updated = commentService.editComment(id, commentId, dto, auth.getName());
            return ResponseEntity.ok(updated);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    /**
     * DELETE /api/incident-tickets/{id}/comments/{commentId}
     * Comment author or admin can delete a comment.
     * Returns 204 No Content, 403 if unauthorized, 404 if not found.
     */
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Object> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        try {
            commentService.deleteComment(id, commentId, auth.getName(), isAdmin);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}
