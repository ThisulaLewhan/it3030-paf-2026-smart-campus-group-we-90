package com.smartcampus.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.smartcampus.entity.Ticket;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {}
