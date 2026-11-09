package com.clariq.backend.repository;

import com.clariq.backend.entity.UserRole;
import java.util.Optional;
import com.clariq.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByLoginIdAndRole(String loginId, UserRole role);

}
