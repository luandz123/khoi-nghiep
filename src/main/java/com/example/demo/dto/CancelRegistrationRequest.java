package com.example.demo.dto;

import lombok.Data;

@Data
public class CancelRegistrationRequest {
    private Long userId;
    private Integer courseId;
}