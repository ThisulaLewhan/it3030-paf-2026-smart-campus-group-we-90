package com.smartcampus.dto;

import java.time.LocalDateTime;

// DTO for sending/receiving Notification data
public class NotificationDto {

    private String id;
    private String title;
    private String message;
    private String audience;
    private String channel;
    private boolean read;
    private LocalDateTime createdAt;

    public NotificationDto() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getAudience() { return audience; }
    public void setAudience(String audience) { this.audience = audience; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
