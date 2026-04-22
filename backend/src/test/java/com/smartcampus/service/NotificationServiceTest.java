package com.smartcampus.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.smartcampus.entity.Notification;
import com.smartcampus.entity.NotificationType;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.exception.ForbiddenException;
import com.smartcampus.repository.NotificationRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    // Natively mocks the database so we aren't executing real SQL transactions
    @Mock
    private NotificationRepository notificationRepository;

    // Natively mocks the Security Context so we don't need real JWT tokens to run tests
    @Mock
    private AuthService authService;

    // Injects the fake mocks straight into a real instance of our NotificationService
    @InjectMocks
    private NotificationService notificationService;

    private User owner;
    private User attacker;
    private Notification notification;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId("user-1");
        owner.setEmail("owner@smartcampus.edu");
        owner.setName("Legitimate Owner");
        owner.setRole(Role.USER);

        attacker = new User();
        attacker.setId("user-99");
        attacker.setEmail("hacker@smartcampus.edu");
        attacker.setName("Malicious Attacker");
        attacker.setRole(Role.USER);

        notification = new Notification(owner, "System update incoming", NotificationType.INFO);
        notification.setId("notif-500"); // Synthetic ID
        notification.setRead(false);
    }

    @Test
    void testMarkAsRead_Success_WhenUserIsAbsoluteOwner() {
        // Arrange
        when(authService.getCurrentlyAuthenticatedUser()).thenReturn(owner);
        when(notificationRepository.findById("notif-500")).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        // Act
        Notification updatedNotif = notificationService.markAsRead("notif-500");

        // Assert
        assertTrue(updatedNotif.isRead(), "The backend flag should flip to true mathematically");
        verify(notificationRepository, times(1)).save(notification);
    }

    @Test
    void testMarkAsRead_ThrowsForbiddenException_WhenAttackerIntercepts() {
        // Arrange (The malicious user manages to extract an active JWT context)
        when(authService.getCurrentlyAuthenticatedUser()).thenReturn(attacker);
        
        // The attacker targets the owner's specific Database ID
        when(notificationRepository.findById("notif-500")).thenReturn(Optional.of(notification));

        // Act & Assert
        // We evaluate strictly what the NotificationService physically does here
        assertThrows(ForbiddenException.class, () -> {
            notificationService.markAsRead("notif-500");
        }, "Should aggressively throw ForbiddenException intercepting the non-owner");

        // Mathematical verification that the database save( ) command was completely starved and never clicked
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void testDeleteNotification_CruciallyChecksOwnershipBeforeDroppingData() {
        // Arrange
        when(authService.getCurrentlyAuthenticatedUser()).thenReturn(owner);
        when(notificationRepository.findById("notif-500")).thenReturn(Optional.of(notification));

        // Act
        notificationService.deleteNotification("notif-500");

        // Assert
        // Validate that because they owned it, the database physically received the deletion call
        verify(notificationRepository, times(1)).delete(notification);
    }
}
