package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {
    @NotBlank(message = "Product name is required")
    private String name;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be positive or zero")
    private BigDecimal price;

    @NotNull(message = "Original price is required")
    @PositiveOrZero(message = "Original price must be positive or zero")
    private BigDecimal originalPrice;

    @PositiveOrZero(message = "Discount must be positive or zero")
    private Integer discount;

    @NotBlank(message = "Type is required")
    private String type;

    @NotNull(message = "Stock is required")
    @PositiveOrZero(message = "Stock must be positive or zero")
    private Integer stock;

    @NotBlank(message = "Category is required")
    private String category;

    private String description;
}