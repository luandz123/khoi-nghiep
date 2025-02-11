package com.example.demo.controller;

import com.example.demo.dto.CreateCourseRequest;
import com.example.demo.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final CourseService courseService;

    @PostMapping("/courses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCourse(@RequestBody CreateCourseRequest request) {
        courseService.createCourse(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Khóa học đã được thêm!");
        return ResponseEntity.ok(response);
    }
}