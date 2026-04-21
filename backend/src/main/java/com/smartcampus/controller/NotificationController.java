package com.smartcampus.controller;

import com.smartcampus.dto.NotificationDto;
import com.smartcampus.entity.Notification;
import com.smartcampus.service.NotificationService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Instantly fetches the chronological feed for the logged-in user.
     */
    @GetMapping
    public ResponseEntity<List<NotificationDto>> getMyNotifications() {
        // All ownership validations are executed inside the service layer
        List<Notification> notifications = notificationService.getMyNotifications();
        
        // Map native JPA Entities purely to DTOs to avoid leaking nested User objects
        List<NotificationDto> dtos = notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(dtos);
    }

    /**
     * Flips a specific notification flag to true.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            Notification notification = notificationService.markAsRead(id);
            return ResponseEntity.ok(convertToDto(notification));
            
        } catch (IllegalArgumentException ex) {
            // Fired if the DB lookup by ID yields null
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (SecurityException ex) {
            // Fired if they attempt to edit an ID they do not truly own
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (Exception ex) {
            // General hard-fault interceptor 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Completely eradicates a notification from the DB.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            // Returns a crystal clean 204 No Content for standard REST adherence
            return ResponseEntity.noContent().build();
            
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Manual DTO mapping utility isolating the database from the presentation JSON stream
     */
    private NotificationDto convertToDto(Notification notif) {
        return new NotificationDto(
                notif.getId(),
                notif.getMessage(),
                notif.getType(),
                notif.isRead(),
                notif.getCreatedAt()
        );
    }
}
