package com.smartcampus.service;

import com.smartcampus.dto.AssignDTO;
import com.smartcampus.dto.IncidentTicketDTO;
import com.smartcampus.dto.RejectDTO;
import com.smartcampus.dto.StatusUpdateDTO;
import com.smartcampus.dto.TicketFilterDTO;
import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.entity.IncidentTicket.Status;
import com.smartcampus.entity.User;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;

import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
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
    private final MongoOperations mongoTemplate;

    public IncidentTicketService(IncidentTicketRepository incidentTicketRepository,
                                  UserRepository userRepository,
                                  MongoOperations mongoTemplate) {
        this.incidentTicketRepository = incidentTicketRepository;
        this.userRepository = userRepository;
        this.mongoTemplate = mongoTemplate;
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

    /**
     * Dynamic filtered search. Non-admin callers always have createdBy forced to their
     * own username regardless of any createdBy value in the filter.
     */
    public List<IncidentTicket> searchTickets(TicketFilterDTO filter, String caller, boolean isAdmin) {
        List<Criteria> criteriaList = new ArrayList<>();

        if (filter.getStatus() != null) {
            criteriaList.add(Criteria.where("status").is(filter.getStatus()));
        }
        if (filter.getPriority() != null) {
            criteriaList.add(Criteria.where("priority").is(filter.getPriority()));
        }
        if (filter.getCategory() != null) {
            criteriaList.add(Criteria.where("category").is(filter.getCategory()));
        }
        if (filter.getAssignedTechnician() != null && !filter.getAssignedTechnician().isBlank()) {
            criteriaList.add(Criteria.where("assignedTechnician").is(filter.getAssignedTechnician()));
        }

        if (isAdmin) {
            // Admin may optionally filter by a specific createdBy
            if (filter.getCreatedBy() != null && !filter.getCreatedBy().isBlank()) {
                criteriaList.add(Criteria.where("createdBy").is(filter.getCreatedBy()));
            }
        } else {
            // Non-admin: always restrict to their own tickets
            criteriaList.add(Criteria.where("createdBy").is(caller));
        }

        Query query = new Query();
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        return mongoTemplate.find(query, IncidentTicket.class);
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
