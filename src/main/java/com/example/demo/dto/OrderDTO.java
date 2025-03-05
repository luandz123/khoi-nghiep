package com.example.demo.dto;

import com.example.demo.entity.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OrderDTO {
    private Long id;
    private String customerName;
    private OrderStatus status;
    private LocalDateTime createdAt;
}