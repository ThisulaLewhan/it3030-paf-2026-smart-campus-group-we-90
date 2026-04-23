package com.smartcampus.service;

import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.BookingStatus;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.entity.User;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    private Booking enrichWithUserDetails(Booking booking) {
        if (booking != null && booking.getUserId() != null) {
            userRepository.findById(booking.getUserId()).ifPresent(user -> {
                booking.setUserName(user.getName());
                booking.setUserEmail(user.getEmail());
            });
        }
        return booking;
    }

    private List<Booking> enrichWithUserDetails(List<Booking> bookings) {
        bookings.forEach(this::enrichWithUserDetails);
        return bookings;
    }

    public List<Booking> getAllBookings() {
        return enrichWithUserDetails(bookingRepository.findAll());
    }

    public List<Booking> getFilteredBookings(String resourceId, BookingStatus status, LocalDate date) {
        Booking probe = new Booking();
        if (resourceId != null) probe.setResourceId(resourceId);
        if (status != null) probe.setStatus(status);
        if (date != null) probe.setDate(date);

        ExampleMatcher matcher = ExampleMatcher.matching()
                .withIgnoreNullValues()
                .withIgnorePaths("id")
                .withStringMatcher(ExampleMatcher.StringMatcher.EXACT);

        return enrichWithUserDetails(bookingRepository.findAll(Example.of(probe, matcher)));
    }

    public List<Booking> getBookingsByUserId(String userId) {
        return enrichWithUserDetails(bookingRepository.findByUserId(userId));
    }

    public Booking getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
        return enrichWithUserDetails(booking);
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
        booking.setExpectedAttendees(requestDTO.getExpectedAttendees());
        booking.setAttendees(requestDTO.getAttendees());
        
        // Set status to PENDING
        booking.setStatus(BookingStatus.PENDING);
        
        return bookingRepository.save(booking);
    }

    public Booking updateBooking(String id, BookingRequestDTO updatedBooking) {
        checkForConflicts(updatedBooking.getResourceId(), updatedBooking.getDate(), updatedBooking.getStartTime(), updatedBooking.getEndTime(), id);

        Booking existingBooking = getBookingById(id);
        existingBooking.setResourceId(updatedBooking.getResourceId());
        existingBooking.setUserId(updatedBooking.getUserId());
        existingBooking.setDate(updatedBooking.getDate());
        existingBooking.setStartTime(updatedBooking.getStartTime());
        existingBooking.setEndTime(updatedBooking.getEndTime());
        existingBooking.setPurpose(updatedBooking.getPurpose());
        existingBooking.setExpectedAttendees(updatedBooking.getExpectedAttendees());
        existingBooking.setAttendees(updatedBooking.getAttendees());
        
        return bookingRepository.save(existingBooking);
    }

    public Booking approveBooking(String id) {
        Booking booking = getBookingById(id);
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be approved.");
        }
        
        // Ensure no other APPROVED booking has taken this slot
        checkForConflicts(booking.getResourceId(), booking.getDate(), booking.getStartTime(), booking.getEndTime(), id);
        
        booking.setStatus(BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(String id, String reason) {
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

    public Booking cancelBooking(String id) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED bookings can be cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    public void deleteBooking(String id) {
        bookingRepository.deleteById(id);
    }

    private void checkForConflicts(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime, String excludeBookingId) {
        List<Booking> dailyBookings = bookingRepository.findByResourceIdAndDate(resourceId, date);
        for (Booking existing : dailyBookings) {
            if (excludeBookingId != null && excludeBookingId.equals(existing.getId())) {
                continue;
            }
            // Ignore REJECTED and CANCELLED bookings. Both PENDING and APPROVED bookings block the time slot.
            if (existing.getStatus() == BookingStatus.REJECTED || existing.getStatus() == BookingStatus.CANCELLED) {
                continue;
            }
            if (startTime.isBefore(existing.getEndTime()) && endTime.isAfter(existing.getStartTime())) {
                throw new IllegalStateException("Time slot conflicts with an existing booking.");
            }
        }
    }
}
