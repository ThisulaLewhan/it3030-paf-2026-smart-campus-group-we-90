# Notification Module Integration Guide

This guide outlines exactly how other backend micro-features (Bookings, Tickets, Forums) should interact with the Notification module cleanly.

## 1. Backend Service Integrations

Do **not** attempt to manually instantiate or save `Notification` entities inside your own modules! Instead, just natively autowire the `NotificationService` into your service layer and leverage our formatted helper functions:

### Booking Status Updates
> [!TIP]
> Dynamically triggers `INFO` or `WARNING` CSS states on the React frontend based on the exact status string you provide!

```java
@Autowired
private NotificationService notificationService;

// Executed whenever you update a booking state:
notificationService.notifyBookingStatusChange(targetUserEntity, "Main Gym Hall", "APPROVED");
```

### IT/Support Ticket Updates
> [!IMPORTANT]
> Permanently mapped to `ALERT` severity ensuring massive visible priority across the UI.

```java
notificationService.notifyTicketStatusUpdate(targetUserEntity, "TCK-990", "IN PROGRESS");
```

### Social / Forums
```java
notificationService.notifyNewComment(targetUserEntity, "John Doe", "How to fix the Campus Wifi?");
```

---

## 2. Available React Endpoints

The React layer is pre-configured and heavily armed with `Axios` interceptors. You do **not** need to manually attach JWT Headers to intercept the notification feed. Simply call the custom service anywhere you require it:

- `await notificationService.getMyNotifications()`
- `await notificationService.markAsRead(notificationId)`
- `await notificationService.deleteNotification(notificationId)`

---

## 3. Mandatory Security Sandbox

> [!CAUTION]
> The Notification API Controller (`/api/notifications/**`) maintains rigorous active ownership evaluations. Do not attempt to bypass them.

### Expected Fallbacks
1. **Targeting Verification:** Users physically cannot query someone else's array mapping. The `GET` layout natively extracts the executor ID straight from the active JWT logic, preventing URL-tampering.
2. **Access Denials:** If malicious clients attempt to execute a generic REST `PUT /read` or `DELETE` command targeting a database ID they do not truly own, the controller is wired to intercept it structurally, forcing a hard `403 Forbidden` response instantly.
