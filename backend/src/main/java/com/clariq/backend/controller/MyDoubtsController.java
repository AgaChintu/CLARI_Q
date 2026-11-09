package com.clariq.backend.controller;

import com.clariq.backend.repository.DoubtResponseRepository;
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
@RequestMapping("/api/doubts")
public class MyDoubtsController {

    private final DoubtRepository doubtRepository;
    private final DoubtResponseRepository doubtResponseRepository;

    public MyDoubtsController(
            DoubtRepository doubtRepository,
            DoubtResponseRepository doubtResponseRepository) {
        this.doubtRepository = doubtRepository;
        this.doubtResponseRepository = doubtResponseRepository;
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyDoubts(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in");
        }

        if (!"STUDENT".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only students can view their doubts");
        }

        UUID userId = UUID.fromString(
                session.getAttribute("userId").toString());

        List<Doubt> doubts = doubtRepository.findByStudentProfile_User_Id(userId);

        List<Map<String, Object>> result = doubts.stream()
                .map(doubt -> Map.<String, Object>of(
                        "doubtId", doubt.getId(),
                        "title", doubt.getTitle(),
                        "question", doubt.getQuestion(),
                        "subject", doubt.getTeacherAssignment()
                                .getSubject().getSubjectName(),
                        "teacherName", doubt.getTeacherAssignment()
                                .getTeacher().getName(),
                        "status", doubt.getStatus().name(),
                        "createdAt", doubt.getCreatedAt().toString(),
                        "responses", doubtResponseRepository
                                .findByDoubt_IdOrderByCreatedAtAsc(doubt.getId())
                                .stream()
                                .map(reply -> Map.of(
                                        "response", reply.getResponse(),
                                        "createdAt", reply.getCreatedAt().toString()))
                                .toList()))
                .toList();

        return ResponseEntity.ok(result);
    }
}