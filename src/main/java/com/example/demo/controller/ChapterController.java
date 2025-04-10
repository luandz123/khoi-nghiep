package com.example.demo.controller;

import com.example.demo.dto.ChapterDTO;
import com.example.demo.entity.Chapter;
import com.example.demo.service.ChapterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/chapters")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class ChapterController {
    private final ChapterService chapterService;
    
    public ChapterController(ChapterService chapterService) {
        this.chapterService = chapterService;
    }
    
    // Endpoint công khai - xem chi tiết chương
    @GetMapping("/{id}")
    public ResponseEntity<ChapterDTO> getChapterById(@PathVariable Long id) {
        return ResponseEntity.ok(chapterService.getChapterById(id));
    }
    
    // Endpoint công khai - xem danh sách chương theo khóa học
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ChapterDTO>> getChaptersByCourse(
            @PathVariable Long courseId,
            Principal principal) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(chapterService.getChaptersByCourse(courseId, username));
    }
    
    // Các endpoint admin chỉ người dùng có quyền ADMIN mới truy cập được
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ChapterDTO> createChapter(@RequestBody Chapter chapter) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(chapterService.createChapter(chapter));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ChapterDTO> updateChapter(
            @PathVariable Long id, 
            @RequestBody Chapter chapter) {
        return ResponseEntity.ok(chapterService.updateChapter(id, chapter));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteChapter(@PathVariable Long id) {
        chapterService.deleteChapter(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/reorder")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<ChapterDTO>> reorderChapters(
            @RequestBody List<Long> chapterIds) {
        return ResponseEntity.ok(chapterService.reorderChapters(chapterIds));
    }
}