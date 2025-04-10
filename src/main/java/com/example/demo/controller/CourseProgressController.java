package com.example.demo.controller;

import com.example.demo.dto.CourseProgressDTO;
import com.example.demo.service.ProgressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class CourseProgressController {
    private final ProgressService progressService;
    
    public CourseProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }
    
    @GetMapping
    public ResponseEntity<List<CourseProgressDTO>> getUserCourseProgress(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Long userId = getUserId(principal.getName());
        return ResponseEntity.ok(progressService.getUserCourseProgress(userId));
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<CourseProgressDTO> getCourseProgress(
            @PathVariable Long courseId,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Long userId = getUserId(principal.getName());
        return ResponseEntity.ok(progressService.getCourseProgress(userId, courseId));
    }
    
    @PostMapping("/course/{courseId}/reset")
    public ResponseEntity<Void> resetCourseProgress(
            @PathVariable Long courseId,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        Long userId = getUserId(principal.getName());
        progressService.resetUserCourseProgress(userId, courseId);
        return ResponseEntity.ok().build();
    }
    
    // Phương thức tiện ích để lấy userId từ username
    private Long getUserId(String username) {
        // TODO: Cài đặt phương thức lấy userId từ username
        // Đây là phương thức giả định, bạn cần triển khai theo hệ thống của mình
        return 1L; // Giá trị mặc định
    }
}