package com.example.demo.dto;

import lombok.Data;

@Data
public class CourseCreateRequest {
    private String title;
    private String description;
    private String thumbnail;
    private Long categoryId; // Use this field exclusively to select the course category
    private String videoUrl;
}