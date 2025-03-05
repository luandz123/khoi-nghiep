package com.example.demo.controller;

import com.example.demo.dto.CourseDetailDto;
import com.example.demo.dto.LessonDto;
import com.example.demo.entity.Course;
import com.example.demo.entity.Lesson;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.LessonRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
public class CourseDetailController {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    public CourseDetailController(CourseRepository courseRepository, LessonRepository lessonRepository) {
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
    }

    @GetMapping("/{courseId}/detail")
    public ResponseEntity<CourseDetailDto> getCourseDetail(@PathVariable Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        List<Lesson> lessons = lessonRepository.findByCourseId(courseId);
        List<LessonDto> lessonDtos = lessons.stream().map(lesson -> {
            LessonDto dto = new LessonDto();
            dto.setLessonId(lesson.getId());
            dto.setTitle(lesson.getTitle());
            dto.setVideoUrl(lesson.getVideoUrl());
            return dto;
        }).collect(Collectors.toList());

        CourseDetailDto detailDto = new CourseDetailDto();
        detailDto.setTitle(course.getTitle());
        detailDto.setDescription(course.getDescription());
        
        detailDto.setThumbnail(course.getThumbnail());
        detailDto.setVideoUrl(course.getVideoUrl());

        return ResponseEntity.ok(detailDto);
    }
}