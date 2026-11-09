package com.clariq.backend.controller;

import com.clariq.backend.entity.Doubt;
import com.clariq.backend.entity.SavedDoubt;
import com.clariq.backend.entity.StudentProfile;
import com.clariq.backend.repository.DoubtRepository;
import com.clariq.backend.repository.SavedDoubtRepository;
import com.clariq.backend.repository.StudentProfileRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/saved-doubts")
public class SavedDoubtController {

    private final SavedDoubtRepository savedDoubtRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final DoubtRepository doubtRepository;

    public SavedDoubtController(
            SavedDoubtRepository savedDoubtRepository,
            StudentProfileRepository studentProfileRepository,
            DoubtRepository doubtRepository) {
        this.savedDoubtRepository = savedDoubtRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.doubtRepository = doubtRepository;
    }

    @PostMapping("/{doubtId}")
    public ResponseEntity<?> saveDoubt(
            @PathVariable Long doubtId,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in");
        }

        if (!"STUDENT".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only students can save doubts");
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

        Doubt doubt = doubtRepository.findById(doubtId)
                .orElse(null);

        if (doubt == null
                || doubt.getStatus() != com.clariq.backend.entity.DoubtStatus.RESOLVED
                || !doubt.isPublishedToLibrary()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Published Library doubt not found");
        }

        if (savedDoubtRepository
                .findByStudentProfile_User_IdAndDoubt_Id(userId, doubtId)
                .isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Doubt is already saved");
        }

        SavedDoubt savedDoubt = new SavedDoubt();
        savedDoubt.setStudentProfile(student);
        savedDoubt.setDoubt(doubt);

        savedDoubtRepository.save(savedDoubt);

        return ResponseEntity.ok(
                Map.of("message", "Doubt saved successfully",
                        "doubtId", doubtId));
    }

    @GetMapping
    public ResponseEntity<?> getSavedDoubts(HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in");
        }

        if (!"STUDENT".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only students can access saved doubts");
        }

        UUID userId = UUID.fromString(
                session.getAttribute("userId").toString());

        List<SavedDoubt> savedDoubts = savedDoubtRepository
                .findByStudentProfile_User_Id(userId);

        List<Map<String, Object>> result = savedDoubts.stream()
                .map(saved -> Map.<String, Object>of(
                        "doubtId", saved.getDoubt().getId(),
                        "title", saved.getDoubt().getTitle(),
                        "question", saved.getDoubt().getQuestion(),
                        "subject", saved.getDoubt().getTeacherAssignment()
                                .getSubject().getSubjectName(),
                        "teacherName", saved.getDoubt().getTeacherAssignment()
                                .getTeacher().getName(),
                        "savedAt", saved.getSavedAt().toString()))
                .toList();

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{doubtId}")
    public ResponseEntity<?> removeSavedDoubt(
            @PathVariable Long doubtId,
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Please log in");
        }

        if (!"STUDENT".equals(session.getAttribute("role"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only students can remove saved doubts");
        }

        UUID userId = UUID.fromString(
                session.getAttribute("userId").toString());

        var savedDoubt = savedDoubtRepository
                .findByStudentProfile_User_IdAndDoubt_Id(userId, doubtId);

        if (savedDoubt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Saved doubt not found");
        }

        savedDoubtRepository.delete(savedDoubt.get());

        return ResponseEntity.ok(
                Map.of("message", "Doubt removed from Saves",
                        "doubtId", doubtId));
    }
}