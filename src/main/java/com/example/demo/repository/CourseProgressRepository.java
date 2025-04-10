package com.example.demo.repository;

import com.example.demo.entity.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CourseProgressRepository extends JpaRepository<CourseProgress, Long> {
    Optional<CourseProgress> findByUserIdAndCourseId(Long userId, Long courseId);
    
    List<CourseProgress> findByUserId(Long userId);
    
    List<CourseProgress> findByCourseId(Long courseId);
}