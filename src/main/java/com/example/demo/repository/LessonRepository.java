// filepath: /c:/Users/lenovo/OneDrive/Desktop/demo/src/main/java/com/example/demo/repository/LessonRepository.java
package com.example.demo.repository;

import com.example.demo.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByCourseId(Long courseId);
}