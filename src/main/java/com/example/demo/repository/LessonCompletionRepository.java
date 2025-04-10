package com.example.demo.repository;

import com.example.demo.entity.LessonCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LessonCompletionRepository extends JpaRepository<LessonCompletion, Long> {
    List<LessonCompletion> findByUserIdAndLessonChapterCourseId(Long userId, Long courseId);
    
    boolean existsByUserIdAndLessonId(Long userId, Long lessonId);
    
    Optional<LessonCompletion> findByUserIdAndLessonId(Long userId, Long lessonId);
    
    @Query("SELECT COUNT(lc) FROM LessonCompletion lc WHERE lc.user.id = :userId AND lc.lesson.chapter.course.id = :courseId")
    long countCompletedLessonsByCourseAndUser(@Param("userId") Long userId, @Param("courseId") Long courseId);
    
    @Query("SELECT l.id FROM Lesson l WHERE l.chapter.course.id = :courseId")
    List<Long> findLessonIdsByCourseId(@Param("courseId") Long courseId);
}