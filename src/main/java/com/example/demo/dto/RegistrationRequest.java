package com.example.demo.dto;

import lombok.Data;

@Data
public class RegistrationRequest {
    private Long userId;
    private Integer courseId;
}