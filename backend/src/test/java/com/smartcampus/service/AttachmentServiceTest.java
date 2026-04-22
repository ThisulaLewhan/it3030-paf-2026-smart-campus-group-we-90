package com.smartcampus.service;

import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.repository.AttachmentRepository;
import com.smartcampus.repository.IncidentTicketRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttachmentServiceTest {

    @Mock
    private AttachmentRepository attachmentRepository;

    @Mock
    private IncidentTicketRepository incidentTicketRepository;

    @InjectMocks
    private AttachmentService attachmentService;

    // ------------------------------------------------------------------ //
    //  uploadAttachments — exceeding max 3 should throw IllegalArgument   //
    // ------------------------------------------------------------------ //

    @Test
    void uploadAttachments_exceedsMaxCount_shouldThrowIllegalArgumentException() {
        String ticketId = "ticket-42";

        // Ticket exists
        when(incidentTicketRepository.findById(ticketId))
                .thenReturn(Optional.of(new IncidentTicket()));

        // 2 attachments already on this ticket
        when(attachmentRepository.countByTicketId(ticketId))
                .thenReturn(2L);

        // Attempting to add 2 more → total 4 > 3
        MultipartFile file1 = mock(MultipartFile.class);
        MultipartFile file2 = mock(MultipartFile.class);

        assertThrows(IllegalArgumentException.class,
                () -> attachmentService.uploadAttachments(ticketId, List.of(file1, file2)));

        verify(attachmentRepository, never()).save(any());
    }
}
