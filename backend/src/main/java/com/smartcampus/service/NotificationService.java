package com.smartcampus.service;

import com.smartcampus.entity.Notification;
import com.smartcampus.entity.NotificationType;
import com.smartcampus.entity.User;
import com.smartcampus.repository.NotificationRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AuthService authService;

    public NotificationService(NotificationRepository notificationRepository, AuthService authService) {
        this.notificationRepository = notificationRepository;
        this.authService = authService;
    }

    /**
     * Internal utility for the system (or admins) to blast a notification to a specific user.
     */
    public Notification createNotification(User targetUser, String message, NotificationType type) {
        Notification notification = new Notification(targetUser, message, type);
        return notificationRepository.save(notification);
    }

    /**
     * Gets all notifications actively targeting the currently logged-in user,
     * ordered seamlessly by the newest first utilizing our JPA method.
     */
    public List<Notification> getMyNotifications() {
        User currentUser = authService.getCurrentlyAuthenticatedUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
    }

    /**
     * Sets a specific notification as 'read'.
     * Validates that the notification actually belongs to the person trying to read it.
     */
    public Notification markAsRead(String notificationId) {
        User currentUser = authService.getCurrentlyAuthenticatedUser();
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new com.smartcampus.exception.ResourceNotFoundException("Notification not found with ID: " + notificationId));

        validateOwnership(currentUser, notification);

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public List<Notification> markAllAsRead() {
        User currentUser = authService.getCurrentlyAuthenticatedUser();
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        List<Notification> updatedNotifications = new ArrayList<>();

        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                notification.setRead(true);
                updatedNotifications.add(notificationRepository.save(notification));
            }
        }

        return updatedNotifications;
    }

    /**
     * Deletes a specific notification entirely.
     * Hard-checks ownership at the service layer to prevent malicious cross-account deletions.
     */
    public void deleteNotification(String notificationId) {
        User currentUser = authService.getCurrentlyAuthenticatedUser();
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new com.smartcampus.exception.ResourceNotFoundException("Notification not found with ID: " + notificationId));

        validateOwnership(currentUser, notification);

        notificationRepository.delete(notification);
    }

    /**
     * Helper for Booking Module: Notifies a user when their resource booking status changes.
     */
    public void notifyBookingStatusChange(User targetUser, String resourceName, String newStatus) {
        String message = String.format("Your booking for '%s' is now %s.", resourceName, newStatus.toUpperCase());
        
        // Use BOOKING type for all booking-related notifications
        createNotification(targetUser, message, NotificationType.BOOKING);
    }

    /**
     * Helper for Ticket Module: Alerts a user heavily when a support or IT ticket shifts states.
     */
    public void notifyTicketStatusUpdate(User targetUser, String ticketId, String status) {
        String message = String.format("Update on Ticket #%s: Status is now %s.", ticketId, status);
        
        // Use TICKET type for ticket status updates
        createNotification(targetUser, message, NotificationType.TICKET);
    }

    /**
     * Helper for Ticket Comment Module: Dispatches an info ping when someone leaves a comment.
     */
    public void notifyNewComment(User targetUser, String commenterName, String threadTitle) {
        String message = String.format("%s commented on your ticket '%s'.", commenterName, threadTitle);
        
        createNotification(targetUser, message, NotificationType.TICKET);
    }

    /**
     * Dedicated private helper to enforce rigid ownership constraints.
     */
    private void validateOwnership(User currentUser, Notification notification) {
        // Compare IDs mathematically to avoid deep-object memory mismatch issues
        if (!notification.getUserId().equals(currentUser.getId())) {
            throw new com.smartcampus.exception.ForbiddenException("Forbidden: You do not own this notification.");
        }
    }
}
