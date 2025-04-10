
package com.example.demo.repository;

import com.example.demo.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    
    List<Lesson> findByChapterIdOrderByOrder(Long chapterId);
    
    // Using JPQL to find lessons by course ID through the chapter relationship
    @Query("SELECT l FROM Lesson l WHERE l.chapter.course.id = :courseId ORDER BY l.chapter.order, l.order")
    List<Lesson> findByCourseId(@Param("courseId") Long courseId);
    
    // If needed, implement a method to find completed lessons by user and course
    @Query("SELECT l FROM Lesson l JOIN l.chapter c WHERE c.course.id = :courseId")
    List<Lesson> findLessonsByCourseId(@Param("courseId") Long courseId);
}