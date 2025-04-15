package com.example.demo.repository;

import com.example.demo.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findTop3ByOrderByIdDesc();
    
    List<Course> findByCategoryId(Long categoryId);
    
    // Thêm phương thức này để giải quyết lỗi
    List<Course> findByFeatured(boolean featured);
    
    long countByCreatedAtBefore(LocalDateTime date);
    
    @Query("SELECT c.category.name as categoryName, COUNT(c) as courseCount FROM Course c GROUP BY c.category.name")
    Map<String, Long> countCoursesByCategory();
    // Phương thức tìm khóa học nổi bật
    List<Course> findByFeaturedTrue();
    
    
    
}