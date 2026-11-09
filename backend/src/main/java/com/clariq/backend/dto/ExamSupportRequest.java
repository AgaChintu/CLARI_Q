
package com.clariq.backend.dto;

import java.time.LocalDateTime;

public class ExamSupportRequest {

    private Long teacherAssignmentId;
    private String examType;
    private LocalDateTime submissionDeadline;
    private LocalDateTime sessionStart;
    private LocalDateTime sessionEnd;

    public Long getTeacherAssignmentId() {
        return teacherAssignmentId;
    }

    public void setTeacherAssignmentId(Long teacherAssignmentId) {
        this.teacherAssignmentId = teacherAssignmentId;
    }

    public String getExamType() {
        return examType;
    }

    public void setExamType(String examType) {
        this.examType = examType;
    }

    public LocalDateTime getSubmissionDeadline() {
        return submissionDeadline;
    }

    public void setSubmissionDeadline(LocalDateTime submissionDeadline) {
        this.submissionDeadline = submissionDeadline;
    }

    public LocalDateTime getSessionStart() {
        return sessionStart;
    }

    public void setSessionStart(LocalDateTime sessionStart) {
        this.sessionStart = sessionStart;
    }

    public LocalDateTime getSessionEnd() {
        return sessionEnd;
    }

    public void setSessionEnd(LocalDateTime sessionEnd) {
        this.sessionEnd = sessionEnd;
    }
}
