package com.example.demo.repository;

import com.example.demo.entity.User;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    long countByCreatedAtBefore(LocalDateTime date);
    // Đã loại bỏ phương thức findByname/findByUsername
}