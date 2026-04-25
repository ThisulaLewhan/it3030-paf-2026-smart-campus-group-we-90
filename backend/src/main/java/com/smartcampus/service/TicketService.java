package com.smartcampus.service;

import com.smartcampus.dto.TicketCreateDTO;
import com.smartcampus.dto.TicketStatusUpdateDTO;
import com.smartcampus.entity.NotificationType;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.Ticket;
import com.smartcampus.entity.User;
import com.smartcampus.exception.ForbiddenException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
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
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getAllTickets(String callerEmail, String callerRole) {
        List<Ticket> all = ticketRepository.findAll();
        if ("ROLE_ADMIN".equals(callerRole)) {
            return all;
        }
        if ("ROLE_TECHNICIAN".equals(callerRole)) {
            return all.stream()
                    .filter(t -> callerEmail.equals(t.getAssignedTechnician()))
                    .collect(Collectors.toList());
        }
        return all.stream()
                .filter(t -> callerEmail.equals(t.getCreatedBy()))
                .collect(Collectors.toList());
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));
    }

    public Ticket getTicketById(String id, String callerEmail, String callerRole) {
        Ticket ticket = getTicketById(id);
        if ("ROLE_ADMIN".equals(callerRole)) return ticket;
        if ("ROLE_TECHNICIAN".equals(callerRole)) {
            if (!callerEmail.equals(ticket.getAssignedTechnician())) {
                throw new ForbiddenException("You are not assigned to this ticket.");
            }
            return ticket;
        }
        if (!callerEmail.equals(ticket.getCreatedBy())) {
            throw new ForbiddenException("You did not create this ticket.");
        }
        return ticket;
    }

    /**
     * Creates a ticket with field validation.
     * Status is always forced to OPEN; assignedTechnicianId is ignored.
     *
     * @param dto          request body
     * @param creatorEmail principal name (email) from JWT
     * @return saved ticket (status always OPEN)
     * @throws IllegalArgumentException for missing required fields (→ 400)
     */
    public Ticket createTicket(TicketCreateDTO dto, String creatorEmail, String creatorRole) {
        return createTicket(dto, creatorEmail);
    }

    public Ticket createTicket(TicketCreateDTO dto, String creatorEmail) {
        // Validate required fields
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (dto.getDescription() == null || dto.getDescription().isBlank()) {
            throw new IllegalArgumentException("Description is required");
        }
        if (dto.getCategory() == null || dto.getCategory().isBlank()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (dto.getPriority() == null || dto.getPriority().isBlank()) {
            throw new IllegalArgumentException("Priority is required");
        }
        boolean hasLocation = dto.getLocation() != null && !dto.getLocation().isBlank();
        boolean hasResource = dto.getResourceId() != null && !dto.getResourceId().isBlank();
        if (!hasLocation && !hasResource) {
            throw new IllegalArgumentException("Either location or resourceId is required");
        }

        // assignedTechnicianId is intentionally ignored at creation — assignment is a separate operation
        LocalDateTime now = LocalDateTime.now();
        Ticket ticket = new Ticket();
        ticket.setTitle(dto.getTitle());
        ticket.setCategory(dto.getCategory());
        ticket.setDescription(dto.getDescription());
        ticket.setPriority(dto.getPriority());
        ticket.setResourceId(dto.getResourceId());
        ticket.setLocation(dto.getLocation());
        ticket.setPreferredContact(dto.getPreferredContact());
        ticket.setStatus("OPEN");
        ticket.setCreatedBy(creatorEmail);
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);

        return ticketRepository.save(ticket);
    }

    /**
     * PATCH /api/tickets/{id}/assign — Admin only.
     * Assigns (or reassigns) a technician to the ticket.
     *
     * Validations:
     *   - Ticket must exist                          → 404 via ResourceNotFoundException
     *   - Provided technicianId must exist           → 404 via ResourceNotFoundException
     *   - Provided user must be TECHNICIAN or ADMIN  → 400 via IllegalArgumentException
     *
     * Side-effect: fires an INFO notification to the assigned technician.
     *
     * @param id    ticket id
     * @param dto   contains technicianId
     * @return updated ticket (includes assignedTechnician name + email)
     */
    public Ticket assignTechnician(String id, String technicianId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));

        if (!"OPEN".equals(ticket.getStatus())) {
            throw new ForbiddenException(
                    "Technician cannot be changed once the ticket is in '" + ticket.getStatus() + "' status.");
        }

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + technicianId));

        if (technician.getRole() == Role.USER) {
            throw new IllegalArgumentException(
                    "User '" + technician.getEmail() + "' has role USER and cannot be assigned as a technician.");
        }

        // Assign (overwrite any existing assignee)
        ticket.setAssignedTechnician(technician.getEmail());
        ticket.setAssignedTo(technician.getName());
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);

        // Notify the technician — coordinate with Module D teammate for preference-aware delivery
        notificationService.createNotification(
                technician,
                "You have been assigned to ticket: " + ticket.getTitle(),
                NotificationType.INFO
        );

        return saved;
    }

    public Ticket updateTicket(String id, TicketCreateDTO dto, String callerEmail, String callerRole) {
        Ticket existing = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));

        boolean isAdmin = "ROLE_ADMIN".equals(callerRole);
        boolean isCreator = callerEmail.equals(existing.getCreatedBy());
        if (!isAdmin && !isCreator) {
            throw new ForbiddenException("You can only edit your own tickets.");
        }
        if (!isAdmin && !"OPEN".equals(existing.getStatus())) {
            throw new ForbiddenException("Tickets can only be edited while in OPEN status.");
        }

        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (dto.getDescription() == null || dto.getDescription().isBlank()) {
            throw new IllegalArgumentException("Description is required");
        }

        existing.setTitle(dto.getTitle());
        existing.setCategory(dto.getCategory());
        existing.setDescription(dto.getDescription());
        existing.setPriority(dto.getPriority());
        existing.setLocation(dto.getLocation());
        existing.setResourceId(dto.getResourceId());
        existing.setPreferredContact(dto.getPreferredContact());
        existing.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(existing);
    }

    public void deleteTicket(String id, String callerEmail, String callerRole) {
        Ticket existing = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));

        boolean isAdmin = "ROLE_ADMIN".equals(callerRole);
        boolean isCreator = callerEmail.equals(existing.getCreatedBy());
        if (!isAdmin && !isCreator) {
            throw new ForbiddenException("You can only delete your own tickets.");
        }
        if (!isAdmin && !"OPEN".equals(existing.getStatus())) {
            throw new ForbiddenException("Tickets can only be deleted while in OPEN status.");
        }

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
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));

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
                boolean isAssigned = requesterEmail != null && requesterEmail.equals(ticket.getAssignedTechnician());
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
        Ticket saved = ticketRepository.save(ticket);

        // Notify the ticket creator about the status change
        if (ticket.getCreatedBy() != null) {
            userRepository.findByEmail(ticket.getCreatedBy()).ifPresent(ticketOwner ->
                notificationService.notifyTicketStatusUpdate(ticketOwner, ticket.getId(), next.name())
            );
        }

        return saved;
    }
}
