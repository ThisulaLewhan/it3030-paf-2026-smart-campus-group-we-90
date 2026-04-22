package com.smartcampus.service;

import com.smartcampus.entity.Ticket;
import com.smartcampus.repository.TicketRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));
    }

    public Ticket createTicket(Ticket ticket) {
        LocalDateTime now = LocalDateTime.now();
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);
        return ticketRepository.save(ticket);
    }

    public Ticket updateTicket(Long id, Ticket updatedTicket) {
        Ticket existingTicket = getTicketById(id);
        existingTicket.setTitle(updatedTicket.getTitle());
        existingTicket.setDescription(updatedTicket.getDescription());
        existingTicket.setPriority(updatedTicket.getPriority());
        existingTicket.setStatus(updatedTicket.getStatus());
        existingTicket.setAssignedTo(updatedTicket.getAssignedTo());
        existingTicket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(existingTicket);
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }
}
