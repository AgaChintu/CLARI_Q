
package com.clariq.backend.controller;

import com.clariq.backend.entity.Doubt;
import com.clariq.backend.entity.DoubtStatus;
import com.clariq.backend.entity.ExamSupport;
import com.clariq.backend.entity.StudentProfile;
import com.clariq.backend.entity.TeacherAssignment;
import com.clariq.backend.repository.DoubtRepository;
import com.clariq.backend.repository.ExamSupportRepository;
import com.clariq.backend.repository.StudentProfileRepository;
import com.clariq.backend.repository.TeacherAssignmentRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/doubts")
public class DoubtController {

    private final DoubtRepository doubtRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final ExamSupportRepository examSupportRepository;

    public DoubtController(
            DoubtRepository doubtRepository,
            StudentProfileRepository studentProfileRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            ExamSupportRepository examSupportRepository) {

        this.doubtRepository = doubtRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.examSupportRepository = examSupportRepository;
    }

    @PostMapping
    public ResponseEntity<?> submitDoubt(
            @RequestBody SubmitDoubtRequest request,
            HttpServletRequest httpRequest) {

        HttpSession session = httpRequest.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in");
        }

        if (!"STUDENT".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only students can submit doubts");
        }

        if (request.title() == null || request.title().isBlank()
                || request.question() == null || request.question().isBlank()
                || request.assignmentId() == null) {
            return ResponseEntity.badRequest()
                    .body("Title, question and teacher assignment are required");
        }

        UUID userId = UUID.fromString(
                session.getAttribute("userId").toString());

        StudentProfile student = studentProfileRepository
                .findByUserId(userId)
                .orElse(null);

        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student profile not found");
        }

        TeacherAssignment assignment = teacherAssignmentRepository
                .findById(request.assignmentId())
                .orElse(null);

        if (assignment == null
                || !assignment.getClassEntity().getId()
                        .equals(student.getClassEntity().getId())) {
            return ResponseEntity.badRequest()
                    .body("Invalid teacher assignment");
        }

        ExamSupport examSupport = null;

        if (request.examSupportId() != null) {

            examSupport = examSupportRepository
                    .findById(request.examSupportId())
                    .orElse(null);

            if (examSupport == null || !examSupport.isActive()) {
                return ResponseEntity.badRequest()
                        .body("Exam Support is not available");
            }

            if (!examSupport.getTeacherAssignment().getId()
                    .equals(assignment.getId())) {
                return ResponseEntity.badRequest()
                        .body("Exam Support does not match the teacher assignment");
            }

            if (!LocalDateTime.now().isBefore(
                    examSupport.getSubmissionDeadline())) {
                return ResponseEntity.badRequest()
                        .body("Exam doubt submission deadline has passed");
            }
        }

        Doubt doubt = new Doubt();
        doubt.setTitle(request.title().trim());
        doubt.setQuestion(request.question().trim());
        doubt.setStudentProfile(student);
        doubt.setTeacherAssignment(assignment);
        doubt.setExamSupport(examSupport);
        doubt.setStatus(DoubtStatus.PENDING);

        Doubt savedDoubt = doubtRepository.save(doubt);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "message", "Doubt submitted successfully",
                        "doubtId", savedDoubt.getId(),
                        "status", savedDoubt.getStatus().name()));
    }

    private record SubmitDoubtRequest(
            String title,
            String question,
            Long assignmentId,
            Long examSupportId) {
    }
}
