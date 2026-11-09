package com.clariq.backend.controller;

import com.clariq.backend.entity.Doubt;
import com.clariq.backend.repository.DoubtRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/doubts/teacher")
public class TeacherDoubtsController {

    private final DoubtRepository doubtRepository;

    public TeacherDoubtsController(DoubtRepository doubtRepository) {
        this.doubtRepository = doubtRepository;
    }

    @GetMapping("/inbox")
    public ResponseEntity<?> getTeacherInbox(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in");
        }

        if (!"TEACHER".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only teachers can access the doubt inbox");
        }

        UUID teacherId = UUID.fromString(
                session.getAttribute("userId").toString());

        List<Doubt> doubts = doubtRepository.findByTeacherAssignment_Teacher_Id(teacherId);

        List<Map<String, Object>> result = doubts.stream()
                .map(doubt -> Map.<String, Object>of(
                        "doubtId", doubt.getId(),
                        "title", doubt.getTitle(),
                        "question", doubt.getQuestion(),
                        "subject", doubt.getTeacherAssignment()
                                .getSubject().getSubjectName(),
                        "status", doubt.getStatus().name(),
                        "createdAt", doubt.getCreatedAt().toString()))
                .toList();

        return ResponseEntity.ok(result);
    }
}