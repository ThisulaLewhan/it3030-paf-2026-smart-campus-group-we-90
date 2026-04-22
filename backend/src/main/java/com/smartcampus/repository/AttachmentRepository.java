package com.smartcampus.repository;

import com.smartcampus.entity.Attachment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends MongoRepository<Attachment, String> {

    List<Attachment> findByTicketId(String ticketId);

    long countByTicketId(String ticketId);
}
