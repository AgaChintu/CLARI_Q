
package com.clariq.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "doubts")
public class Doubt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    @ManyToOne
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @ManyToOne
    @JoinColumn(name = "teacher_assignment_id", nullable = false)
    private TeacherAssignment teacherAssignment;

    // Exam Support link (optional)
    @ManyToOne
    @JoinColumn(name = "exam_support_id")
    private ExamSupport examSupport;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DoubtStatus status = DoubtStatus.PENDING;

    @Column(nullable = false)
    private boolean publishedToLibrary = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public StudentProfile getStudentProfile() {
        return studentProfile;
    }

    public void setStudentProfile(StudentProfile studentProfile) {
        this.studentProfile = studentProfile;
    }

    public TeacherAssignment getTeacherAssignment() {
        return teacherAssignment;
    }

    public void setTeacherAssignment(TeacherAssignment teacherAssignment) {
        this.teacherAssignment = teacherAssignment;
    }

    public ExamSupport getExamSupport() {
        return examSupport;
    }

    public void setExamSupport(ExamSupport examSupport) {
        this.examSupport = examSupport;
    }

    public DoubtStatus getStatus() {
        return status;
    }

    public void setStatus(DoubtStatus status) {
        this.status = status;
    }

    public boolean isPublishedToLibrary() {
        return publishedToLibrary;
    }

    public void setPublishedToLibrary(boolean publishedToLibrary) {
        this.publishedToLibrary = publishedToLibrary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
