package com.example.demo.controller;

import com.example.demo.dto.CourseCreateRequest;
import com.example.demo.dto.CourseCreateResponse;
import com.example.demo.dto.CourseDto;
import com.example.demo.entity.Category;
import com.example.demo.entity.Course;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.CourseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/courses")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminCourseController {

    private final CourseRepository courseRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;

    public AdminCourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @PostMapping
    public ResponseEntity<CourseCreateResponse> createCourse(@RequestBody CourseCreateRequest request) {
        if (request.getTitle() == null || request.getTitle().isEmpty()) {
            return ResponseEntity.badRequest().body(new CourseCreateResponse("Fail"));
        }
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setThumbnail(request.getThumbnail());
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            course.setCategory(category);
        }
        
        course.setVideoUrl(request.getVideoUrl());
        courseRepository.save(course);
        return ResponseEntity.ok(new CourseCreateResponse("Success"));
    }

    @GetMapping
    public ResponseEntity<List<CourseDto>> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        List<CourseDto> courseDtos = courses.stream().map(course -> {
            CourseDto dto = new CourseDto();
            dto.setId(course.getId().longValue());
            dto.setTitle(course.getTitle());
            dto.setDescription(course.getDescription());
            dto.setThumbnail(course.getThumbnail());
            dto.setCategory(course.getCategory() != null ? course.getCategory().getName() : null);
            dto.setVideoUrl(course.getVideoUrl());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(courseDtos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseCreateResponse> updateCourse(@PathVariable Long id, @RequestBody CourseCreateRequest request) {
        Optional<Course> courseOptional = courseRepository.findById(id);
        if (!courseOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Course course = courseOptional.get();
        if (request.getTitle() != null && !request.getTitle().isEmpty()) {
            course.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }
        if (request.getThumbnail() != null) {
            course.setThumbnail(request.getThumbnail());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            course.setCategory(category);
        }
        if (request.getVideoUrl() != null) {
            course.setVideoUrl(request.getVideoUrl());
        }
        courseRepository.save(course);
        return ResponseEntity.ok(new CourseCreateResponse("Success"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<CourseCreateResponse> deleteCourse(@PathVariable Long id) {
        if (!courseRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        courseRepository.deleteById(id);
        return ResponseEntity.ok(new CourseCreateResponse("Success"));
    }

}