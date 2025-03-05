package com.example.demo.dto;

import lombok.Data;

@Data
public class CourseDto {
    private Long id;
    private String title;
    private String description;
    private String thumbnail;
    private String category;
    private String videoUrl; // Thêm trường videoUrl
}