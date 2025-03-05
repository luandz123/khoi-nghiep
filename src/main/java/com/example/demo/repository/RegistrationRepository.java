package com.example.demo.repository;

import com.example.demo.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    boolean existsByUser_IdAndCourse_Id(Long userId, Long courseId);
    List<Registration> findByUser_Id(Long userId);
    Optional<Registration> findByUser_IdAndCourse_Id(Long userId, Long courseId);
}