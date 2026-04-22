package com.smartcampus.service;

import com.smartcampus.dto.CommentDTO;
import com.smartcampus.entity.TicketComment;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.TicketCommentRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketCommentServiceTest {

    @Mock
    private TicketCommentRepository commentRepository;

    @Mock
    private IncidentTicketRepository incidentTicketRepository;

    @InjectMocks
    private TicketCommentService ticketCommentService;

    // ------------------------------------------------------------------ //
    //  editComment — non-owner should throw SecurityException (403)       //
    // ------------------------------------------------------------------ //

    @Test
    void editComment_nonOwner_shouldThrowSecurityException() {
        String ticketId   = "ticket-1";
        String commentId  = "comment-1";
        String ownerId    = "alice";
        String intruderId = "bob";

        TicketComment comment = new TicketComment();
        comment.setId(commentId);
        comment.setTicketId(ticketId);
        comment.setAuthorId(ownerId);
        comment.setContent("Original content");

        when(commentRepository.findById(commentId))
                .thenReturn(Optional.of(comment));

        CommentDTO dto = new CommentDTO();
        dto.setContent("Tampered content");

        assertThrows(SecurityException.class,
                () -> ticketCommentService.editComment(ticketId, commentId, dto, intruderId));

        verify(commentRepository, never()).save(any());
    }
}
