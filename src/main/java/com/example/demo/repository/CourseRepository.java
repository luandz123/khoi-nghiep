package com.example.demo.repository;

import com.example.demo.entity.Category;
import com.example.demo.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    long countByCreatedAtBefore(LocalDateTime date);
    List<Course> findByCategory(Category category);
    
    
    // Hoặc nếu bạn lưu categoryId trực tiếp trong entity Course (là Long), dùng:
    List<Course> findByCategoryId(Long categoryId);
    
    // Nếu chưa có, bạn có thể sử dụng cách tìm theo nested property:
    List<Course> findByCategory_Id(Long categoryId);
}