package com.example.demo.dto;

import lombok.Data;

@Data
public class PurchaseRequest {
    private Long userId;
    private Long courseId;
}