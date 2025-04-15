package com.example.demo.controller;

import com.example.demo.dto.CourseDTO;
import com.example.demo.entity.Course;
import com.example.demo.entity.Category;
import com.example.demo.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/admin/courses")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminCourseController {
    private static final Logger logger = Logger.getLogger(AdminCourseController.class.getName());
    
    private final CourseService courseService;

    @Autowired
    public AdminCourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        List<CourseDTO> courses = courseService.getAllCourses(null, null, null);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        CourseDTO course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    /**
     * API endpoint để tạo khóa học mới - hỗ trợ multipart/form-data để upload thumbnail
     */
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<CourseDTO> createCourseWithMultipart(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "videoUrl", required = false) String videoUrl,
            @RequestParam(value = "instructor", required = false) String instructor,
            @RequestParam(value = "duration", required = false) String duration,
            @RequestParam(value = "level", required = false) String level,
            @RequestParam(value = "featured", required = false) Boolean featured,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam(value = "thumbnailUrl", required = false) String thumbnailUrl) {
        
        logger.info("Tạo khóa học mới: " + title + " với categoryId: " + categoryId);
        
        Course course = new Course();
        course.setTitle(title);
        course.setDescription(description);
        course.setVideoUrl(videoUrl);
        course.setInstructor(instructor);
        course.setDuration(duration);
        course.setLevel(level);
        course.setFeatured(featured != null ? featured : false);
        
        // Nếu không có file nhưng có URL
        if ((thumbnail == null || thumbnail.isEmpty()) && thumbnailUrl != null && !thumbnailUrl.isEmpty()) {
            course.setThumbnail(thumbnailUrl);
        }
        
        // Xử lý category
        if (categoryId != null) {
            Category category = new Category();
            category.setId(categoryId);
            course.setCategory(category);
        }
        
        CourseDTO createdCourse = courseService.createCourse(course, thumbnail);
        return new ResponseEntity<>(createdCourse, HttpStatus.CREATED);
    }

    /**
     * API endpoint để cập nhật khóa học - nhận multipart/form-data
     */
    @PutMapping(value = "/{id}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<CourseDTO> updateCourseWithMultipart(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "videoUrl", required = false) String videoUrl,
            @RequestParam(value = "instructor", required = false) String instructor,
            @RequestParam(value = "duration", required = false) String duration,
            @RequestParam(value = "level", required = false) String level,
            @RequestParam(value = "featured", required = false) Boolean featured,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam(value = "thumbnailUrl", required = false) String thumbnailUrl) {
        
        logger.info("Cập nhật khóa học - ID: " + id + ", title: " + title);
        
        Course course = new Course();
        course.setId(id);
        course.setTitle(title);
        course.setDescription(description);
        course.setVideoUrl(videoUrl);
        course.setInstructor(instructor);
        course.setDuration(duration);
        course.setLevel(level);
        course.setFeatured(featured != null ? featured : false);
        
        // Nếu không có file nhưng có URL
        if ((thumbnail == null || thumbnail.isEmpty()) && thumbnailUrl != null && !thumbnailUrl.isEmpty()) {
            course.setThumbnail(thumbnailUrl);
        }
        
        // Xử lý category
        if (categoryId != null) {
            Category category = new Category();
            category.setId(categoryId);
            course.setCategory(category);
        }
        
        CourseDTO updatedCourse = courseService.updateCourse(id, course, thumbnail);
        return ResponseEntity.ok(updatedCourse);
    }

    /**
     * API endpoint để cập nhật khóa học - nhận JSON (giữ lại cho tương thích)
     */
    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long id, @RequestBody Course course) {
        logger.info("Updating course with JSON - ID: " + id);
        CourseDTO updatedCourse = courseService.updateCourse(id, course);
        return ResponseEntity.ok(updatedCourse);
    }

    /**
     * API endpoint để xóa khóa học
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * API endpoint để chuyển đổi trạng thái nổi bật của khóa học
     */
    @PutMapping("/{id}/featured")
    public ResponseEntity<CourseDTO> toggleFeatured(@PathVariable Long id) {
        CourseDTO course = courseService.toggleFeatured(id);
        return ResponseEntity.ok(course);
    }
}