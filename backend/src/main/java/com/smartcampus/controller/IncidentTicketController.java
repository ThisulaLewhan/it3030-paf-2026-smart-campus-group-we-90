package com.smartcampus.controller;

import com.smartcampus.dto.IncidentTicketDTO;
import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.service.IncidentTicketService;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/incident-tickets")
public class IncidentTicketController {

    private final IncidentTicketService incidentTicketService;

    public IncidentTicketController(IncidentTicketService incidentTicketService) {
        this.incidentTicketService = incidentTicketService;
    }

    /**
     * POST /api/incident-tickets
     * Any authenticated user can submit a new incident ticket.
     * Status is automatically set to OPEN.
     * Returns 201 Created on success, 403 if not authenticated.
     */
    @PostMapping
    public ResponseEntity<IncidentTicket> createTicket(
            @RequestBody IncidentTicketDTO dto,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        IncidentTicket created = incidentTicketService.createTicket(dto, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/incident-tickets/{id}
     * Authenticated users can view a ticket. Regular users may only view their own tickets.
     * Admins can view any ticket.
     * Returns 200 OK, 403 Forbidden, or 404 Not Found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<IncidentTicket> getTicketById(
            @PathVariable String id,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            IncidentTicket ticket = incidentTicketService.getTicketById(id);

            boolean isAdmin = isAdmin(auth);
            if (!isAdmin && !ticket.getCreatedBy().equals(auth.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(ticket);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/incident-tickets
     * Admins receive all tickets. Regular users receive only their own.
     * Returns 200 OK, or 403 if not authenticated.
     */
    @GetMapping
    public ResponseEntity<List<IncidentTicket>> getTickets(Authentication auth) {

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<IncidentTicket> tickets = isAdmin(auth)
                ? incidentTicketService.getAllTickets()
                : incidentTicketService.getTicketsByUser(auth.getName());

        return ResponseEntity.ok(tickets);
    }

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
