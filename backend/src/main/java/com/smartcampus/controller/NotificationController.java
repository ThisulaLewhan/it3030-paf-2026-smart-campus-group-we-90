package com.smartcampus.controller;

import com.smartcampus.dto.NotificationDto;
import com.smartcampus.entity.Notification;
import com.smartcampus.service.NotificationService;
import java.util.List;
import java.util.stream.Collectors;
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

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long id) {
        // Invalid IDs or Ownership conflicts are trapped by GlobalExceptionHandler seamlessly
        Notification notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(convertToDto(notification));
    }

    @PutMapping("/read-all")
    public ResponseEntity<List<NotificationDto>> markAllAsRead() {
        List<NotificationDto> dtos = notificationService.markAllAsRead().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
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
