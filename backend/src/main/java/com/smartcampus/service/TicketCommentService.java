package com.smartcampus.service;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.entity.TicketComment;
import com.smartcampus.exception.ForbiddenException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

@Service
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final IncidentTicketRepository incidentTicketRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public TicketCommentService(TicketCommentRepository commentRepository,
                                 IncidentTicketRepository incidentTicketRepository,
                                 TicketRepository ticketRepository,
                                 NotificationService notificationService,
                                 UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.incidentTicketRepository = incidentTicketRepository;
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // ------------------------------------------------------------------ //
    //  Basic Ticket (/api/tickets) comment methods                        //
    //  Throw ResourceNotFoundException / ForbiddenException               //
    //  — picked up automatically by GlobalExceptionHandler                //
    // ------------------------------------------------------------------ //

    public TicketComment addCommentToTicket(String ticketId, CommentDTO dto,
                                             String authorId, String authorRole) {
        com.smartcampus.entity.Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        LocalDateTime now = LocalDateTime.now();
        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setContent(dto.getContent());
        comment.setAuthorId(authorId);
        comment.setAuthorRole(authorRole);
        comment.setCreatedAt(now);
        comment.setUpdatedAt(now);

        TicketComment saved = commentRepository.save(comment);

        // Notify the ticket creator about the new comment (unless they wrote it themselves)
        if (ticket.getCreatedBy() != null && !ticket.getCreatedBy().equals(authorId)) {
            // authorId could be email or user id, resolve commenter name for display
            String commenterName = userRepository.findById(authorId)
                    .map(u -> u.getName())
                    .orElse(userRepository.findByEmail(authorId)
                            .map(u -> u.getName())
                            .orElse("Someone"));
            userRepository.findByEmail(ticket.getCreatedBy()).ifPresent(ticketOwner ->
                notificationService.notifyNewComment(ticketOwner, commenterName, ticket.getTitle())
            );
        }

        return saved;
    }

    public List<TicketComment> getCommentsForTicket(String ticketId) {
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public TicketComment editCommentOnTicket(String ticketId, String commentId,
                                              CommentDTO dto, String requesterId) {
        TicketComment comment = getCommentOrThrowChecked(commentId, ticketId);

        if (!comment.getAuthorId().equals(requesterId)) {
            throw new ForbiddenException("Only the comment author may edit this comment.");
        }

        comment.setContent(dto.getContent());
        comment.setUpdatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public void deleteCommentFromTicket(String ticketId, String commentId,
                                         String requesterId, boolean isAdmin) {
        TicketComment comment = getCommentOrThrowChecked(commentId, ticketId);

        if (!isAdmin && !comment.getAuthorId().equals(requesterId)) {
            throw new ForbiddenException("Only the comment author or an admin may delete this comment.");
        }

        commentRepository.deleteById(commentId);
    }

    // ------------------------------------------------------------------ //
    //  Incident Ticket (/api/incident-tickets) comment methods (legacy)   //
    //  Throw NoSuchElementException / SecurityException                   //
    //  — caught explicitly in TicketCommentController                     //
    // ------------------------------------------------------------------ //

    public TicketComment addComment(String ticketId, CommentDTO dto, String authorId) {
        com.smartcampus.entity.IncidentTicket ticket = incidentTicketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Incident ticket not found: " + ticketId));

        LocalDateTime now = LocalDateTime.now();
        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setContent(dto.getContent());
        comment.setAuthorId(authorId);
        comment.setCreatedAt(now);
        comment.setUpdatedAt(now);

        TicketComment saved = commentRepository.save(comment);

        // Notify the ticket creator about the new comment (unless they wrote it themselves)
        if (ticket.getCreatedBy() != null && !ticket.getCreatedBy().equals(authorId)) {
            String commenterName = userRepository.findById(authorId)
                    .map(u -> u.getName())
                    .orElse(userRepository.findByEmail(authorId)
                            .map(u -> u.getName())
                            .orElse("Someone"));
            userRepository.findByEmail(ticket.getCreatedBy()).ifPresent(ticketOwner ->
                notificationService.notifyNewComment(ticketOwner, commenterName, ticket.getTitle())
            );
        }

        return saved;
    }

    public List<TicketComment> getComments(String ticketId) {
        incidentTicketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Incident ticket not found: " + ticketId));

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public TicketComment editComment(String ticketId, String commentId,
                                      CommentDTO dto, String requesterId) {
        TicketComment comment = getCommentOrThrow(commentId, ticketId);

        if (!comment.getAuthorId().equals(requesterId)) {
            throw new SecurityException("Only the comment author may edit this comment.");
        }

        comment.setContent(dto.getContent());
        comment.setUpdatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public void deleteComment(String ticketId, String commentId,
                               String requesterId, boolean isAdmin) {
        TicketComment comment = getCommentOrThrow(commentId, ticketId);

        if (!isAdmin && !comment.getAuthorId().equals(requesterId)) {
            throw new SecurityException("Only the comment author or an admin may delete this comment.");
        }

        commentRepository.deleteById(commentId);
    }

    // ------------------------------------------------------------------ //
    //  Helpers                                                             //
    // ------------------------------------------------------------------ //

    /** Used by incident-ticket methods — throws unchecked NoSuchElementException. */
    private TicketComment getCommentOrThrow(String commentId, String ticketId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NoSuchElementException("Comment not found: " + commentId));

        if (!comment.getTicketId().equals(ticketId)) {
            throw new NoSuchElementException(
                    "Comment " + commentId + " does not belong to ticket " + ticketId);
        }

        return comment;
    }

    /** Used by basic-ticket methods — throws ResourceNotFoundException (→ 404 via GlobalExceptionHandler). */
    private TicketComment getCommentOrThrowChecked(String commentId, String ticketId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!comment.getTicketId().equals(ticketId)) {
            throw new ResourceNotFoundException(
                    "Comment " + commentId + " does not belong to ticket " + ticketId);
        }

        return comment;
    }
}
