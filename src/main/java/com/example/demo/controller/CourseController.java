package com.example.demo.controller;

import com.example.demo.dto.ChapterDTO;
import com.example.demo.dto.CourseDTO;
import com.example.demo.dto.CourseProgressDTO;
import com.example.demo.dto.EnrollmentResponseDTO;
import com.example.demo.entity.Course;
import com.example.demo.service.ChapterService;
import com.example.demo.service.CourseService;
import com.example.demo.service.ProgressService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final CourseService courseService;
    private final ChapterService chapterService;
    private final ProgressService progressService;
    
    public CourseController(
            CourseService courseService, 
            ChapterService chapterService, 
            ProgressService progressService) {
        this.courseService = courseService;
        this.chapterService = chapterService;
        this.progressService = progressService;
    }
    
    //     @GetMapping("/new")
    // public ResponseEntity<List<CourseDTO>> getNewCourses(@RequestParam(defaultValue = "3") int limit) {
    //     return ResponseEntity.ok(courseService.getNewCourses(limit));
    // }
    
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getCourses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level) {
        return ResponseEntity.ok(courseService.getAllCourses(search, category, level));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }
    
    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(courseService.getCoursesByCategory(categoryId));
    }
    
    // @GetMapping("/featured")
    // public ResponseEntity<List<CourseDTO>> getFeaturedCourses() {
    //     return ResponseEntity.ok(courseService.getFeaturedCourses());
    // }
    
    @GetMapping("/my-courses")
    public ResponseEntity<List<CourseDTO>> getMyCourses(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = principal.getName();
        return ResponseEntity.ok(courseService.getMyCourses(username));
    }
    
    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<EnrollmentResponseDTO> enrollCourse(
            @PathVariable Long courseId, 
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = principal.getName();
        EnrollmentResponseDTO response = courseService.enrollCourse(username, courseId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{courseId}/chapters")
    public ResponseEntity<List<ChapterDTO>> getCourseChapters(
            @PathVariable Long courseId,
            Principal principal) {
        String username = principal != null ? principal.getName() : null;
        return ResponseEntity.ok(chapterService.getChaptersByCourse(courseId, username));
    }
    
    @GetMapping("/{courseId}/progress")
    public ResponseEntity<CourseProgressDTO> getCourseProgress(
            @PathVariable Long courseId, 
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = principal.getName();
        return ResponseEntity.ok(progressService.getCourseProgress(username, courseId));
    }
    
    @PostMapping("/{courseId}/reset-progress")
    public ResponseEntity<CourseProgressDTO> resetCourseProgress(
            @PathVariable Long courseId, 
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = principal.getName();
        progressService.resetUserCourseProgress(username, courseId);
        return ResponseEntity.ok(progressService.getCourseProgress(username, courseId));
    }
    
    @GetMapping("/enrollment-status/{courseId}")
    public ResponseEntity<Boolean> checkEnrollmentStatus(
            @PathVariable Long courseId,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.ok(false);
        }
        String username = principal.getName();
        boolean isEnrolled = courseService.isUserEnrolledInCourse(username, courseId);
        return ResponseEntity.ok(isEnrolled);
    }
}