package com.smartcampus.service;

import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.BookingStatus;
import com.smartcampus.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
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
        checkForConflicts(requestDTO.getResourceId(), requestDTO.getDate(), requestDTO.getStartTime(), requestDTO.getEndTime(), null);
        
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
        checkForConflicts(updatedBooking.getResourceId(), updatedBooking.getDate(), updatedBooking.getStartTime(), updatedBooking.getEndTime(), id);

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

    public Booking approveBooking(Long id) {
        Booking booking = getBookingById(id);
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be approved.");
        }
        
        // Ensure no other APPROVED booking has taken this slot
        checkForConflicts(booking.getResourceId(), booking.getDate(), booking.getStartTime(), booking.getEndTime(), id);
        
        booking.setStatus(BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(Long id, String reason) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be rejected.");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("A rejection reason must be provided.");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(Long id) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled.");
        }
        
        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new IllegalStateException("Cannot cancel a rejected booking.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    private void checkForConflicts(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, Long excludeBookingId) {
        List<Booking> dailyBookings = bookingRepository.findByResourceIdAndDate(resourceId, date);
        for (Booking existing : dailyBookings) {
            if (excludeBookingId != null && excludeBookingId.equals(existing.getId())) {
                continue;
            }
            if (existing.getStatus() != BookingStatus.APPROVED) {
                continue;
            }
            if (startTime.isBefore(existing.getEndTime()) && endTime.isAfter(existing.getStartTime())) {
                throw new IllegalStateException("Time slot conflicts with an existing booking.");
            }
        }
    }
}
