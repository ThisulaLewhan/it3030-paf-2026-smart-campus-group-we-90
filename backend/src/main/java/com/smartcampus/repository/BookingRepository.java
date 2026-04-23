package com.smartcampus.repository;

import com.smartcampus.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByResourceId(String resourceId);
    
    List<Booking> findByDate(LocalDate date);
    
    List<Booking> findByResourceIdAndDate(String resourceId, LocalDate date);
}
