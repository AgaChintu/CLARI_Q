package com.clariq.backend.repository;

import com.clariq.backend.entity.SavedDoubt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavedDoubtRepository extends JpaRepository<SavedDoubt, Long> {

    List<SavedDoubt> findByStudentProfile_User_Id(UUID userId);

    Optional<SavedDoubt> findByStudentProfile_User_IdAndDoubt_Id(
            UUID userId,
            Long doubtId);

    void deleteByStudentProfile_User_IdAndDoubt_Id(
            UUID userId,
            Long doubtId);
}