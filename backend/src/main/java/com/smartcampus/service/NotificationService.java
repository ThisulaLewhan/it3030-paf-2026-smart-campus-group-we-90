package com.smartcampus.service;

import com.smartcampus.entity.Notification;
import com.smartcampus.entity.NotificationType;
import com.smartcampus.entity.User;
import com.smartcampus.repository.NotificationRepository;
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
        // createdAt is automatically handled by @PrePersist in the entity!
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
    public Notification markAsRead(Long notificationId) {
        User currentUser = authService.getCurrentlyAuthenticatedUser();
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        validateOwnership(currentUser, notification);

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    /**
     * Deletes a specific notification entirely.
     * Hard-checks ownership at the service layer to prevent malicious cross-account deletions.
     */
    public void deleteNotification(Long notificationId) {
        User currentUser = authService.getCurrentlyAuthenticatedUser();
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        validateOwnership(currentUser, notification);

        notificationRepository.delete(notification);
    }

    /**
     * Dedicated private helper to enforce rigid ownership constraints.
     */
    private void validateOwnership(User currentUser, Notification notification) {
        // Compare IDs mathematically to avoid deep-object memory mismatch issues
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new SecurityException("Forbidden: You do not own this notification.");
        }
    }
}
