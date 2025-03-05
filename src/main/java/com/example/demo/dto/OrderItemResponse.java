package com.example.demo.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemResponse {
    private Long productId;
    private String name;
    private Integer quantity;
    private BigDecimal price;
}