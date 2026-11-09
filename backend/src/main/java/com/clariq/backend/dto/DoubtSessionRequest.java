
package com.clariq.backend.dto;

import java.time.LocalDateTime;

public class DoubtSessionRequest {

    private Long teacherAssignmentId;
    private String title;
    private String description;
    private LocalDateTime scheduledAt;
    private LocalDateTime endsAt;

    public Long getTeacherAssignmentId() {
        return teacherAssignmentId;
    }

    public void setTeacherAssignmentId(Long teacherAssignmentId) {
        this.teacherAssignmentId = teacherAssignmentId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public LocalDateTime getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(LocalDateTime endsAt) {
        this.endsAt = endsAt;
    }
}
