package com.example.demo.controller;

import com.example.demo.entity.Progress;
import com.example.demo.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping
    public ResponseEntity<?> saveProgress(@RequestBody Progress progress) {
        progressService.saveProgress(progress);
        return ResponseEntity.ok().body("{ \"message\": \"Bài học đã được đánh dấu hoàn thành.\" }");
    }
    
    // Endpoint mới để xem chi tiết tiến độ của khóa học dựa trên userId và courseId
    @GetMapping("/{userId}/{courseId}")
    public ResponseEntity<List<Progress>> getCourseProgress(@PathVariable Long userId,
                                                            @PathVariable Long courseId) {
        List<Progress> progressList = progressService.getProgressByUserAndCourse(userId, courseId);
        return ResponseEntity.ok(progressList);
    }
}