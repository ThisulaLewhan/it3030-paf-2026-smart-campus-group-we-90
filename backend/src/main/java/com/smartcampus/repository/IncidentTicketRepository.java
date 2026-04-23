package com.smartcampus.repository;

import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.entity.IncidentTicket.Status;
import com.smartcampus.entity.IncidentTicket.Priority;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {

    List<IncidentTicket> findByCreatedBy(String createdBy);

    List<IncidentTicket> findByAssignedTechnician(String assignedTechnician);

    List<IncidentTicket> findByStatus(Status status);

    List<IncidentTicket> findByPriority(Priority priority);
}
