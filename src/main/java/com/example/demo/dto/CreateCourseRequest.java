package com.example.demo.dto;

import lombok.Data;

@Data
public class CreateCourseRequest {
    private String title;
    private String description;
    private String videoUrl;
    
}