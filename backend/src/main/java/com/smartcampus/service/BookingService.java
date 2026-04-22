package com.smartcampus.service;

import com.smartcampus.entity.Booking;
import com.smartcampus.repository.BookingRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
    }

    public Booking createBooking(Booking booking) {
        LocalDateTime now = LocalDateTime.now();
        booking.setCreatedAt(now);
        booking.setUpdatedAt(now);
        return bookingRepository.save(booking);
    }

    public Booking updateBooking(String id, Booking updatedBooking) {
        Booking existingBooking = getBookingById(id);
        existingBooking.setResourceId(updatedBooking.getResourceId());
        existingBooking.setBookedBy(updatedBooking.getBookedBy());
        existingBooking.setStartTime(updatedBooking.getStartTime());
        existingBooking.setEndTime(updatedBooking.getEndTime());
        existingBooking.setStatus(updatedBooking.getStatus());
        existingBooking.setPurpose(updatedBooking.getPurpose());
        existingBooking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(existingBooking);
    }

    public void deleteBooking(String id) {
        bookingRepository.deleteById(id);
    }
}
