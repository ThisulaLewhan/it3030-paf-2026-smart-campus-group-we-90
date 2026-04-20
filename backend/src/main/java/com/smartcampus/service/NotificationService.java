package com.smartcampus.service;

import com.smartcampus.entity.Notification;
import com.smartcampus.repository.NotificationRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public Notification getNotificationById(String id) {
        return notificationRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));
    }

    public Notification createNotification(Notification notification) {
        LocalDateTime now = LocalDateTime.now();
        notification.setCreatedAt(now);
        notification.setUpdatedAt(now);
        return notificationRepository.save(notification);
    }

    public Notification updateNotification(String id, Notification updatedNotification) {
        Notification existingNotification = getNotificationById(id);
        existingNotification.setTitle(updatedNotification.getTitle());
        existingNotification.setMessage(updatedNotification.getMessage());
        existingNotification.setAudience(updatedNotification.getAudience());
        existingNotification.setChannel(updatedNotification.getChannel());
        existingNotification.setRead(updatedNotification.isRead());
        existingNotification.setUpdatedAt(LocalDateTime.now());
        return notificationRepository.save(existingNotification);
    }

    public void deleteNotification(String id) {
        notificationRepository.deleteById(id);
    }
}
