
package com.clariq.backend.repository;

import com.clariq.backend.entity.Doubt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DoubtRepository extends JpaRepository<Doubt, Long> {

    List<Doubt> findByStudentProfile_User_Id(UUID userId);

    List<Doubt> findByTeacherAssignment_Teacher_Id(UUID teacherId);

    List<Doubt> findByStatusAndPublishedToLibraryTrue(
            com.clariq.backend.entity.DoubtStatus status);

}
