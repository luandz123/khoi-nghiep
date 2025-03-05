package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseResponse {
    private String message;
    private Long courseId;
}