package com.project.back_end.repo;

import com.project.back_end.models.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    // Find an admin by username
    Optional<Admin> findByUsername(String username);

    // Find an admin by email (for token validation)
    Optional<Admin> findByEmail(String email);
}
