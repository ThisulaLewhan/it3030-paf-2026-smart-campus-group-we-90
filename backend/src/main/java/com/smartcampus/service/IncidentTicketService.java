package com.smartcampus.service;

import com.smartcampus.dto.AssignDTO;
import com.smartcampus.dto.IncidentTicketDTO;
import com.smartcampus.dto.RejectDTO;
import com.smartcampus.dto.StatusUpdateDTO;
import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.entity.IncidentTicket.Status;
import com.smartcampus.entity.User;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;

import org.springframework.stereotype.Service;

@Service
public class IncidentTicketService {

    private static final Map<Status, Set<Status>> ALLOWED_TRANSITIONS = new EnumMap<>(Status.class);

    static {
        ALLOWED_TRANSITIONS.put(Status.OPEN,        EnumSet.of(Status.IN_PROGRESS));
        ALLOWED_TRANSITIONS.put(Status.IN_PROGRESS, EnumSet.of(Status.RESOLVED));
        ALLOWED_TRANSITIONS.put(Status.RESOLVED,    EnumSet.of(Status.CLOSED));
        ALLOWED_TRANSITIONS.put(Status.CLOSED,      EnumSet.noneOf(Status.class));
        ALLOWED_TRANSITIONS.put(Status.REJECTED,    EnumSet.noneOf(Status.class));
    }

    private final IncidentTicketRepository incidentTicketRepository;
    private final UserRepository userRepository;

    public IncidentTicketService(IncidentTicketRepository incidentTicketRepository,
                                  UserRepository userRepository) {
        this.incidentTicketRepository = incidentTicketRepository;
        this.userRepository = userRepository;
    }

    public IncidentTicket createTicket(IncidentTicketDTO dto, String createdBy) {
        IncidentTicket ticket = new IncidentTicket();
        ticket.setTitle(dto.getTitle());
        ticket.setCategory(dto.getCategory());
        ticket.setDescription(dto.getDescription());
        ticket.setPriority(dto.getPriority());
        ticket.setResourceId(dto.getResourceId());
        ticket.setLocation(dto.getLocation());
        ticket.setPreferredContact(dto.getPreferredContact());
        ticket.setCreatedBy(createdBy);
        ticket.setStatus(Status.OPEN);

        LocalDateTime now = LocalDateTime.now();
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);

        return incidentTicketRepository.save(ticket);
    }

    public IncidentTicket getTicketById(String id) {
        return incidentTicketRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Incident ticket not found: " + id));
    }

    public List<IncidentTicket> getAllTickets() {
        return incidentTicketRepository.findAll();
    }

    public List<IncidentTicket> getTicketsByUser(String username) {
        return incidentTicketRepository.findByCreatedBy(username);
    }

    public IncidentTicket updateStatus(String id, StatusUpdateDTO dto) {
        IncidentTicket ticket = getTicketById(id);
        Status current = ticket.getStatus();
        Status next = dto.getStatus();

        Set<Status> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, EnumSet.noneOf(Status.class));
        if (!allowed.contains(next)) {
            throw new IllegalStateException(
                "Invalid status transition: " + current + " → " + next);
        }

        ticket.setStatus(next);
        if (dto.getResolutionNotes() != null) {
            ticket.setResolutionNotes(dto.getResolutionNotes());
        }
        ticket.setUpdatedAt(LocalDateTime.now());
        return incidentTicketRepository.save(ticket);
    }

    public IncidentTicket assignTechnician(String ticketId, AssignDTO dto) {
        User technician = userRepository.findById(dto.getTechnicianId())
                .orElseThrow(() -> new NoSuchElementException(
                        "User not found: " + dto.getTechnicianId()));

        IncidentTicket ticket = getTicketById(ticketId);
        ticket.setAssignedTechnician(technician.getUsername());
        ticket.setUpdatedAt(LocalDateTime.now());
        return incidentTicketRepository.save(ticket);
    }

    public IncidentTicket rejectTicket(String id, RejectDTO dto) {
        IncidentTicket ticket = getTicketById(id);

        if (ticket.getStatus() != Status.OPEN) {
            throw new IllegalStateException(
                "Only OPEN tickets can be rejected. Current status: " + ticket.getStatus());
        }

        ticket.setStatus(Status.REJECTED);
        ticket.setRejectionReason(dto.getReason());
        ticket.setUpdatedAt(LocalDateTime.now());
        return incidentTicketRepository.save(ticket);
    }
}
