
package com.clariq.backend.controller;

import com.clariq.backend.dto.ExamSupportRequest;
import com.clariq.backend.entity.ExamSupport;
import com.clariq.backend.entity.TeacherAssignment;
import com.clariq.backend.repository.ExamSupportRepository;
import com.clariq.backend.repository.TeacherAssignmentRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

import com.clariq.backend.entity.StudentProfile;
import com.clariq.backend.repository.StudentProfileRepository;

@RestController
@RequestMapping("/api/exam-support")
public class ExamSupportController {

    private final ExamSupportRepository examSupportRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final StudentProfileRepository studentProfileRepository;

    public ExamSupportController(
            ExamSupportRepository examSupportRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            StudentProfileRepository studentProfileRepository) {
        this.examSupportRepository = examSupportRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    @PostMapping
    public ResponseEntity<?> createExamSupport(
            @RequestBody ExamSupportRequest request,
            HttpServletRequest httpRequest) {

        HttpSession session = httpRequest.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please log in");
        }

        if (!"TEACHER".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only teachers can create Exam Support");
        }

        if (request.getTeacherAssignmentId() == null
                || request.getExamType() == null || request.getExamType().isBlank()
                || request.getSubmissionDeadline() == null
                || request.getSessionStart() == null
                || request.getSessionEnd() == null
                || !request.getSessionEnd().isAfter(request.getSessionStart())
                || !request.getSessionStart().isAfter(request.getSubmissionDeadline())) {
            return ResponseEntity.badRequest()
                    .body("Valid exam details and timings are required");
        }

        UUID teacherId = UUID.fromString(session.getAttribute("userId").toString());

        TeacherAssignment assignment = teacherAssignmentRepository
                .findById(request.getTeacherAssignmentId())
                .orElse(null);

        if (assignment == null || !assignment.getTeacher().getId().equals(teacherId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Invalid teacher assignment");
        }

        ExamSupport exam = new ExamSupport();
        exam.setTeacherAssignment(assignment);
        exam.setExamType(request.getExamType().trim());
        exam.setSubmissionDeadline(request.getSubmissionDeadline());
        exam.setSessionStart(request.getSessionStart());
        exam.setSessionEnd(request.getSessionEnd());
        exam.setActive(true);

        ExamSupport saved = examSupportRepository.save(exam);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of("message", "Exam Support created successfully", "examSupportId", saved.getId()));
    }

    @GetMapping("/teacher")
    public ResponseEntity<?> getTeacherExamSupport(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please log in");
        }

        if (!"TEACHER".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only teachers can access this");
        }

        UUID teacherId = UUID.fromString(session.getAttribute("userId").toString());

        return ResponseEntity.ok(
                examSupportRepository.findByTeacherAssignment_Teacher_Id(teacherId)
                        .stream().map(this::toResponse).toList());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExamSupport(
            @PathVariable Long id,
            @RequestBody ExamSupportRequest request,
            HttpServletRequest httpRequest) {

        HttpSession session = httpRequest.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please log in");
        }

        if (!"TEACHER".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only teachers can edit this");
        }

        UUID teacherId = UUID.fromString(session.getAttribute("userId").toString());

        ExamSupport exam = examSupportRepository.findById(id).orElse(null);

        if (exam == null) {
            return ResponseEntity.notFound().build();
        }

        if (!exam.getTeacherAssignment().getTeacher().getId().equals(teacherId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You cannot edit this entry");
        }

        if (request.getExamType() == null || request.getExamType().isBlank()
                || request.getSubmissionDeadline() == null
                || request.getSessionStart() == null
                || request.getSessionEnd() == null
                || !request.getSessionEnd().isAfter(request.getSessionStart())
                || !request.getSessionStart().isAfter(request.getSubmissionDeadline())) {
            return ResponseEntity.badRequest().body("Valid exam details and timings are required");
        }

        exam.setExamType(request.getExamType().trim());
        exam.setSubmissionDeadline(request.getSubmissionDeadline());
        exam.setSessionStart(request.getSessionStart());
        exam.setSessionEnd(request.getSessionEnd());

        examSupportRepository.save(exam);

        return ResponseEntity.ok(Map.of("message", "Exam Support updated successfully"));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<?> closeExamSupport(
            @PathVariable Long id,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please log in");
        }

        if (!"TEACHER".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only teachers can close this");
        }

        UUID teacherId = UUID.fromString(session.getAttribute("userId").toString());

        ExamSupport exam = examSupportRepository.findById(id).orElse(null);

        if (exam == null) {
            return ResponseEntity.notFound().build();
        }

        if (!exam.getTeacherAssignment().getTeacher().getId().equals(teacherId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You cannot close this entry");
        }

        exam.setActive(false);
        examSupportRepository.save(exam);

        return ResponseEntity.ok(Map.of("message", "Exam Support closed successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExamSupport(
            @PathVariable Long id,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please log in");
        }

        if (!"TEACHER".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only teachers can delete this");
        }

        UUID teacherId = UUID.fromString(session.getAttribute("userId").toString());

        ExamSupport exam = examSupportRepository.findById(id).orElse(null);

        if (exam == null) {
            return ResponseEntity.notFound().build();
        }

        if (!exam.getTeacherAssignment().getTeacher().getId().equals(teacherId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You cannot delete this entry");
        }

        examSupportRepository.delete(exam);

        return ResponseEntity.ok(Map.of("message", "Exam Support deleted successfully"));
    }

    @GetMapping("/student")
    public ResponseEntity<?> getStudentExamSupport(HttpServletRequest request) {

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
                examSupportRepository
                        .findByTeacherAssignment_ClassEntity_IdAndActiveTrue(classId)
                        .stream()
                        .map(this::toResponse)
                        .toList());
    }

    private Map<String, Object> toResponse(ExamSupport exam) {
        return Map.of(
                "id", exam.getId(),
                "examType", exam.getExamType(),
                "submissionDeadline", exam.getSubmissionDeadline(),
                "sessionStart", exam.getSessionStart(),
                "sessionEnd", exam.getSessionEnd(),
                "active", exam.isActive(),
                "className", exam.getTeacherAssignment().getClassEntity().getClassName(),
                "subjectName", exam.getTeacherAssignment().getSubject().getSubjectName());
    }
}
