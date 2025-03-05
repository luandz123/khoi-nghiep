package com.example.demo.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CourseRequest {
    private String title;
    private String description;
    private String youtubeUrl;
    private BigDecimal price;
}