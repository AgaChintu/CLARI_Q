
package com.clariq.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clariq.backend.entity.ExamSupport;

public interface ExamSupportRepository extends JpaRepository<ExamSupport, Long> {

    List<ExamSupport> findByTeacherAssignment_Teacher_Id(java.util.UUID teacherId);

    List<ExamSupport> findByTeacherAssignment_ClassEntity_IdAndActiveTrue(Long classId);

}
