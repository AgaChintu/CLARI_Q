
package com.clariq.backend.repository;

import com.clariq.backend.entity.DoubtSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DoubtSessionRepository extends JpaRepository<DoubtSession, Long> {

    List<DoubtSession> findByTeacherAssignment_Teacher_Id(UUID teacherId);

    List<DoubtSession> findByTeacherAssignment_ClassEntity_Id(Long classId);
}
