package com.smartcampus.controller;

import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.BookingStatus;
import com.smartcampus.entity.User;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.UserService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    public BookingController(BookingService bookingService, UserService userService) {
        this.bookingService = bookingService;
        this.userService = userService;
    }

    @GetMapping
    public List<Booking> getBookings() {
        // Return only the current user's bookings; admins use /admin/all for full access
        User currentUser = userService.getCurrentlyAuthenticatedUser();
        return bookingService.getBookingsByUserId(currentUser.getId());
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Booking> getAdminBookings(
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return bookingService.getFilteredBookings(resourceId, status, date);
    }

    @GetMapping("/my-bookings")
    public List<Booking> getMyBookings() {
        User currentUser = userService.getCurrentlyAuthenticatedUser();
        return bookingService.getBookingsByUserId(currentUser.getId());
    }

    @GetMapping("/{id}")
    public Booking getBooking(@PathVariable String id) {
        return bookingService.getBookingById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Booking createBooking(@Valid @RequestBody BookingRequestDTO requestDTO) {
        return bookingService.createBooking(requestDTO);
    }

    @PutMapping("/{id}")
    public Booking updateBooking(@PathVariable String id, @Valid @RequestBody BookingRequestDTO requestDTO) {
        return bookingService.updateBooking(id, requestDTO);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBooking(@PathVariable String id) {
        bookingService.deleteBooking(id);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public Booking approveBooking(@PathVariable String id) {
        return bookingService.approveBooking(id);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public Booking rejectBooking(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String reason = payload.get("reason");
        return bookingService.rejectBooking(id, reason);
    }

    @PatchMapping("/{id}/cancel")
    public Booking cancelBooking(@PathVariable String id) {
        return bookingService.cancelBooking(id);
    }
}
