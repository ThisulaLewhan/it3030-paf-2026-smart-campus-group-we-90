package com.smartcampus.service;

import com.smartcampus.dto.TicketStatusUpdateDTO;
import com.smartcampus.entity.Ticket;
import com.smartcampus.exception.ForbiddenException;
import com.smartcampus.repository.TicketRepository;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class TicketService {

    // ---- Status transition map ----------------------------------------- //

    private enum TicketStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }

    private static final Map<TicketStatus, List<TicketStatus>> ALLOWED_TRANSITIONS =
            new EnumMap<>(TicketStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(TicketStatus.OPEN,        List.of(TicketStatus.IN_PROGRESS, TicketStatus.REJECTED));
        ALLOWED_TRANSITIONS.put(TicketStatus.IN_PROGRESS, List.of(TicketStatus.RESOLVED,    TicketStatus.OPEN));
        ALLOWED_TRANSITIONS.put(TicketStatus.RESOLVED,    List.of(TicketStatus.CLOSED,      TicketStatus.IN_PROGRESS));
        ALLOWED_TRANSITIONS.put(TicketStatus.CLOSED,      List.of());
        ALLOWED_TRANSITIONS.put(TicketStatus.REJECTED,    List.of());
    }

    // -------------------------------------------------------------------- //

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));
    }

    public Ticket createTicket(Ticket ticket) {
        LocalDateTime now = LocalDateTime.now();
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        return ticketRepository.save(ticket);
    }

    public Ticket updateTicket(String id, Ticket updatedTicket) {
        Ticket existingTicket = getTicketById(id);
        existingTicket.setTitle(updatedTicket.getTitle());
        existingTicket.setDescription(updatedTicket.getDescription());
        existingTicket.setPriority(updatedTicket.getPriority());
        existingTicket.setStatus(updatedTicket.getStatus());
        existingTicket.setAssignedTo(updatedTicket.getAssignedTo());
        existingTicket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(existingTicket);
    }

    public void deleteTicket(String id) {
        ticketRepository.deleteById(id);
    }

    /**
     * Validates and applies a status transition.
     *
     * @param id             ticket id
     * @param dto            contains newStatus, optional resolutionNotes, optional rejectionReason
     * @param requesterEmail principal name (email) from the JWT
     * @param requesterRole  first authority from the JWT, e.g. "ROLE_ADMIN"
     * @return updated ticket
     * @throws IllegalArgumentException if the transition is not allowed or required fields are missing (→ 400)
     * @throws ForbiddenException       if the caller's role is not permitted for that transition (→ 403)
     */
    public Ticket transitionStatus(String id, TicketStatusUpdateDTO dto,
                                    String requesterEmail, String requesterRole) {
        Ticket ticket = getTicketById(id);

        TicketStatus current;
        TicketStatus next;
        try {
            current = TicketStatus.valueOf(ticket.getStatus());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Ticket has unrecognized status: " + ticket.getStatus());
        }
        try {
            next = TicketStatus.valueOf(dto.getNewStatus());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown target status: " + dto.getNewStatus());
        }

        List<TicketStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, List.of());
        if (!allowed.contains(next)) {
            throw new IllegalArgumentException(
                    "Invalid status transition from " + current + " to " + next);
        }

        switch (next) {
            case REJECTED:
                if (!"ROLE_ADMIN".equals(requesterRole)) {
                    throw new ForbiddenException("Only ADMIN can reject a ticket.");
                }
                if (dto.getRejectionReason() == null || dto.getRejectionReason().isBlank()) {
                    throw new IllegalArgumentException("rejectionReason must not be blank when rejecting a ticket.");
                }
                ticket.setRejectionReason(dto.getRejectionReason());
                break;

            case IN_PROGRESS:
                if (!"ROLE_ADMIN".equals(requesterRole) && !"ROLE_TECHNICIAN".equals(requesterRole)) {
                    throw new ForbiddenException("Only ADMIN or TECHNICIAN can move a ticket to IN_PROGRESS.");
                }
                break;

            case RESOLVED:
                boolean isAdmin   = "ROLE_ADMIN".equals(requesterRole);
                boolean isAssigned = requesterEmail != null && requesterEmail.equals(ticket.getAssignedTo());
                if (!isAdmin && !isAssigned) {
                    throw new ForbiddenException("Only the assigned technician or ADMIN can resolve a ticket.");
                }
                if (dto.getResolutionNotes() == null || dto.getResolutionNotes().isBlank()) {
                    throw new IllegalArgumentException("resolutionNotes must not be blank when resolving a ticket.");
                }
                ticket.setResolutionNotes(dto.getResolutionNotes());
                break;

            case CLOSED:
                if (!"ROLE_ADMIN".equals(requesterRole)) {
                    throw new ForbiddenException("Only ADMIN can close a ticket.");
                }
                break;

            default:
                break;
        }

        ticket.setStatus(next.name());
        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }
}

