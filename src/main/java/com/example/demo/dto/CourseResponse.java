package com.example.demo.dto;

import lombok.Data;

@Data
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private String videoUrl;
}