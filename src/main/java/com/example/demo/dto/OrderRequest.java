package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    @NotBlank(message = "Tên khách hàng không được để trống")
    private String customerName;
    
    @NotBlank(message = "Email khách hàng không được để trống")
    @Email(message = "Email không hợp lệ")
    private String customerEmail;
    
    @NotNull(message = "Tổng tiền không được để trống")
    private BigDecimal totalPrice;
    
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;
    
    @NotEmpty(message = "Đơn hàng phải có ít nhất một sản phẩm")
    private List<OrderItemRequest> items;
}