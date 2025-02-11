package com.example.demo.repository;

import com.example.demo.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    boolean existsByUserIdAndCourseId(Long userId, Long courseId);
}