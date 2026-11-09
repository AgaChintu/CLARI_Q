
package com.clariq.backend.repository;

import com.clariq.backend.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUserId(UUID userId);

    List<StudentProfile> findByClassEntity_Id(Long classId);
}
