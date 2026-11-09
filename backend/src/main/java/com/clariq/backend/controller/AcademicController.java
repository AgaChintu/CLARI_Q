package com.clariq.backend.controller;

import com.clariq.backend.entity.StudentProfile;
import com.clariq.backend.entity.TeacherAssignment;
import com.clariq.backend.repository.StudentProfileRepository;
import com.clariq.backend.repository.TeacherAssignmentRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/academic")
public class AcademicController {

    private final StudentProfileRepository studentProfileRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

    public AcademicController(
            StudentProfileRepository studentProfileRepository,
            TeacherAssignmentRepository teacherAssignmentRepository) {

        this.studentProfileRepository = studentProfileRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
    }

    @GetMapping("/subjects")
    public ResponseEntity<?> getStudentSubjects(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in");
        }

        if (!"STUDENT".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only students can access this information");
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

        List<TeacherAssignment> assignments = teacherAssignmentRepository.findByClassEntity_Id(
                student.getClassEntity().getId());

        List<Map<String, Object>> result = assignments.stream()
                .map(assignment -> Map.<String, Object>of(
                        "assignmentId", assignment.getId(),
                        "subjectId", assignment.getSubject().getId(),
                        "subjectName", assignment.getSubject().getSubjectName(),
                        "teacherName", assignment.getTeacher().getName()))
                .toList();

        return ResponseEntity.ok(result);
    }
}