package com.smartcampus.service;

import com.smartcampus.dto.AssignDTO;
import com.smartcampus.dto.IncidentTicketDTO;
import com.smartcampus.dto.StatusUpdateDTO;
import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.entity.IncidentTicket.Category;
import com.smartcampus.entity.IncidentTicket.Priority;
import com.smartcampus.entity.IncidentTicket.Status;
import com.smartcampus.entity.User;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoOperations;

import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentTicketServiceTest {

    @Mock
    private IncidentTicketRepository incidentTicketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MongoOperations mongoTemplate;

    @InjectMocks
    private IncidentTicketService incidentTicketService;

    // ------------------------------------------------------------------ //
    //  createTicket — happy path                                           //
    // ------------------------------------------------------------------ //

    @Test
    void createTicket_shouldSaveWithStatusOpenAndTimestamps() {
        IncidentTicketDTO dto = new IncidentTicketDTO();
        dto.setTitle("Broken projector");
        dto.setCategory(Category.IT_SUPPORT);
        dto.setDescription("Projector in room 204 is not working.");
        dto.setPriority(Priority.HIGH);
        dto.setLocation("Room 204");

        // Return whatever is saved
        when(incidentTicketRepository.save(any(IncidentTicket.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        IncidentTicket result = incidentTicketService.createTicket(dto, "alice");

        assertEquals(Status.OPEN, result.getStatus());
        assertEquals("alice", result.getCreatedBy());
        assertEquals("Broken projector", result.getTitle());
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getUpdatedAt());
        verify(incidentTicketRepository, times(1)).save(any(IncidentTicket.class));
    }

    // ------------------------------------------------------------------ //
    //  updateStatus — invalid transition should throw IllegalStateException//
    // ------------------------------------------------------------------ //

    @Test
    void updateStatus_invalidTransition_shouldThrowIllegalStateException() {
        IncidentTicket ticket = new IncidentTicket();
        ticket.setId("ticket-1");
        ticket.setStatus(Status.OPEN);

        when(incidentTicketRepository.findById("ticket-1"))
                .thenReturn(Optional.of(ticket));

        StatusUpdateDTO dto = new StatusUpdateDTO();
        // OPEN → CLOSED is not a valid direct transition
        dto.setStatus(Status.CLOSED);

        assertThrows(IllegalStateException.class,
                () -> incidentTicketService.updateStatus("ticket-1", dto));

        verify(incidentTicketRepository, never()).save(any());
    }

    // ------------------------------------------------------------------ //
    //  assignTechnician — non-existent user should throw NoSuchElement    //
    // ------------------------------------------------------------------ //

    @Test
    void assignTechnician_nonExistentUser_shouldThrowNoSuchElementException() {
        AssignDTO dto = new AssignDTO();
        dto.setTechnicianId("ghost-user-id");

        when(userRepository.findById("ghost-user-id"))
                .thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class,
                () -> incidentTicketService.assignTechnician("ticket-1", dto));

        verify(incidentTicketRepository, never()).save(any());
    }
}
