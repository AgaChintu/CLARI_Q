
package com.clariq.backend.repository;

import java.util.List;
import com.clariq.backend.entity.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Long> {

    List<TeacherAssignment> findByClassEntity_Id(Long classId);

    List<TeacherAssignment> findByTeacher_Id(UUID teacherId);
}
