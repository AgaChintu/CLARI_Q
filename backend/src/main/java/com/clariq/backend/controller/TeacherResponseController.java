
package com.clariq.backend.controller;

import com.clariq.backend.entity.Doubt;
import com.clariq.backend.entity.DoubtResponse;
import com.clariq.backend.entity.DoubtStatus;
import com.clariq.backend.repository.DoubtRepository;
import com.clariq.backend.repository.DoubtResponseRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

import com.clariq.backend.entity.Notification;
import com.clariq.backend.repository.NotificationRepository;

import com.clariq.backend.entity.StudentProfile;
import com.clariq.backend.repository.StudentProfileRepository;
import java.util.List;

@RestController
@RequestMapping("/api/doubts/teacher")
public class TeacherResponseController {

    private final DoubtRepository doubtRepository;
    private final DoubtResponseRepository doubtResponseRepository;
    private final NotificationRepository notificationRepository;
    private final StudentProfileRepository studentProfileRepository;

    public TeacherResponseController(
            DoubtRepository doubtRepository,
            DoubtResponseRepository doubtResponseRepository, NotificationRepository notificationRepository,
            StudentProfileRepository studentProfileRepository) {

        this.doubtRepository = doubtRepository;
        this.doubtResponseRepository = doubtResponseRepository;
        this.notificationRepository = notificationRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    @PostMapping("/{doubtId}/response")
    public ResponseEntity<?> respondToDoubt(
            @PathVariable Long doubtId,
            @RequestBody TeacherReplyRequest request,
            HttpServletRequest httpRequest) {

        HttpSession session = httpRequest.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in");
        }

        if (!"TEACHER".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only teachers can respond to doubts");
        }

        if (request.response() == null || request.response().isBlank()
                || request.status() == null || request.status().isBlank()) {
            return ResponseEntity.badRequest()
                    .body("Response and status are required");
        }

        UUID teacherId = UUID.fromString(
                session.getAttribute("userId").toString());

        Doubt doubt = doubtRepository.findById(doubtId).orElse(null);

        if (doubt == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Doubt not found");
        }

        if (!doubt.getTeacherAssignment().getTeacher()
                .getId().equals(teacherId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not assigned to this doubt");
        }

        DoubtStatus status;

        try {
            status = DoubtStatus.valueOf(
                    request.status().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Invalid status");
        }

        if (status == DoubtStatus.PENDING) {
            return ResponseEntity.badRequest()
                    .body("Status must be IN_PROGRESS or RESOLVED");
        }

        DoubtResponse reply = new DoubtResponse();
        reply.setDoubt(doubt);
        reply.setTeacher(doubt.getTeacherAssignment().getTeacher());
        reply.setResponse(request.response().trim());

        doubtResponseRepository.save(reply);

        doubt.setStatus(status);
        doubtRepository.save(doubt);

        Notification notification = new Notification();

        notification.setRecipient(doubt.getStudentProfile().getUser());
        notification.setTitle("Your doubt has been answered");
        notification.setMessage("Your teacher has responded to your doubt: " + doubt.getTitle());
        notification.setCategory("doubt");
        notification.setTargetUrl("/student-pages/doubt-details.html");

        notificationRepository.save(notification);

        return ResponseEntity.ok(
                Map.of(
                        "message", "Response submitted successfully",
                        "doubtId", doubt.getId(),
                        "status", doubt.getStatus().name()));
    }

    @PutMapping("/{doubtId}/publish")
    public ResponseEntity<?> updateLibraryPublication(
            @PathVariable Long doubtId,
            @RequestBody LibraryPublicationRequest request,
            HttpServletRequest httpRequest) {

        HttpSession session = httpRequest.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in");
        }

        if (!"TEACHER".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only teachers can manage Library publishing");
        }

        if (request.published() == null) {
            return ResponseEntity.badRequest()
                    .body("Publication status is required");
        }

        UUID teacherId = UUID.fromString(
                session.getAttribute("userId").toString());

        Doubt doubt = doubtRepository.findById(doubtId).orElse(null);

        if (doubt == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Doubt not found");
        }

        if (!doubt.getTeacherAssignment().getTeacher()
                .getId().equals(teacherId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not assigned to this doubt");
        }

        if (request.published() && doubt.getStatus() != DoubtStatus.RESOLVED) {
            return ResponseEntity.badRequest()
                    .body("Only resolved doubts can be published");
        }

        boolean newlyPublished = request.published() && !doubt.isPublishedToLibrary();

        doubt.setPublishedToLibrary(request.published());
        doubtRepository.save(doubt);

        if (newlyPublished) {

            List<StudentProfile> students = studentProfileRepository
                    .findByClassEntity_Id(doubt.getTeacherAssignment().getClassEntity().getId());

            for (StudentProfile student : students) {

                Notification notification = new Notification();

                notification.setRecipient(student.getUser());
                notification.setTitle("New Library resource available");
                notification.setMessage(
                        "A new resolved doubt has been published to your Library: " + doubt.getTitle());
                notification.setCategory("resource");

                notificationRepository.save(notification);
            }
        }

        return ResponseEntity.ok(
                Map.of(
                        "message", request.published()
                                ? "Doubt published to Library successfully"
                                : "Doubt unpublished successfully",
                        "doubtId", doubt.getId(),
                        "publishedToLibrary", doubt.isPublishedToLibrary()));
    }

    private record TeacherReplyRequest(
            String response,
            String status) {
    }

    private record LibraryPublicationRequest(
            Boolean published) {
    }
}
