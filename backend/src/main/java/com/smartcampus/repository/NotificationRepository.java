package com.smartcampus.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.smartcampus.entity.Notification;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {}
