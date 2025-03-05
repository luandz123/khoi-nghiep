package com.example.demo.service;

import com.example.demo.entity.Course;
import com.example.demo.entity.User;
import com.example.demo.entity.UserCourse;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.UserCourseRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserCourseRepository userCourseRepository;
    private final UserRepository userRepository; // repository cho user

    public CourseService(CourseRepository courseRepository, 
                         UserCourseRepository userCourseRepository,
                         UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userCourseRepository = userCourseRepository;
        this.userRepository = userRepository;
    }
    
    // Phương thức lấy tất cả khóa học
    public List<Course> getAllCourses() {
         return courseRepository.findAll();
    }
    
    // Lấy khóa học theo danh mục
    public List<Course> getCoursesByCategory(Long categoryId) {
         // ... (viết code lấy khóa học theo danh mục)
         return courseRepository.findByCategoryId(categoryId);  // ví dụ
    }
    
    // Ghi nhận khóa học của user
    public void enrollCourse(String email, Long courseId) {
        // Sử dụng findByEmail thay vì findByName
        User user = userRepository.findByEmail(email)
                      .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
                      .orElseThrow(() -> new RuntimeException("Course not found"));
        UserCourse userCourse = new UserCourse();
        userCourse.setUser(user);
        userCourse.setCourse(course);
        userCourseRepository.save(userCourse);
    }
    
    // Lấy danh sách khóa học của user
    public List<Course> getMyCourses(String email) {
        User user = userRepository.findByEmail(email)
                      .orElseThrow(() -> new RuntimeException("User not found"));
        
        return userCourseRepository.findByUser(user)
                .stream()
                .map(UserCourse::getCourse)
                .collect(Collectors.toList());
    }
}