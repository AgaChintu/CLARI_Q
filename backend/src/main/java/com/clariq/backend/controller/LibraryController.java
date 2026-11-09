package com.clariq.backend.controller;

import com.clariq.backend.entity.Doubt;
import com.clariq.backend.entity.DoubtStatus;
import com.clariq.backend.repository.DoubtRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final DoubtRepository doubtRepository;

    public LibraryController(DoubtRepository doubtRepository) {
        this.doubtRepository = doubtRepository;
    }

    @GetMapping
    public ResponseEntity<?> getLibrary(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in");
        }

        if (!"STUDENT".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only students can access the Library");
        }

        List<Doubt> doubts = doubtRepository
                .findByStatusAndPublishedToLibraryTrue(DoubtStatus.RESOLVED);

        List<Map<String, Object>> result = doubts.stream()
                .map(doubt -> Map.<String, Object>of(
                        "doubtId", doubt.getId(),
                        "title", doubt.getTitle(),
                        "question", doubt.getQuestion(),
                        "subject", doubt.getTeacherAssignment()
                                .getSubject().getSubjectName(),
                        "teacherName", doubt.getTeacherAssignment()
                                .getTeacher().getName(),
                        "createdAt", doubt.getCreatedAt().toString()))
                .toList();

        return ResponseEntity.ok(result);
    }
}