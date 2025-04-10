package com.example.demo.controller;

import com.example.demo.dto.LessonDTO;
import com.example.demo.entity.Lesson;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.LessonService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class LessonController {
    
    private final LessonService lessonService;
    private final UserRepository userRepository;
    
    public LessonController(LessonService lessonService, UserRepository userRepository) {
        this.lessonService = lessonService;
        this.userRepository = userRepository;
    }
    
    // Endpoint công khai - xem danh sách bài học theo chương
    @GetMapping("/chapter/{chapterId}")
    public ResponseEntity<List<LessonDTO>> getLessonsByChapter(@PathVariable Long chapterId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;
        
        // Lấy userId nếu đã đăng nhập
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getPrincipal().equals("anonymousUser")) {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user != null) {
                userId = user.getId();
            }
        }
        
        List<LessonDTO> lessons = lessonService.getLessonsByChapter(chapterId, userId);
        return ResponseEntity.ok(lessons);
    }
    
    // Endpoint công khai - xem chi tiết bài học
    @GetMapping("/{lessonId}")
    public ResponseEntity<LessonDTO> getLessonDetail(@PathVariable Long lessonId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;
        
        // Lấy userId nếu đã đăng nhập
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getPrincipal().equals("anonymousUser")) {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                .orElse(null);
            
            if (user != null) {
                userId = user.getId();
            }
        }
        
        LessonDTO lesson = lessonService.getLessonDetail(lessonId, userId);
        return ResponseEntity.ok(lesson);
    }
    
    // Chỉ admin mới có thể tạo bài học mới
    @PostMapping("/chapter/{chapterId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<LessonDTO> createLesson(@PathVariable Long chapterId, 
                                                @RequestBody Lesson lesson) {
        LessonDTO createdLesson = lessonService.createLesson(chapterId, lesson);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdLesson);
    }
    
    // Chỉ admin mới có thể cập nhật bài học
    @PutMapping("/{lessonId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<LessonDTO> updateLesson(@PathVariable Long lessonId, 
                                               @RequestBody Lesson lesson) {
        LessonDTO updatedLesson = lessonService.updateLesson(lessonId, lesson);
        return ResponseEntity.ok(updatedLesson);
    }
    
    // Chỉ admin mới có thể xóa bài học
    @DeleteMapping("/{lessonId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long lessonId) {
        lessonService.deleteLesson(lessonId);
        return ResponseEntity.noContent().build();
    }
    
    // User đã đăng nhập có thể đánh dấu bài học đã hoàn thành
    @PostMapping("/{lessonId}/complete")
    public ResponseEntity<Void> markLessonAsCompleted(@PathVariable Long lessonId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        lessonService.markLessonAsCompleted(lessonId, user.getId());
        return ResponseEntity.ok().build();
    }
}