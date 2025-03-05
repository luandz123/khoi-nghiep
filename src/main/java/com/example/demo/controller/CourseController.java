package com.example.demo.controller;

import com.example.demo.entity.Course;
import com.example.demo.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final CourseService courseService;
    
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }
    
    @GetMapping
    public ResponseEntity<List<Course>> getCourses() {
        List<Course> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }
    
    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<List<Course>> getCoursesByCategory(@PathVariable Long categoryId) {
        List<Course> courses = courseService.getCoursesByCategory(categoryId);
        return ResponseEntity.ok(courses);
    }
    
    // Endpoint lấy khóa học của chính user đang đăng nhập
    @GetMapping("/my-courses")
    public ResponseEntity<List<Course>> getMyCourses(Principal principal) {
        String username = principal.getName();
        List<Course> courses = courseService.getMyCourses(username);
        return ResponseEntity.ok(courses);
    }
    
    // Endpoint ghi danh (enroll) khóa học
    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<String> enrollCourse(@PathVariable Long courseId, Principal principal) {
        String username = principal.getName();
        courseService.enrollCourse(username, courseId);
        return ResponseEntity.ok("Đã ghi danh khóa học thành công");
    }
}