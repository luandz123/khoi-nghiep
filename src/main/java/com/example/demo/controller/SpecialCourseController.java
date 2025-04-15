package com.example.demo.controller;

import com.example.demo.dto.CourseDTO;
import com.example.demo.service.CourseService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
public class SpecialCourseController {
    
    private final CourseService courseService;
    
    public SpecialCourseController(CourseService courseService) {
        this.courseService = courseService;
    }
    
    @GetMapping("/api/featured-courses")
    public ResponseEntity<List<CourseDTO>> getFeaturedCourses() {
        return ResponseEntity.ok(courseService.getFeaturedCourses());
    }
    
    @GetMapping("/api/new-courses")
    public ResponseEntity<List<CourseDTO>> getNewCourses(@RequestParam(defaultValue = "3") int limit) {
        return ResponseEntity.ok(courseService.getNewCourses(limit));
    }
    
    @GetMapping("/api/courses/my")
    public ResponseEntity<List<CourseDTO>> getMyCourses(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = principal.getName();
        return ResponseEntity.ok(courseService.getMyCourses(username));
    }
}