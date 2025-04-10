package com.example.demo.service;

import com.example.demo.dto.CourseProgressDTO;
import com.example.demo.entity.Course;
import com.example.demo.entity.CourseProgress;
import com.example.demo.entity.User;
import com.example.demo.repository.CourseProgressRepository;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.LessonCompletionRepository;
import com.example.demo.repository.LessonRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgressService {
    private final CourseProgressRepository courseProgressRepository;
    private final LessonCompletionRepository lessonCompletionRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    
    public ProgressService(CourseProgressRepository courseProgressRepository,
                          LessonCompletionRepository lessonCompletionRepository,
                          CourseRepository courseRepository,
                          LessonRepository lessonRepository,
                          UserRepository userRepository) {
        this.courseProgressRepository = courseProgressRepository;
        this.lessonCompletionRepository = lessonCompletionRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.userRepository = userRepository;
    }
    
    // Phương thức mới hỗ trợ username
    public CourseProgressDTO getCourseProgress(String username, Long courseId) {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return getCourseProgress(user.getId(), courseId);
    }
    
    // Phương thức mới hỗ trợ username
    public List<CourseProgressDTO> getUserCourseProgress(String username) {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return getUserCourseProgress(user.getId());
    }
    
    // Phương thức mới hỗ trợ username
    public void resetUserCourseProgress(String username, Long courseId) {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        resetUserCourseProgress(user.getId(), courseId);
    }
    
    // Phương thức gốc với userId
    public List<CourseProgressDTO> getUserCourseProgress(Long userId) {
        List<CourseProgress> progressList = courseProgressRepository.findByUserId(userId);
        
        return progressList.stream().map(progress -> {
            Course course = progress.getCourse();
            
            // Đếm số bài học đã hoàn thành và tổng số bài học
            long completedLessons = lessonCompletionRepository
                .countCompletedLessonsByCourseAndUser(userId, course.getId());
            
            long totalLessons = lessonCompletionRepository
                .findLessonIdsByCourseId(course.getId()).size();
            
            return CourseProgressDTO.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .percentComplete(progress.getPercentComplete())
                .lastAccessedAt(progress.getLastAccessedAt())
                .completedLessons((int) completedLessons)
                .totalLessons((int) totalLessons)
                .build();
        }).collect(Collectors.toList());
    }
    
    // Phương thức gốc với userId
    public CourseProgressDTO getCourseProgress(Long userId, Long courseId) {
        // Kiểm tra khóa học tồn tại
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        
        // Lấy tiến độ nếu có
        CourseProgress progress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
            .orElse(null);
        
        // Đếm số bài học đã hoàn thành và tổng số bài học
        long completedLessons = lessonCompletionRepository
            .countCompletedLessonsByCourseAndUser(userId, courseId);
        
        List<Long> lessonIds = lessonCompletionRepository.findLessonIdsByCourseId(courseId);
        int totalLessons = lessonIds.size();
        
        // Tính phần trăm hoàn thành
        int percentComplete = totalLessons > 0 ? (int) ((completedLessons * 100) / totalLessons) : 0;
        
        return CourseProgressDTO.builder()
            .courseId(course.getId())
            .courseTitle(course.getTitle())
            .percentComplete(progress != null ? progress.getPercentComplete() : percentComplete)
            .lastAccessedAt(progress != null ? progress.getLastAccessedAt() : null)
            .completedLessons((int) completedLessons)
            .totalLessons(totalLessons)
            .build();
    }
    
    // Phương thức gốc với userId
    public void resetUserCourseProgress(Long userId, Long courseId) {
        // Kiểm tra khóa học tồn tại
        courseRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        
        // Xóa tất cả bản ghi hoàn thành bài học của người dùng trong khóa học
        List<Long> lessonIds = lessonCompletionRepository.findLessonIdsByCourseId(courseId);
        
        for (Long lessonId : lessonIds) {
            lessonCompletionRepository.findByUserIdAndLessonId(userId, lessonId)
                .ifPresent(lessonCompletionRepository::delete);
        }
        
        // Xóa bản ghi tiến độ khóa học
        courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
            .ifPresent(courseProgressRepository::delete);
    }
}