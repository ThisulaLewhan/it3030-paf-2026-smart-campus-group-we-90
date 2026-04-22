package com.smartcampus.service;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.entity.TicketComment;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.TicketCommentRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

@Service
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final IncidentTicketRepository incidentTicketRepository;

    public TicketCommentService(TicketCommentRepository commentRepository,
                                 IncidentTicketRepository incidentTicketRepository) {
        this.commentRepository = commentRepository;
        this.incidentTicketRepository = incidentTicketRepository;
    }

    public TicketComment addComment(String ticketId, CommentDTO dto, String authorId) {
        incidentTicketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Incident ticket not found: " + ticketId));

        LocalDateTime now = LocalDateTime.now();
        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setContent(dto.getContent());
        comment.setAuthorId(authorId);
        comment.setCreatedAt(now);
        comment.setUpdatedAt(now);

        return commentRepository.save(comment);
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

    private TicketComment getCommentOrThrow(String commentId, String ticketId) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NoSuchElementException("Comment not found: " + commentId));

        if (!comment.getTicketId().equals(ticketId)) {
            throw new NoSuchElementException(
                    "Comment " + commentId + " does not belong to ticket " + ticketId);
        }

        return comment;
    }
}
