package com.smartcampus.service;

import com.smartcampus.dto.IncidentTicketDTO;
import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.entity.IncidentTicket.Status;
import com.smartcampus.repository.IncidentTicketRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

@Service
public class IncidentTicketService {

    private final IncidentTicketRepository incidentTicketRepository;

    public IncidentTicketService(IncidentTicketRepository incidentTicketRepository) {
        this.incidentTicketRepository = incidentTicketRepository;
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
}
