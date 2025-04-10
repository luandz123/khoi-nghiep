package com.example.demo.controller;

import com.example.demo.dto.ChapterDTO;
import com.example.demo.service.ChapterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/public/chapters")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class PublicChapterController {
    
    private final ChapterService chapterService;
    
    public PublicChapterController(ChapterService chapterService) {
        this.chapterService = chapterService;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ChapterDTO> getChapterById(@PathVariable Long id) {
        return ResponseEntity.ok(chapterService.getChapterById(id));
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ChapterDTO>> getChaptersByCourse(
            @PathVariable Long courseId,
            Principal principal) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(chapterService.getChaptersByCourse(courseId, username));
    }
}