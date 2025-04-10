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
public class CourseDTO {
    private Long id;
    private String title;
    private String description;
    private String thumbnail;
    private String videoUrl;
    private String instructor;
    private String duration;
    private String level;
    private Integer studentsCount;
    private String category;
    private String categoryName;
    private Double rating;
    private Boolean featured;
    private Boolean enrolled;
    private Integer progress;
    private Integer chaptersCount;
    private Integer lessonsCount;
    private Integer completedLessons;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;
}