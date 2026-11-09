
package com.clariq.backend.controller;

import com.clariq.backend.repository.StudentProfileRepository;
import com.clariq.backend.dto.DoubtSessionRequest;
import com.clariq.backend.entity.DoubtSession;
import com.clariq.backend.entity.StudentProfile;
import com.clariq.backend.entity.TeacherAssignment;
import com.clariq.backend.repository.DoubtSessionRepository;
import com.clariq.backend.repository.TeacherAssignmentRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

import com.clariq.backend.entity.Notification;
import com.clariq.backend.repository.NotificationRepository;

import java.util.List;

@RestController
@RequestMapping("/api/doubt-sessions")
public class DoubtSessionController {

    private final DoubtSessionRepository doubtSessionRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final NotificationRepository notificationRepository;

    public DoubtSessionController(
            DoubtSessionRepository doubtSessionRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            StudentProfileRepository studentProfileRepository, NotificationRepository notificationRepository) {
        this.doubtSessionRepository = doubtSessionRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.notificationRepository = notificationRepository;
    }

    @PostMapping
    public ResponseEntity<?> createSession(
            @RequestBody DoubtSessionRequest request,
            HttpServletRequest httpRequest) {

        HttpSession session = httpRequest.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in");
        }

        if (!"TEACHER".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only teachers can create sessions");
        }

        if (request.getTitle() == null || request.getTitle().isBlank()
                || request.getTeacherAssignmentId() == null
                || request.getScheduledAt() == null
                || request.getEndsAt() == null
                || !request.getEndsAt().isAfter(request.getScheduledAt())) {
            return ResponseEntity.badRequest()
                    .body("Valid title, assignment and session timings are required");
        }

        UUID teacherId = UUID.fromString(
                session.getAttribute("userId").toString());

        TeacherAssignment assignment = teacherAssignmentRepository
                .findById(request.getTeacherAssignmentId())
                .orElse(null);

        if (assignment == null
                || !assignment.getTeacher().getId().equals(teacherId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Invalid teacher assignment");
        }

        DoubtSession doubtSession = new DoubtSession();
        doubtSession.setTitle(request.getTitle().trim());
        doubtSession.setDescription(request.getDescription());
        doubtSession.setTeacherAssignment(assignment);
        doubtSession.setScheduledAt(request.getScheduledAt());
        doubtSession.setEndsAt(request.getEndsAt());

        DoubtSession saved = doubtSessionRepository.save(doubtSession);

        List<StudentProfile> students = studentProfileRepository
                .findByClassEntity_Id(assignment.getClassEntity().getId());

        for (StudentProfile student : students) {

            Notification notification = new Notification();

            notification.setRecipient(student.getUser());
            notification.setTitle("New doubt session scheduled");
            notification.setMessage(
                    "Your teacher has scheduled a doubt session: " + saved.getTitle());
            notification.setCategory("session");

            notificationRepository.save(notification);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "message", "Doubt session created successfully",
                        "sessionId", saved.getId(),
                        "title", saved.getTitle()));
    }

    @GetMapping("/teacher")
    public ResponseEntity<?> getTeacherSessions(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in");
        }

        if (!"TEACHER".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only teachers can access this");
        }

        UUID teacherId = UUID.fromString(
                session.getAttribute("userId").toString());

        return ResponseEntity.ok(
                doubtSessionRepository
                        .findByTeacherAssignment_Teacher_Id(teacherId)
                        .stream()
                        .map(this::toResponse)
                        .toList());
    }

    @GetMapping("/student")
    public ResponseEntity<?> getStudentSessions(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in");
        }

        if (!"STUDENT".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only students can access this");
        }

        UUID studentId = UUID.fromString(
                session.getAttribute("userId").toString());

        StudentProfile student = studentProfileRepository
                .findByUserId(studentId)
                .orElse(null);

        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student profile not found");
        }

        Long classId = student.getClassEntity().getId();

        return ResponseEntity.ok(
                doubtSessionRepository
                        .findByTeacherAssignment_ClassEntity_Id(classId)
                        .stream()
                        .map(this::toResponse)
                        .toList());
    }

    private DoubtSessionResponse toResponse(DoubtSession s) {
        return new DoubtSessionResponse(
                s.getId(),
                s.getTitle(),
                s.getDescription(),
                s.getScheduledAt(),
                s.getEndsAt(),
                s.getTeacherAssignment().getClassEntity().getClassName(),
                s.getTeacherAssignment().getSubject().getSubjectName(),
                s.getTeacherAssignment().getTeacher().getName());
    }

    private record DoubtSessionResponse(
            Long id,
            String title,
            String description,
            java.time.LocalDateTime scheduledAt,
            java.time.LocalDateTime endsAt,
            String className,
            String subjectName,
            String teacherName) {
    }

}
