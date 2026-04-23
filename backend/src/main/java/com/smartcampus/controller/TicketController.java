package com.smartcampus.controller;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.TicketComment;
import com.smartcampus.service.TicketCommentService;
import com.smartcampus.service.TicketService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final TicketCommentService commentService;

    public TicketController(TicketService ticketService, TicketCommentService commentService) {
        this.ticketService = ticketService;
        this.commentService = commentService;
    }

    // ---- Basic ticket CRUD ---- //

    @GetMapping
    public List<Ticket> getTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/{id}")
    public Ticket getTicket(@PathVariable String id) {
        return ticketService.getTicketById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Ticket createTicket(@RequestBody Ticket ticket) {
        return ticketService.createTicket(ticket);
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
