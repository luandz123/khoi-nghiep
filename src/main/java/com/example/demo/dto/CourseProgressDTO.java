package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgressDTO {
    private Long courseId;
    private String courseTitle;
    private Integer percentComplete;
    private Integer completedLessons;
    private Integer totalLessons;
    private LocalDateTime lastAccessedAt;
}