package com.example.demo.dto;

import lombok.Data;

@Data
public class CreateCourseRequest {
    private String title;
    private String description;
    private String videoUrl;
    private String instructor;
    private String duration;
    private String level;
    private Long categoryId;
    private String thumbnail; // Thêm trường thumbnail để nhận URL hình đại diện
}