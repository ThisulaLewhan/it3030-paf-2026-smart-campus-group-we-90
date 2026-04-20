package com.smartcampus.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.smartcampus.entity.Booking;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {}
