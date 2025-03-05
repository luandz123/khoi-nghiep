package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class CourseDetailDto {
    private String title;
    private String description;
    
    private String thumbnail;
    private String videoUrl;
}