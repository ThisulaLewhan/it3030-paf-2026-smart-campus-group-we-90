package com.smartcampus.service;

import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.BookingStatus;
import com.smartcampus.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
    }

    public Booking createBooking(BookingRequestDTO requestDTO) {
        Booking booking = new Booking();
        booking.setResourceId(requestDTO.getResourceId());
        booking.setUserId(requestDTO.getUserId());
        booking.setDate(requestDTO.getDate());
        booking.setStartTime(requestDTO.getStartTime());
        booking.setEndTime(requestDTO.getEndTime());
        booking.setPurpose(requestDTO.getPurpose());
        booking.setAttendees(requestDTO.getAttendees());
        
        // Set status to PENDING
        booking.setStatus(BookingStatus.PENDING);
        
        return bookingRepository.save(booking);
    }

    public Booking updateBooking(Long id, BookingRequestDTO updatedBooking) {
        Booking existingBooking = getBookingById(id);
        existingBooking.setResourceId(updatedBooking.getResourceId());
        existingBooking.setUserId(updatedBooking.getUserId());
        existingBooking.setDate(updatedBooking.getDate());
        existingBooking.setStartTime(updatedBooking.getStartTime());
        existingBooking.setEndTime(updatedBooking.getEndTime());
        existingBooking.setPurpose(updatedBooking.getPurpose());
        existingBooking.setAttendees(updatedBooking.getAttendees());
        
        return bookingRepository.save(existingBooking);
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }
}
