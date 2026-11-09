
package com.clariq.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clariq.backend.entity.Notification;
import com.clariq.backend.repository.NotificationRepository;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    private UUID getStudentId(HttpSession session) {
        if (session.getAttribute("userId") == null ||
                !"STUDENT".equals(session.getAttribute("role"))) {
            return null;
        }
        return UUID.fromString((String) session.getAttribute("userId"));
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(HttpSession session) {
        UUID studentId = getStudentId(session);

        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only logged-in students can view notifications"));
        }

        List<NotificationResponse> notifications = notificationRepository
                .findByRecipient_IdOrderByCreatedAtDesc(studentId)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(HttpSession session) {
        UUID studentId = getStudentId(session);

        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only logged-in students can view notifications"));
        }

        long count = notificationRepository.countByRecipient_IdAndIsReadFalse(studentId);

        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id, HttpSession session) {

        UUID studentId = getStudentId(session);

        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only logged-in students can update notifications"));
        }

        Notification notification = notificationRepository.findById(id).orElse(null);

        if (notification == null ||
                !notification.getRecipient().getId().equals(studentId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Notification not found"));
        }

        notification.setRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(HttpSession session) {
        UUID studentId = getStudentId(session);

        if (studentId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only logged-in students can update notifications"));
        }

        List<Notification> notifications = notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(studentId);

        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);

        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getCategory(),
                notification.getTargetUrl(),
                notification.isRead(),
                notification.getCreatedAt());
    }

    private record NotificationResponse(
            Long id,
            String title,
            String message,
            String category,
            String targetUrl,
            boolean isRead,
            java.time.LocalDateTime createdAt) {
    }
}
