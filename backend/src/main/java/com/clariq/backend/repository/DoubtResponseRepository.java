
package com.clariq.backend.repository;

import com.clariq.backend.entity.DoubtResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoubtResponseRepository extends JpaRepository<DoubtResponse, Long> {

    List<DoubtResponse> findByDoubt_IdOrderByCreatedAtAsc(Long doubtId);

}
