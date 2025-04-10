package com.example.demo.repository;

import com.example.demo.entity.Course;
import com.example.demo.entity.User;
import com.example.demo.entity.UserCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserCourseRepository extends JpaRepository<UserCourse, Long> {
    List<UserCourse> findByUser(User user);
    
    // Phương thức truy vấn để kiểm tra người dùng đã đăng ký khóa học hay chưa
    boolean existsByUserAndCourse(User user, Course course);
    
    @Modifying
    @Query("DELETE FROM UserCourse uc WHERE uc.course.id = :courseId")
    void deleteAllByCourseId(@Param("courseId") Long courseId);
}