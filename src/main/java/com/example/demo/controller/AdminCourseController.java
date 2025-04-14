package com.example.demo.controller;

import com.example.demo.dto.CourseDTO;
import com.example.demo.dto.CreateCourseRequest;
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
import java.util.Map;

@RestController
@RequestMapping("/api/admin/courses")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminCourseController {
    private final CourseService courseService;
    private static final Logger logger = Logger.getLogger(AdminCourseController.class.getName());
    
    @Autowired
    public AdminCourseController(CourseService courseService) {
        this.courseService = courseService;
    }
    
    // API endpoint để test
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("API works!");
    }
    
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level) {
        logger.info("Getting all courses with filters: search=" + search + ", category=" + category + ", level=" + level);
        return ResponseEntity.ok(courseService.getAllCourses(search, category, level));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        logger.info("Getting course with id: " + id);
        return ResponseEntity.ok(courseService.getCourseById(id));
    }
    
    /**
     * API endpoint để tạo khóa học mới sử dụng JSON
     */
    @PostMapping(consumes = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CreateCourseRequest courseRequest) {
        logger.info("Creating course using JSON: " + courseRequest.getTitle());
        
        Course course = new Course();
        course.setTitle(courseRequest.getTitle());
        course.setDescription(courseRequest.getDescription());
        course.setVideoUrl(courseRequest.getVideoUrl());
        course.setInstructor(courseRequest.getInstructor());
        course.setDuration(courseRequest.getDuration());
        course.setLevel(courseRequest.getLevel());
        
        // Đảm bảo thumbnail không null
        if (courseRequest.getThumbnail() == null || courseRequest.getThumbnail().trim().isEmpty()) {
            course.setThumbnail("https://placehold.co/600x400?text=No+Image");
        } else {
            course.setThumbnail(courseRequest.getThumbnail());
        }
        
        if (courseRequest.getCategoryId() != null) {
            Category category = new Category();
            category.setId(courseRequest.getCategoryId());
            course.setCategory(category);
        }
        
        CourseDTO createdCourse = courseService.createCourse(course, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCourse);
    }

    /**
     * API endpoint xử lý multipart request khi có file
     */
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<CourseDTO> createCourseMultipart(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "videoUrl", required = false) String videoUrl,
            @RequestParam(value = "instructor", required = false) String instructor,
            @RequestParam(value = "duration", required = false) String duration,
            @RequestParam(value = "level", required = false) String level,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        
        logger.info("Creating course with multipart: " + title + " with categoryId: " + categoryId);
        
        Course course = new Course();
        course.setTitle(title);
        course.setDescription(description);
        course.setVideoUrl(videoUrl);
        course.setInstructor(instructor);
        course.setDuration(duration);
        course.setLevel(level);
        
        if (categoryId != null) {
            Category category = new Category();
            category.setId(categoryId);
            course.setCategory(category);
        }
        
        CourseDTO createdCourse = courseService.createCourse(course, thumbnail);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCourse);
    }
    
    /**
     * API endpoint để cập nhật khóa học - nhận JSON trực tiếp
     */
    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> updateCourse(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> requestBody) {
        
        logger.info("Updating course with id: " + id);
        
        Course course = new Course();
        course.setId(id);
        course.setTitle((String) requestBody.get("title"));
        course.setDescription((String) requestBody.get("description"));
        course.setVideoUrl((String) requestBody.get("videoUrl"));
        course.setInstructor((String) requestBody.get("instructor"));
        course.setDuration((String) requestBody.get("duration"));
        course.setLevel((String) requestBody.get("level"));
        course.setThumbnail((String) requestBody.get("thumbnail"));
        
        // Xử lý categoryId có thể đến từ JSON dưới dạng số hoặc string
        Object categoryIdObj = requestBody.get("categoryId");
        if (categoryIdObj != null) {
            Long categoryId;
            if (categoryIdObj instanceof Integer) {
                categoryId = ((Integer) categoryIdObj).longValue();
            } else if (categoryIdObj instanceof Long) {
                categoryId = (Long) categoryIdObj;
            } else if (categoryIdObj instanceof String) {
                try {
                    categoryId = Long.parseLong((String) categoryIdObj);
                } catch (NumberFormatException e) {
                    logger.warning("Invalid categoryId format: " + categoryIdObj);
                    categoryId = null;
                }
            } else {
                categoryId = null;
            }
            
            if (categoryId != null) {
                Category category = new Category();
                category.setId(categoryId);
                course.setCategory(category);
            }
        }
        
        CourseDTO updatedCourse = courseService.updateCourse(id, course);
        return ResponseEntity.ok(updatedCourse);
    }
    
    /**
     * API endpoint để xóa khóa học
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        logger.info("Deleting course with id: " + id);
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * API endpoint để đánh dấu khóa học là nổi bật
     */
    @PutMapping("/{id}/featured")
    public ResponseEntity<CourseDTO> toggleCourseFeatured(@PathVariable Long id) {
        logger.info("Toggling featured status for course with id: " + id);
        CourseDTO updatedCourse = courseService.toggleFeatured(id);
        return ResponseEntity.ok(updatedCourse);
    }
}